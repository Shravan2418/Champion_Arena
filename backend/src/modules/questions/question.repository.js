const pool = require("../../config/database");

async function createQuestion(client, data, adminId) {
  const result = await client.query(
    `INSERT INTO questions
      (source_type, subject_id, topic_id, difficulty, is_active, created_by)
     VALUES
      ('bank', $1, $2, $3, TRUE, $4)
     RETURNING id`,
    [
      data.subjectId ?? null,
      data.topicId ?? null,
      data.difficulty,
      adminId
    ]
  );

  return result.rows[0];
}

async function getQuestionForUpdate(client, questionId) {
  const result = await client.query(
    `SELECT id, source_type, subject_id, topic_id, difficulty, is_active
     FROM questions
     WHERE id = $1 AND source_type = 'bank'
     FOR UPDATE`,
    [questionId]
  );

  return result.rows[0] || null;
}

async function updateQuestion(client, questionId, data) {
  await client.query(
    `UPDATE questions
     SET subject_id = $1,
         topic_id = $2,
         difficulty = $3,
         updated_at = NOW()
     WHERE id = $4 AND source_type = 'bank'`,
    [
      data.subjectId ?? null,
      data.topicId ?? null,
      data.difficulty,
      questionId
    ]
  );
}

async function getNextVersionNumber(client, questionId) {
  const result = await client.query(
    `SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version
     FROM question_versions
     WHERE question_id = $1`,
    [questionId]
  );

  return Number(result.rows[0].next_version);
}

async function createQuestionVersion(client, questionId, versionNumber, data, adminId) {
  const result = await client.query(
    `INSERT INTO question_versions
      (question_id, version_number, question_text, explanation, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, version_number, question_text, explanation, created_at`,
    [
      questionId,
      versionNumber,
      data.questionText,
      data.explanation ?? null,
      adminId
    ]
  );

  return result.rows[0];
}

async function createQuestionOptions(client, versionId, options) {
  for (const option of options) {
    await client.query(
      `INSERT INTO question_version_options
        (question_version_id, option_key, option_text, is_correct)
       VALUES ($1, $2, $3, $4)`,
      [
        versionId,
        option.key,
        option.text,
        option.isCorrect
      ]
    );
  }
}

async function getQuestionDetail(questionId, db = pool) {
  const questionResult = await db.query(
    `SELECT
       q.id,
       q.source_type,
       q.subject_id,
       q.topic_id,
       q.difficulty,
       q.is_active,
       q.created_by,
       q.created_at,
       q.updated_at,
       latest.id AS version_id,
       latest.version_number,
       latest.question_text,
       latest.explanation,
       latest.created_at AS version_created_at
     FROM questions q
     LEFT JOIN LATERAL (
       SELECT id, version_number, question_text, explanation, created_at
       FROM question_versions
       WHERE question_id = q.id
       ORDER BY version_number DESC
       LIMIT 1
     ) latest ON TRUE
     WHERE q.id = $1
       AND q.source_type = 'bank'`,
    [questionId]
  );

  if (questionResult.rows.length === 0) {
    return null;
  }

  const question = questionResult.rows[0];

  if (question.version_id) {
    const optionsResult = await db.query(
      `SELECT option_key, option_text, is_correct
       FROM question_version_options
       WHERE question_version_id = $1
       ORDER BY option_key`,
      [question.version_id]
    );

    question.options = optionsResult.rows.map((option) => ({
      key: option.option_key,
      text: option.option_text,
      isCorrect: option.is_correct
    }));
  } else {
    question.options = [];
  }

  const versionsResult = await db.query(
    `SELECT id, version_number, question_text, explanation, created_at
     FROM question_versions
     WHERE question_id = $1
     ORDER BY version_number DESC`,
    [questionId]
  );

  question.versions = versionsResult.rows;

  return question;
}

async function listQuestions(filters) {
  const conditions = ["q.source_type = 'bank'"];
  const values = [];

  function addCondition(sql, value) {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  }

  if (filters.status === "active") {
    conditions.push("q.is_active = TRUE");
  } else if (filters.status === "archived") {
    conditions.push("q.is_active = FALSE");
  }

  if (filters.subjectId) {
    addCondition("q.subject_id = ?", filters.subjectId);
  }

  if (filters.topicId) {
    addCondition("q.topic_id = ?", filters.topicId);
  }

  if (filters.difficulty) {
    addCondition("q.difficulty = ?", filters.difficulty);
  }

  if (filters.search) {
    addCondition("latest.question_text ILIKE ?", `%${filters.search}%`);
  }

  const fromAndWhere = `
    FROM questions q
    LEFT JOIN LATERAL (
      SELECT id, version_number, question_text, explanation, created_at
      FROM question_versions
      WHERE question_id = q.id
      ORDER BY version_number DESC
      LIMIT 1
    ) latest ON TRUE
    WHERE ${conditions.join(" AND ")}
  `;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total ${fromAndWhere}`,
    values
  );

  const total = countResult.rows[0].total;
  const offset = (filters.page - 1) * filters.limit;
  const listValues = [...values, filters.limit, offset];

  const result = await pool.query(
    `SELECT
       q.id,
       q.subject_id,
       q.topic_id,
       q.difficulty,
       q.is_active,
       q.created_at,
       q.updated_at,
       latest.id AS version_id,
       latest.version_number,
       latest.question_text,
       latest.explanation
     ${fromAndWhere}
     ORDER BY q.created_at DESC
     LIMIT $${listValues.length - 1}
     OFFSET $${listValues.length}`,
    listValues
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

async function archiveQuestion(questionId) {
  const result = await pool.query(
    `UPDATE questions
     SET is_active = FALSE,
         updated_at = NOW()
     WHERE id = $1
       AND source_type = 'bank'
     RETURNING id, is_active`,
    [questionId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createQuestion,
  getQuestionForUpdate,
  updateQuestion,
  getNextVersionNumber,
  createQuestionVersion,
  createQuestionOptions,
  getQuestionDetail,
  listQuestions,
  archiveQuestion
};
