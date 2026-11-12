const pool = require("../../config/database");

async function createSubject(data) {
  const result = await pool.query(
    `INSERT INTO subjects (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description, created_at`,
    [data.name, data.description ?? null]
  );

  return result.rows[0];
}

async function listSubjects() {
  const result = await pool.query(
    `SELECT
       s.id,
       s.name,
       s.description,
       s.created_at,
       (SELECT COUNT(*)::int
        FROM topics t
        WHERE t.subject_id = s.id) AS topic_count,
       (SELECT COUNT(*)::int
        FROM questions q
        WHERE q.subject_id = s.id) AS question_count
     FROM subjects s
     ORDER BY LOWER(s.name) ASC`
  );

  return result.rows;
}

async function getSubjectById(subjectId) {
  const subjectResult = await pool.query(
    `SELECT id, name, description, created_at
     FROM subjects
     WHERE id = $1`,
    [subjectId]
  );

  if (subjectResult.rows.length === 0) {
    return null;
  }

  const subject = subjectResult.rows[0];

  const topicsResult = await pool.query(
    `SELECT
       t.id,
       t.subject_id,
       t.name,
       t.created_at,
       (SELECT COUNT(*)::int
        FROM questions q
        WHERE q.topic_id = t.id) AS question_count
     FROM topics t
     WHERE t.subject_id = $1
     ORDER BY LOWER(t.name) ASC`,
    [subjectId]
  );

  subject.topics = topicsResult.rows;

  return subject;
}

async function updateSubject(subjectId, data) {
  const result = await pool.query(
    `UPDATE subjects
     SET name = $1,
         description = $2
     WHERE id = $3
     RETURNING id, name, description, created_at`,
    [data.name, data.description ?? null, subjectId]
  );

  return result.rows[0] || null;
}

async function deleteSubject(subjectId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const subjectResult = await client.query(
      `SELECT id
       FROM subjects
       WHERE id = $1
       FOR UPDATE`,
      [subjectId]
    );

    if (subjectResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }

    const usageResult = await client.query(
      `SELECT
         (SELECT COUNT(*)::int
          FROM questions
          WHERE subject_id = $1) AS question_count,
         (SELECT COUNT(*)::int
          FROM exams
          WHERE subject_id = $1) AS exam_count`,
      [subjectId]
    );

    const { question_count, exam_count } = usageResult.rows[0];

    if (question_count > 0 || exam_count > 0) {
      await client.query("ROLLBACK");

      return {
        inUse: true,
        questionCount: question_count,
        examCount: exam_count
      };
    }

    await client.query(
      `DELETE FROM subjects WHERE id = $1`,
      [subjectId]
    );

    await client.query("COMMIT");

    return { deleted: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function createTopic(subjectId, name) {
  const result = await pool.query(
    `INSERT INTO topics (subject_id, name)
     VALUES ($1, $2)
     RETURNING id, subject_id, name, created_at`,
    [subjectId, name]
  );

  return result.rows[0];
}

async function listTopics(subjectId) {
  const subjectResult = await pool.query(
    `SELECT id, name
     FROM subjects
     WHERE id = $1`,
    [subjectId]
  );

  if (subjectResult.rows.length === 0) {
    return null;
  }

  const topicsResult = await pool.query(
    `SELECT
       t.id,
       t.subject_id,
       t.name,
       t.created_at,
       (SELECT COUNT(*)::int
        FROM questions q
        WHERE q.topic_id = t.id) AS question_count
     FROM topics t
     WHERE t.subject_id = $1
     ORDER BY LOWER(t.name) ASC`,
    [subjectId]
  );

  return topicsResult.rows;
}

async function updateTopic(topicId, name) {
  const result = await pool.query(
    `UPDATE topics
     SET name = $1
     WHERE id = $2
     RETURNING id, subject_id, name, created_at`,
    [name, topicId]
  );

  return result.rows[0] || null;
}

async function deleteTopic(topicId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const topicResult = await client.query(
      `SELECT id
       FROM topics
       WHERE id = $1
       FOR UPDATE`,
      [topicId]
    );

    if (topicResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }

    const usageResult = await client.query(
      `SELECT COUNT(*)::int AS question_count
       FROM questions
       WHERE topic_id = $1`,
      [topicId]
    );

    const questionCount = usageResult.rows[0].question_count;

    if (questionCount > 0) {
      await client.query("ROLLBACK");

      return {
        inUse: true,
        questionCount
      };
    }

    await client.query(
      `DELETE FROM topics WHERE id = $1`,
      [topicId]
    );

    await client.query("COMMIT");

    return { deleted: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createSubject,
  listSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  createTopic,
  listTopics,
  updateTopic,
  deleteTopic
};
