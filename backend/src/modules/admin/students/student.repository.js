const pool = require("../../../config/database");

async function writeAudit(client, adminId, action, entityId, details = {}) {
  await client.query(
    `INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, 'student', $3, $4::jsonb)`,
    [adminId, action, entityId, JSON.stringify(details)]
  );
}

async function listStudents(filters) {
  const conditions = ["u.role = 'student'"];
  const values = [];
  const add = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  };

  if (filters.status === "active") conditions.push("u.is_active = TRUE");
  if (filters.status === "inactive") conditions.push("u.is_active = FALSE");
  if (filters.search) {
    add("(u.full_name ILIKE ? OR u.email ILIKE ?)", `%${filters.search}%`);
    // The condition above contains two placeholders. Bind the second one explicitly.
    values.push(`%${filters.search}%`);
    conditions[conditions.length - 1] = `(u.full_name ILIKE $${values.length - 1} OR u.email ILIKE $${values.length})`;
  }
  if (filters.institutionId) {
    add(
      `EXISTS (SELECT 1 FROM student_institutions si
       WHERE si.student_id = u.id AND si.institution_id = ?)`,
      filters.institutionId
    );
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM users u ${where}`,
    values
  );
  const total = countResult.rows[0].total;
  const offset = (filters.page - 1) * filters.limit;
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at,
            (SELECT COUNT(*)::int FROM student_institutions si
             WHERE si.student_id = u.id AND si.membership_status = 'active') AS active_institution_count,
            COALESCE((SELECT sg.total_xp FROM student_gamification sg
                      WHERE sg.student_id = u.id), 0) AS total_xp,
            COALESCE((SELECT sg.level FROM student_gamification sg
                      WHERE sg.student_id = u.id), 1) AS level
     FROM users u ${where}
     ORDER BY u.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, filters.limit, offset]
  );

  return {
    items: result.rows,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
}

async function getStudentById(studentId) {
  const studentResult = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at,
            COALESCE(sg.total_xp, 0) AS total_xp,
            COALESCE(sg.level, 1) AS level,
            COALESCE(sg.current_streak, 0) AS current_streak,
            COALESCE(sg.longest_streak, 0) AS longest_streak,
            sg.last_activity_date
     FROM users u
     LEFT JOIN student_gamification sg ON sg.student_id = u.id
     WHERE u.id = $1 AND u.role = 'student'`,
    [studentId]
  );
  if (!studentResult.rows[0]) return null;

  const membershipResult = await pool.query(
    `SELECT si.institution_id, i.name AS institution_name,
            i.institution_type, i.is_active AS institution_is_active,
            si.membership_status, si.student_identifier,
            si.department, si.course_or_program, si.academic_year, si.joined_at
     FROM student_institutions si
     JOIN institutions i ON i.id = si.institution_id
     WHERE si.student_id = $1
     ORDER BY si.joined_at DESC`,
    [studentId]
  );

  const attemptsResult = await pool.query(
    `SELECT COUNT(*)::int AS total_attempts,
            COUNT(*) FILTER (WHERE status IN ('submitted', 'auto_submitted'))::int AS completed_attempts
     FROM exam_attempts
     WHERE student_id = $1`,
    [studentId]
  );

  return {
    ...studentResult.rows[0],
    institutions: membershipResult.rows,
    attempts: attemptsResult.rows[0]
  };
}

async function updateStudentStatus(studentId, isActive, adminId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE users SET is_active = $1, updated_at = NOW()
       WHERE id = $2 AND role = 'student'
       RETURNING id, full_name, email, is_active, updated_at`,
      [isActive, studentId]
    );
    const student = result.rows[0] || null;
    if (!student) {
      await client.query("ROLLBACK");
      return null;
    }

    if (!isActive) {
      await client.query(
        `UPDATE user_sessions SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [studentId]
      );
    }

    await writeAudit(
      client,
      adminId,
      isActive ? "student.activated" : "student.deactivated",
      studentId,
      { isActive }
    );
    await client.query("COMMIT");
    return student;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function assignInstitution(studentId, institutionId, data, adminId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const studentResult = await client.query(
      `SELECT id FROM users WHERE id = $1 AND role = 'student' AND is_active = TRUE FOR UPDATE`,
      [studentId]
    );
    if (!studentResult.rows[0]) {
      const error = new Error("Active student not found.");
      error.statusCode = 404;
      throw error;
    }

    const institutionResult = await client.query(
      `SELECT id FROM institutions WHERE id = $1 AND is_active = TRUE FOR UPDATE`,
      [institutionId]
    );
    if (!institutionResult.rows[0]) {
      const error = new Error("Active institution not found.");
      error.statusCode = 404;
      throw error;
    }

    const result = await client.query(
      `INSERT INTO student_institutions
         (student_id, institution_id, membership_status, student_identifier,
          department, course_or_program, academic_year)
       VALUES ($1, $2, 'active', $3, $4, $5, $6)
       ON CONFLICT (student_id, institution_id) DO UPDATE SET
         membership_status = 'active',
         student_identifier = EXCLUDED.student_identifier,
         department = EXCLUDED.department,
         course_or_program = EXCLUDED.course_or_program,
         academic_year = EXCLUDED.academic_year
       RETURNING student_id, institution_id, membership_status,
                 student_identifier, department, course_or_program, academic_year, joined_at`,
      [
        studentId,
        institutionId,
        data.studentIdentifier ?? null,
        data.department ?? null,
        data.courseOrProgram ?? null,
        data.academicYear ?? null
      ]
    );

    await writeAudit(client, adminId, "student.institution_assigned", studentId, {
      institutionId,
      membershipStatus: "active"
    });
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function updateMembershipStatus(studentId, institutionId, membershipStatus, adminId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE student_institutions
       SET membership_status = $3
       WHERE student_id = $1 AND institution_id = $2
       RETURNING student_id, institution_id, membership_status,
                 student_identifier, department, course_or_program, academic_year, joined_at`,
      [studentId, institutionId, membershipStatus]
    );
    const membership = result.rows[0] || null;
    if (!membership) {
      await client.query("ROLLBACK");
      return null;
    }
    await writeAudit(client, adminId, "student.institution_membership_updated", studentId, {
      institutionId,
      membershipStatus
    });
    await client.query("COMMIT");
    return membership;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  listStudents,
  getStudentById,
  updateStudentStatus,
  assignInstitution,
  updateMembershipStatus
};
