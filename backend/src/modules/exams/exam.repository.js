const pool = require("../../config/database");

async function createExam(client, data, adminId) {
  const result = await client.query(
    `INSERT INTO exams (
       title, description, subject_id, exam_mode, access_mode, institution_id,
       status, duration_seconds, attempt_limit, feedback_timing,
       result_release_mode, starts_at, ends_at, shuffle_questions,
       shuffle_options, show_explanations_after_submit, created_by
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       'draft', $7, $8, $9,
       $10, $11, $12, $13,
       $14, $15, $16
     )
     RETURNING id`,
    [
      data.title,
      data.description ?? null,
      data.subjectId ?? null,
      data.examMode,
      data.accessMode,
      data.institutionId ?? null,
      data.durationSeconds,
      data.attemptLimit,
      data.examMode === "practice" ? "instant" : "after_submit",
      data.resultReleaseMode,
      data.startsAt ?? null,
      data.endsAt ?? null,
      data.shuffleQuestions,
      data.shuffleOptions,
      data.showExplanationsAfterSubmit,
      adminId
    ]
  );
  return result.rows[0];
}

async function getExamForUpdate(client, examId) {
  const result = await client.query(
    `SELECT * FROM exams WHERE id = $1 FOR UPDATE`,
    [examId]
  );
  return result.rows[0] || null;
}

async function getActiveInstitution(client, institutionId) {
  const result = await client.query(
    `SELECT id FROM institutions WHERE id = $1 AND is_active = TRUE`,
    [institutionId]
  );
  return result.rows[0] || null;
}

async function updateExam(client, examId, data) {
  const result = await client.query(
    `UPDATE exams SET
       title = $1,
       description = $2,
       subject_id = $3,
       exam_mode = $4,
       access_mode = $5,
       institution_id = $6,
       duration_seconds = $7,
       attempt_limit = $8,
       feedback_timing = $9,
       result_release_mode = $10,
       starts_at = $11,
       ends_at = $12,
       shuffle_questions = $13,
       shuffle_options = $14,
       show_explanations_after_submit = $15,
       updated_at = NOW()
     WHERE id = $16
     RETURNING id`,
    [
      data.title,
      data.description ?? null,
      data.subjectId ?? null,
      data.examMode,
      data.accessMode,
      data.institutionId ?? null,
      data.durationSeconds,
      data.attemptLimit,
      data.examMode === "practice" ? "instant" : "after_submit",
      data.resultReleaseMode,
      data.startsAt ?? null,
      data.endsAt ?? null,
      data.shuffleQuestions,
      data.shuffleOptions,
      data.showExplanationsAfterSubmit,
      examId
    ]
  );
  return result.rows[0] || null;
}

