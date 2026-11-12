const pool = require("../../config/database");

async function listForStudent(studentId, filters) {
  const conditions = [
    "recipient_id = $1",
    "(expires_at IS NULL OR expires_at > NOW())"
  ];
  const values = [studentId];

  if (filters.unreadOnly) {
    conditions.push("read_at IS NULL");
  }

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`notification_type = $${values.length}`);
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM notifications
     WHERE ${whereClause}`,
    values
  );

  const unreadResult = await pool.query(
    `SELECT COUNT(*)::int AS unread_count
     FROM notifications
     WHERE recipient_id = $1
       AND read_at IS NULL
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [studentId]
  );

  const offset = (filters.page - 1) * filters.limit;
  const listValues = [...values, filters.limit, offset];

  const result = await pool.query(
    `SELECT id, batch_id, notification_type, title, message, payload,
            read_at, created_at, expires_at
     FROM notifications
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${listValues.length - 1}
     OFFSET $${listValues.length}`,
    listValues
  );

  return {
    items: result.rows.map((row) => ({
      ...row,
      isRead: Boolean(row.read_at)
    })),
    unreadCount: unreadResult.rows[0].unread_count,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / filters.limit)
    }
  };
}

async function getUnreadCount(studentId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS unread_count
     FROM notifications
     WHERE recipient_id = $1
       AND read_at IS NULL
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [studentId]
  );

  return result.rows[0].unread_count;
}

async function markAsRead(studentId, notificationId) {
  const result = await pool.query(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND recipient_id = $2
     RETURNING id, read_at`,
    [notificationId, studentId]
  );

  return result.rows[0] || null;
}

async function markAllAsRead(studentId) {
  const result = await pool.query(
    `UPDATE notifications
     SET read_at = NOW()
     WHERE recipient_id = $1
       AND read_at IS NULL
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [studentId]
  );

  return result.rowCount;
}

async function deleteForStudent(studentId, notificationId) {
  const result = await pool.query(
    `DELETE FROM notifications
     WHERE id = $1 AND recipient_id = $2
     RETURNING id`,
    [notificationId, studentId]
  );

  return result.rows[0] || null;
}

async function sendToStudent(data) {
  const result = await pool.query(
    `INSERT INTO notifications
       (batch_id, recipient_id, created_by, notification_type,
        title, message, payload, expires_at)
     SELECT $1, u.id, $2, $3, $4, $5, $6::jsonb, $7::timestamptz
     FROM users u
     WHERE u.id = $8
       AND u.role = 'student'
       AND u.is_active = TRUE
     RETURNING id`,
    [
      data.batchId,
      data.createdBy,
      data.type,
      data.title,
      data.message,
      JSON.stringify(data.payload || {}),
      data.expiresAt || null,
      data.studentId
    ]
  );

  return result.rowCount;
}

async function sendToAllStudents(data) {
  const result = await pool.query(
    `INSERT INTO notifications
       (batch_id, recipient_id, created_by, notification_type,
        title, message, payload, expires_at)
     SELECT $1, u.id, $2, $3, $4, $5, $6::jsonb, $7::timestamptz
     FROM users u
     WHERE u.role = 'student'
       AND u.is_active = TRUE
     RETURNING id`,
    [
      data.batchId,
      data.createdBy,
      data.type,
      data.title,
      data.message,
      JSON.stringify(data.payload || {}),
      data.expiresAt || null
    ]
  );

  return result.rowCount;
}

