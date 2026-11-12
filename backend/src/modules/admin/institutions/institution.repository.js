const pool = require("../../../config/database");

async function writeAudit(client, adminId, action, entityId, details = {}) {
  await client.query(
    `INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, 'institution', $3, $4::jsonb)`,
    [adminId, action, entityId, JSON.stringify(details)]
  );
}

async function createInstitution(data, adminId, codeHash) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO institutions
         (name, institution_type, institution_code_hash, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, institution_type, is_active, created_at, updated_at`,
      [data.name, data.institutionType ?? null, codeHash, adminId]
    );
    const institution = result.rows[0];
    await writeAudit(client, adminId, "institution.created", institution.id, {
      name: institution.name,
      institutionType: institution.institution_type
    });
    await client.query("COMMIT");
    return institution;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function listInstitutions(filters) {
  const conditions = [];
  const values = [];
  const add = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  };

  if (filters.status === "active") conditions.push("i.is_active = TRUE");
  if (filters.status === "inactive") conditions.push("i.is_active = FALSE");
  if (filters.search) add("i.name ILIKE ?", `%${filters.search}%`);

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM institutions i ${where}`,
    values
  );
  const total = countResult.rows[0].total;
  const offset = (filters.page - 1) * filters.limit;
  const result = await pool.query(
    `SELECT i.id, i.name, i.institution_type, i.is_active,
            i.created_at, i.updated_at,
            (SELECT COUNT(*)::int FROM student_institutions si
             WHERE si.institution_id = i.id AND si.membership_status = 'active') AS active_student_count,
            (SELECT COUNT(*)::int FROM student_institutions si
             WHERE si.institution_id = i.id) AS total_student_count
     FROM institutions i ${where}
     ORDER BY i.created_at DESC
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

async function getInstitutionById(institutionId) {
  const result = await pool.query(
    `SELECT i.id, i.name, i.institution_type, i.is_active,
            i.created_by, i.created_at, i.updated_at,
            (SELECT COUNT(*)::int FROM student_institutions si
             WHERE si.institution_id = i.id AND si.membership_status = 'active') AS active_student_count,
            (SELECT COUNT(*)::int FROM student_institutions si
             WHERE si.institution_id = i.id) AS total_student_count
     FROM institutions i
     WHERE i.id = $1`,
    [institutionId]
  );
  return result.rows[0] || null;
}

async function updateInstitution(institutionId, data, adminId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const fields = [];
    const values = [];
    const mappings = {
      name: "name",
      institutionType: "institution_type",
      isActive: "is_active"
    };
    for (const [key, column] of Object.entries(mappings)) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        values.push(data[key]);
        fields.push(`${column} = $${values.length}`);
      }
    }
    fields.push("updated_at = NOW()");
    values.push(institutionId);
    const result = await client.query(
      `UPDATE institutions SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, name, institution_type, is_active, created_at, updated_at`,
      values
    );
    const institution = result.rows[0] || null;
    if (institution) {
      await writeAudit(client, adminId, "institution.updated", institutionId, data);
    }
    await client.query("COMMIT");
    return institution;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function rotateInstitutionCode(institutionId, codeHash, adminId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE institutions
       SET institution_code_hash = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, institution_type, is_active, updated_at`,
      [codeHash, institutionId]
    );
    const institution = result.rows[0] || null;
    if (institution) {
      await writeAudit(client, adminId, "institution.code_rotated", institutionId, {
        rotatedAt: new Date().toISOString()
      });
    }
    await client.query("COMMIT");
    return institution;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createInstitution,
  listInstitutions,
  getInstitutionById,
  updateInstitution,
  rotateInstitutionCode
};