async function listExams(filters) {
  const conditions = [];
  const values = [];
  const add = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  };

  if (filters.status !== "all") add("e.status = ?", filters.status);
  if (filters.examMode) add("e.exam_mode = ?", filters.examMode);
  if (filters.accessMode) add("e.access_mode = ?", filters.accessMode);
  if (filters.search) add("e.title ILIKE ?", `%${filters.search}%`);

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const from = `
    FROM exams e
    LEFT JOIN subjects s ON s.id = e.subject_id
    LEFT JOIN institutions i ON i.id = e.institution_id
    ${where}
  `;

  const count = await pool.query(`SELECT COUNT(*)::int AS total ${from}`, values);
  const total = count.rows[0].total;
  const offset = (filters.page - 1) * filters.limit;
  const pageValues = [...values, filters.limit, offset];

  const result = await pool.query(
    `SELECT
       e.id, e.title, e.description, e.subject_id, s.name AS subject_name,
       e.exam_mode, e.access_mode, e.institution_id, i.name AS institution_name,
       e.status, e.duration_seconds, e.attempt_limit, e.feedback_timing,
       e.result_release_mode, e.starts_at, e.ends_at, e.published_at,
       e.created_at, e.updated_at,
       (SELECT COUNT(*)::int FROM exam_questions eq WHERE eq.exam_id = e.id) AS question_count,
       (SELECT COUNT(*)::int FROM exam_assignments ea WHERE ea.exam_id = e.id) AS assignment_count
     ${from}
     ORDER BY e.created_at DESC
     LIMIT $${pageValues.length - 1} OFFSET $${pageValues.length}`,
    pageValues
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

async function getExamDetail(examId, db = pool) {
  const examResult = await db.query(
    `SELECT
       e.*,
       s.name AS subject_name,
       i.name AS institution_name,
       u.full_name AS created_by_name
     FROM exams e
     LEFT JOIN subjects s ON s.id = e.subject_id
     LEFT JOIN institutions i ON i.id = e.institution_id
     LEFT JOIN users u ON u.id = e.created_by
     WHERE e.id = $1`,
    [examId]
  );
  if (!examResult.rows.length) return null;

  const exam = examResult.rows[0];
  const questionsResult = await db.query(
    `SELECT
       eq.id AS exam_question_id,
       eq.question_id,
       eq.question_version_id,
       eq.source_type,
       eq.display_order,
       eq.marks,
       eq.negative_marks,
       q.difficulty,
       qv.version_number,
       qv.question_text,
       qv.explanation,
       COALESCE(
         json_agg(
           json_build_object(
             'id', qvo.id,
             'key', qvo.option_key,
             'text', qvo.option_text,
             'isCorrect', qvo.is_correct
           ) ORDER BY qvo.option_key
         ) FILTER (WHERE qvo.id IS NOT NULL),
         '[]'::json
       ) AS options
     FROM exam_questions eq
     JOIN questions q ON q.id = eq.question_id
     JOIN question_versions qv ON qv.id = eq.question_version_id
     LEFT JOIN question_version_options qvo ON qvo.question_version_id = qv.id
     WHERE eq.exam_id = $1
     GROUP BY
       eq.id, eq.question_id, eq.question_version_id, eq.source_type,
       eq.display_order, eq.marks, eq.negative_marks, q.difficulty,
       qv.version_number, qv.question_text, qv.explanation
     ORDER BY eq.display_order ASC`,
    [examId]
  );
  exam.questions = questionsResult.rows;

  if (exam.access_mode === "assigned") {
    const assignmentsResult = await db.query(
      `SELECT ea.student_id, u.full_name, u.email, ea.assigned_at, ea.due_at
       FROM exam_assignments ea
       JOIN users u ON u.id = ea.student_id
       WHERE ea.exam_id = $1
       ORDER BY u.full_name ASC`,
      [examId]
    );
    exam.assignments = assignmentsResult.rows;
  } else {
    exam.assignments = [];
  }

  return exam;
}

async function getLatestActiveBankQuestion(client, questionId) {
  const result = await client.query(
    `SELECT
       q.id AS question_id,
       q.subject_id,
       q.topic_id,
       q.difficulty,
       qv.id AS question_version_id
     FROM questions q
     JOIN LATERAL (
       SELECT id
       FROM question_versions
       WHERE question_id = q.id
       ORDER BY version_number DESC
       LIMIT 1
     ) qv ON TRUE
     WHERE q.id = $1
       AND q.source_type = 'bank'
       AND q.is_active = TRUE
     FOR SHARE OF q`,
    [questionId]
  );
  return result.rows[0] || null;
}

async function getNextDisplayOrder(client, examId) {
  const result = await client.query(
    `SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order
     FROM exam_questions WHERE exam_id = $1`,
    [examId]
  );
  return Number(result.rows[0].next_order);
}

async function attachQuestion(client, data) {
  const result = await client.query(
    `INSERT INTO exam_questions (
       exam_id, question_id, question_version_id, source_type,
       display_order, marks, negative_marks
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, exam_id, question_id, question_version_id,
               source_type, display_order, marks, negative_marks`,
    [
      data.examId,
      data.questionId,
      data.questionVersionId,
      data.sourceType,
      data.displayOrder,
      data.marks,
      data.negativeMarks
    ]
  );
  return result.rows[0];
}

async function createExamSpecificQuestion(client, exam, data, adminId) {
  const questionResult = await client.query(
    `INSERT INTO questions (
       source_type, subject_id, topic_id, difficulty, is_active, created_by
     ) VALUES ('exam_specific', $1, $2, $3, TRUE, $4)
     RETURNING id`,
    [exam.subject_id, data.topicId ?? null, data.difficulty, adminId]
  );
  const questionId = questionResult.rows[0].id;

  const versionResult = await client.query(
    `INSERT INTO question_versions (
       question_id, version_number, question_text, explanation, created_by
     ) VALUES ($1, 1, $2, $3, $4)
     RETURNING id`,
    [questionId, data.questionText, data.explanation ?? null, adminId]
  );
  const versionId = versionResult.rows[0].id;

  for (const option of data.options) {
    await client.query(
      `INSERT INTO question_version_options (
         question_version_id, option_key, option_text, is_correct
       ) VALUES ($1, $2, $3, $4)`,
      [versionId, option.key, option.text, option.isCorrect]
    );
  }

  return { questionId, questionVersionId: versionId };
}

async function deleteExamQuestion(client, examId, examQuestionId) {
  const result = await client.query(
    `DELETE FROM exam_questions
     WHERE exam_id = $1 AND id = $2
     RETURNING question_id, source_type`,
    [examId, examQuestionId]
  );
  return result.rows[0] || null;
}

async function deleteExamSpecificQuestion(client, questionId) {
  await client.query(
    `DELETE FROM questions WHERE id = $1 AND source_type = 'exam_specific'`,
    [questionId]
  );
}

async function getStudentUsers(client, studentIds) {
  const result = await client.query(
    `SELECT id FROM users
     WHERE id = ANY($1::uuid[]) AND role = 'student' AND is_active = TRUE`,
    [studentIds]
  );
  return result.rows;
}

async function upsertAssignments(client, examId, studentIds, adminId, dueAt) {
  for (const studentId of studentIds) {
    await client.query(
      `INSERT INTO exam_assignments (exam_id, student_id, assigned_by, due_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (exam_id, student_id)
       DO UPDATE SET assigned_by = EXCLUDED.assigned_by,
                     due_at = EXCLUDED.due_at`,
      [examId, studentId, adminId, dueAt ?? null]
    );
  }
}

async function publishExam(client, examId, status) {
  const result = await client.query(
    `UPDATE exams
     SET status = $1, published_at = NOW(), updated_at = NOW()
     WHERE id = $2
     RETURNING id, status, published_at`,
    [status, examId]
  );
  return result.rows[0] || null;
}

async function archiveExam(client, examId) {
  const result = await client.query(
    `UPDATE exams
     SET status = 'archived', updated_at = NOW()
     WHERE id = $1
     RETURNING id, status`,
    [examId]
  );
  return result.rows[0] || null;
}

async function hasInProgressAttempts(client, examId) {
  const result = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM exam_attempts
       WHERE exam_id = $1 AND status = 'in_progress'
     ) AS found`,
    [examId]
  );
  return result.rows[0].found;
}

async function writeAuditLog(client, adminId, action, entityId, details = {}) {
  await client.query(
    `INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, 'exam', $3, $4::jsonb)`,
    [adminId, action, entityId, JSON.stringify(details)]
  );
}

module.exports = {
  createExam,
  getExamForUpdate,
  getActiveInstitution,
  updateExam,
  listExams,
  getExamDetail,
  getLatestActiveBankQuestion,
  getNextDisplayOrder,
  attachQuestion,
  createExamSpecificQuestion,
  deleteExamQuestion,
  deleteExamSpecificQuestion,
  getStudentUsers,
  upsertAssignments,
  publishExam,
  archiveExam,
  hasInProgressAttempts,
  writeAuditLog
};