async function listAdminBatches(adminId, filters) {
  const conditions = ["created_by = $1"];
  const values = [adminId];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`notification_type = $${values.length}`);
  }

  const whereClause = conditions.join(" AND ");
  const countResult = await pool.query(
    `SELECT COUNT(DISTINCT batch_id)::int AS total
     FROM notifications
     WHERE ${whereClause}`,
    values
  );

  const offset = (filters.page - 1) * filters.limit;
  const listValues = [...values, filters.limit, offset];

  const result = await pool.query(
    `SELECT
       batch_id,
       MIN(notification_type) AS type,
       MIN(title) AS title,
       MIN(message) AS message,
       MIN(created_at) AS created_at,
       MIN(expires_at) AS expires_at,
       COUNT(*)::int AS recipient_count,
       COUNT(*) FILTER (WHERE read_at IS NOT NULL)::int AS read_count,
       COUNT(*) FILTER (WHERE read_at IS NULL)::int AS unread_count
     FROM notifications
     WHERE ${whereClause}
     GROUP BY batch_id
     ORDER BY MIN(created_at) DESC
     LIMIT $${listValues.length - 1}
     OFFSET $${listValues.length}`,
    listValues
  );

  return {
    items: result.rows,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / filters.limit)
    }
  };
}

async function getAdminBatch(adminId, batchId) {
  const result = await pool.query(
    `SELECT
       batch_id,
       MIN(notification_type) AS type,
       MIN(title) AS title,
       MIN(message) AS message,
       MIN(created_at) AS created_at,
       MIN(expires_at) AS expires_at,
       COUNT(*)::int AS recipient_count,
       COUNT(*) FILTER (WHERE read_at IS NOT NULL)::int AS read_count,
       COUNT(*) FILTER (WHERE read_at IS NULL)::int AS unread_count
     FROM notifications
     WHERE created_by = $1 AND batch_id = $2
     GROUP BY batch_id`,
    [adminId, batchId]
  );

  return result.rows[0] || null;
}

async function listBatchRecipients(adminId, batchId, filters) {
  const conditions = ["n.created_by = $1", "n.batch_id = $2"];
  const values = [adminId, batchId];

  if (filters.status === "read") {
    conditions.push("n.read_at IS NOT NULL");
  } else if (filters.status === "unread") {
    conditions.push("n.read_at IS NULL");
  }

  const whereClause = conditions.join(" AND ");
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM notifications n
     WHERE ${whereClause}`,
    values
  );

  const offset = (filters.page - 1) * filters.limit;
  const listValues = [...values, filters.limit, offset];

  const result = await pool.query(
    `SELECT n.id, n.recipient_id, u.full_name, u.email,
            n.read_at, n.created_at
     FROM notifications n
     JOIN users u ON u.id = n.recipient_id
     WHERE ${whereClause}
     ORDER BY n.created_at DESC
     LIMIT $${listValues.length - 1}
     OFFSET $${listValues.length}`,
    listValues
  );

  return {
    items: result.rows.map((row) => ({
      ...row,
      isRead: Boolean(row.read_at)
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / filters.limit)
    }
  };
}

async function createForUser(data, db = pool) {
  const result = await db.query(
    `INSERT INTO notifications
       (batch_id, recipient_id, created_by, notification_type,
        title, message, payload, expires_at)
     VALUES
       (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7::jsonb, $8::timestamptz)
     RETURNING id, batch_id, recipient_id, notification_type,
               title, message, payload, created_at`,
    [
      data.batchId || null,
      data.recipientId,
      data.createdBy || null,
      data.type || "general",
      data.title,
      data.message,
      JSON.stringify(data.payload || {}),
      data.expiresAt || null
    ]
  );

  return result.rows[0];
}

async function createForUsers(data, db = pool) {
  const result = await db.query(
    `INSERT INTO notifications
       (batch_id, recipient_id, created_by, notification_type,
        title, message, payload, expires_at)
     SELECT COALESCE($1::uuid, gen_random_uuid()), recipient_id,
            $2, $3, $4, $5, $6::jsonb, $7::timestamptz
     FROM unnest($8::uuid[]) AS recipient_id
     RETURNING id`,
    [
      data.batchId || null,
      data.createdBy || null,
      data.type || "general",
      data.title,
      data.message,
      JSON.stringify(data.payload || {}),
      data.expiresAt || null,
      data.recipientIds
    ]
  );

  return result.rowCount;
}

module.exports = {
  listForStudent,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteForStudent,
  sendToStudent,
  sendToAllStudents,
  listAdminBatches,
  getAdminBatch,
  listBatchRecipients,
  createForUser,
  createForUsers
};
