const pool = require("../../../config/database");

function buildFilters(filters) {
  const clauses = [];
  const values = [];

  function add(sql, value) {
    values.push(value);
    clauses.push(sql.replace("?", `$${values.length}`));
  }

  if (filters.examId) add("er.exam_id = ?", filters.examId);
  if (filters.studentId) add("er.student_id = ?", filters.studentId);
  if (filters.dateFrom) add("er.evaluated_at >= ?::date", filters.dateFrom);
  if (filters.dateTo) add("er.evaluated_at < (?::date + INTERVAL '1 day')", filters.dateTo);

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const n = values.length;
    clauses.push(`(u.full_name ILIKE $${n} OR u.email ILIKE $${n} OR e.title ILIKE $${n})`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values
  };
}

async function listResults(filters) {
  const { where, values } = buildFilters(filters);

  const fromSql = `
    FROM exam_results er
    INNER JOIN exams e ON e.id = er.exam_id
    INNER JOIN users u ON u.id = er.student_id
    INNER JOIN exam_attempts ea ON ea.id = er.attempt_id
    ${where}
  `;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total ${fromSql}`,
    values
  );

  const offset = (filters.page - 1) * filters.limit;
  const pagedValues = [...values, filters.limit, offset];

  const result = await pool.query(
    `SELECT
       er.id AS result_id,
       er.attempt_id,
       er.exam_id,
       e.title AS exam_title,
       e.exam_mode,
       e.result_release_mode,
       er.student_id,
       u.full_name AS student_name,
       u.email AS student_email,
       ea.attempt_number,
       ea.status AS attempt_status,
       er.score,
       er.maximum_score,
       er.percentage,
       er.correct_count,
       er.incorrect_count,
       er.unanswered_count,
       er.time_taken_seconds,
       er.evaluated_at
     ${fromSql}
     ORDER BY er.evaluated_at DESC, er.id DESC
     LIMIT $${pagedValues.length - 1}
     OFFSET $${pagedValues.length}`,
    pagedValues
  );

  const total = countResult.rows[0].total;

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

async function getResultDetail(resultId) {
  const headerResult = await pool.query(
    `SELECT
       er.id AS result_id,
       er.attempt_id,
       er.exam_id,
       e.title AS exam_title,
       e.description AS exam_description,
       e.exam_mode,
       e.result_release_mode,
       e.subject_id,
       s.name AS subject_name,
       er.student_id,
       u.full_name AS student_name,
       u.email AS student_email,
       ea.attempt_number,
       ea.status AS attempt_status,
       ea.started_at,
       ea.submitted_at,
       er.score,
       er.maximum_score,
       er.percentage,
       er.correct_count,
       er.incorrect_count,
       er.unanswered_count,
       er.time_taken_seconds,
       er.evaluated_at
     FROM exam_results er
     INNER JOIN exams e ON e.id = er.exam_id
     INNER JOIN users u ON u.id = er.student_id
     INNER JOIN exam_attempts ea ON ea.id = er.attempt_id
     LEFT JOIN subjects s ON s.id = e.subject_id
     WHERE er.id = $1`,
    [resultId]
  );

  if (!headerResult.rows.length) return null;

  const header = headerResult.rows[0];

  const answersResult = await pool.query(
    `SELECT
       eq.id AS exam_question_id,
       eq.display_order,
       eq.marks,
       eq.negative_marks,
       qv.question_text,
       qv.explanation,
       sa.selected_option_id,
       selected.option_key AS selected_option_key,
       selected.option_text AS selected_option_text,
       selected.is_correct AS selected_is_correct,
       sa.is_correct,
       sa.marks_awarded,
       sa.marked_for_review,
       correct.option_key AS correct_option_key,
       correct.option_text AS correct_option_text,
       options.all_options
     FROM exam_questions eq
     INNER JOIN question_versions qv ON qv.id = eq.question_version_id
     LEFT JOIN student_answers sa
       ON sa.exam_question_id = eq.id
      AND sa.attempt_id = $1
     LEFT JOIN question_version_options selected
       ON selected.id = sa.selected_option_id
     LEFT JOIN LATERAL (
       SELECT option_key, option_text
       FROM question_version_options
       WHERE question_version_id = eq.question_version_id
         AND is_correct = TRUE
       LIMIT 1
     ) correct ON TRUE
     LEFT JOIN LATERAL (
       SELECT json_agg(
         json_build_object(
           'key', option_key,
           'text', option_text,
           'isCorrect', is_correct
         ) ORDER BY option_key
       ) AS all_options
       FROM question_version_options
       WHERE question_version_id = eq.question_version_id
     ) options ON TRUE
     WHERE eq.exam_id = $2
     ORDER BY eq.display_order ASC`,
    [header.attempt_id, header.exam_id]
  );

  return {
    ...header,
    answers: answersResult.rows.map((row) => ({
      examQuestionId: row.exam_question_id,
      questionNumber: row.display_order,
      questionText: row.question_text,
      explanation: row.explanation,
      marks: row.marks,
      negativeMarks: row.negative_marks,
      options: row.all_options || [],
      selectedOptionId: row.selected_option_id,
      selectedOptionKey: row.selected_option_key,
      selectedOptionText: row.selected_option_text,
      isCorrect: row.is_correct,
      marksAwarded: row.marks_awarded,
      markedForReview: row.marked_for_review,
      correctOptionKey: row.correct_option_key,
      correctOptionText: row.correct_option_text
    }))
  };
}

async function getExamSummary(examId) {
  const examResult = await pool.query(
    `SELECT id, title, exam_mode, status, result_release_mode, starts_at, ends_at
     FROM exams
     WHERE id = $1`,
    [examId]
  );

  if (!examResult.rows.length) return null;

  const statsResult = await pool.query(
    `SELECT
       COUNT(*)::int AS result_count,
       COUNT(DISTINCT student_id)::int AS students_count,
       ROUND(AVG(percentage), 2) AS average_percentage,
       MAX(percentage) AS highest_percentage,
       MIN(percentage) AS lowest_percentage,
       ROUND(AVG(score), 2) AS average_score,
       SUM(correct_count)::int AS total_correct,
       SUM(incorrect_count)::int AS total_incorrect,
       SUM(unanswered_count)::int AS total_unanswered
     FROM exam_results
     WHERE exam_id = $1`,
    [examId]
  );

  const leaderboardResult = await pool.query(
    `SELECT
       ranked.student_id,
       ranked.student_name,
       ranked.score,
       ranked.maximum_score,
       ranked.percentage,
       ranked.evaluated_at,
       ranked.rank
     FROM (
       SELECT
         er.student_id,
         u.full_name AS student_name,
         er.score,
         er.maximum_score,
         er.percentage,
         er.evaluated_at,
         RANK() OVER (ORDER BY er.score DESC, er.evaluated_at ASC) AS rank
       FROM exam_results er
       INNER JOIN users u ON u.id = er.student_id
       WHERE er.exam_id = $1
     ) ranked
     ORDER BY ranked.rank ASC, ranked.student_name ASC
     LIMIT 100`,
    [examId]
  );

  return {
    exam: examResult.rows[0],
    statistics: statsResult.rows[0],
    leaderboard: leaderboardResult.rows
  };
}

async function releaseManualResults(examId, adminId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const examResult = await client.query(
      `SELECT id, title, result_release_mode
       FROM exams
       WHERE id = $1
       FOR UPDATE`,
      [examId]
    );

    if (!examResult.rows.length) {
      await client.query("ROLLBACK");
      return { notFound: true };
    }

    const exam = examResult.rows[0];

    if (exam.result_release_mode !== "manual") {
      await client.query("ROLLBACK");
      return {
        invalidState: true,
        currentMode: exam.result_release_mode
      };
    }

    const countsResult = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM exam_results WHERE exam_id = $1) AS result_count,
         (SELECT COUNT(*)::int FROM exam_attempts WHERE exam_id = $1 AND status = 'in_progress') AS active_attempt_count`,
      [examId]
    );

    const counts = countsResult.rows[0];

    if (counts.result_count === 0) {
      await client.query("ROLLBACK");
      return { noResults: true };
    }

    if (counts.active_attempt_count > 0) {
      await client.query("ROLLBACK");
      return {
        activeAttempts: true,
        activeAttemptCount: counts.active_attempt_count
      };
    }

    // Transition the exam from manual release to immediately available.
    // This uses the existing schema and is recognized by the student attempt service.
    const updatedResult = await client.query(
      `UPDATE exams
       SET result_release_mode = 'immediately',
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, result_release_mode, updated_at`,
      [examId]
    );

    await client.query(
      `INSERT INTO admin_audit_logs
         (admin_id, action, entity_type, entity_id, details)
       VALUES ($1, 'release_exam_results', 'exam', $2, $3::jsonb)`,
      [
        adminId,
        examId,
        JSON.stringify({
          examTitle: exam.title,
          previousReleaseMode: "manual",
          newReleaseMode: "immediately",
          resultCount: counts.result_count
        })
      ]
    );

    await client.query("COMMIT");

    return {
      released: true,
      resultCount: counts.result_count,
      exam: updatedResult.rows[0]
    };
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (rollbackError) {
      console.error("Result release rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  listResults,
  getResultDetail,
  getExamSummary,
  releaseManualResults
};
