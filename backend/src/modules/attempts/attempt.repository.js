const pool = require("../../config/database");

async function listAvailableExams(studentId, filters) {
  const conditions = [
    "e.status IN ('published', 'scheduled')",
    `(
      e.access_mode = 'public'
      OR (
        e.access_mode = 'institution_code'
        AND EXISTS (
          SELECT 1 FROM student_institutions si
          WHERE si.student_id = $1
            AND si.institution_id = e.institution_id
            AND si.membership_status = 'active'
        )
      )
      OR (
        e.access_mode = 'assigned'
        AND EXISTS (
          SELECT 1 FROM exam_assignments ea
          WHERE ea.exam_id = e.id AND ea.student_id = $1
        )
      )
    )`
  ];
  const values = [studentId];

  const add = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  };

  if (filters.search) add("e.title ILIKE ?", `%${filters.search}%`);
  if (filters.examMode) add("e.exam_mode = ?", filters.examMode);
  if (filters.subjectId) add("e.subject_id = ?", filters.subjectId);

  const from = `
    FROM exams e
    LEFT JOIN subjects s ON s.id = e.subject_id
    WHERE ${conditions.join(" AND ")}
  `;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total ${from}`,
    values
  );

  const total = countResult.rows[0].total;
  const offset = (filters.page - 1) * filters.limit;
  const pageValues = [...values, filters.limit, offset];

  const result = await pool.query(
    `SELECT
       e.id,
       e.title,
       e.description,
       e.subject_id,
       s.name AS subject_name,
       e.exam_mode,
       e.access_mode,
       e.status,
       e.duration_seconds,
       e.attempt_limit,
       e.result_release_mode,
       e.starts_at,
       e.ends_at,
       (SELECT COUNT(*)::int FROM exam_questions eq WHERE eq.exam_id = e.id) AS question_count,
       (SELECT COUNT(*)::int FROM exam_attempts a WHERE a.exam_id = e.id AND a.student_id = $1) AS attempts_used,
       CASE
         WHEN e.status NOT IN ('published', 'scheduled') THEN FALSE
         WHEN e.starts_at IS NOT NULL AND e.starts_at > NOW() THEN FALSE
         WHEN e.ends_at IS NOT NULL AND e.ends_at <= NOW() THEN FALSE
         WHEN (SELECT COUNT(*) FROM exam_attempts a WHERE a.exam_id = e.id AND a.student_id = $1) >= e.attempt_limit THEN FALSE
         ELSE TRUE
       END AS can_start
     ${from}
     ORDER BY e.starts_at NULLS FIRST, e.created_at DESC
     LIMIT $${pageValues.length - 1}
     OFFSET $${pageValues.length}`,
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

async function getExamForStudent(db, examId) {
  const result = await db.query(
    `SELECT
       e.id, e.title, e.description, e.subject_id, s.name AS subject_name,
       e.exam_mode, e.access_mode, e.institution_id, e.status,
       e.duration_seconds, e.attempt_limit, e.result_release_mode,
       e.starts_at, e.ends_at, e.shuffle_questions, e.shuffle_options,
       e.show_explanations_after_submit,
       (SELECT COUNT(*)::int FROM exam_questions eq WHERE eq.exam_id = e.id) AS question_count,
       COALESCE((SELECT SUM(eq.marks) FROM exam_questions eq WHERE eq.exam_id = e.id), 0)::numeric(10,2) AS maximum_score
     FROM exams e
     LEFT JOIN subjects s ON s.id = e.subject_id
     WHERE e.id = $1` ,
    [examId]
  );

  return result.rows[0] || null;
}

async function studentHasExamAccess(db, studentId, exam) {
  if (exam.access_mode === "public") return true;

  if (exam.access_mode === "institution_code") {
    const result = await db.query(
      `SELECT EXISTS (
         SELECT 1 FROM student_institutions
         WHERE student_id = $1
           AND institution_id = $2
           AND membership_status = 'active'
       ) AS allowed`,
      [studentId, exam.institution_id]
    );
    return result.rows[0].allowed;
  }

  if (exam.access_mode === "assigned") {
    const result = await db.query(
      `SELECT EXISTS (
         SELECT 1 FROM exam_assignments
         WHERE exam_id = $1 AND student_id = $2
       ) AS allowed`,
      [exam.id, studentId]
    );
    return result.rows[0].allowed;
  }

  return false;
}

async function getAttemptCount(db, examId, studentId) {
  const result = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM exam_attempts
     WHERE exam_id = $1 AND student_id = $2`,
    [examId, studentId]
  );
  return result.rows[0].count;
}

async function getInProgressAttempt(db, examId, studentId) {
  const result = await db.query(
    `SELECT *
     FROM exam_attempts
     WHERE exam_id = $1 AND student_id = $2 AND status = 'in_progress'
     ORDER BY started_at DESC
     LIMIT 1
     FOR UPDATE`,
    [examId, studentId]
  );
  return result.rows[0] || null;
}

async function createAttempt(db, data) {
  const result = await db.query(
    `INSERT INTO exam_attempts (
       exam_id, student_id, attempt_number, status, started_at, deadline_at
     ) VALUES (
       $1, $2, $3, 'in_progress', NOW(),
       LEAST(NOW() + ($4 * INTERVAL '1 second'), COALESCE($5::timestamptz, 'infinity'::timestamptz))
     )
     RETURNING id, exam_id, student_id, attempt_number, status,
               started_at, deadline_at, submitted_at, time_spent_seconds`,
    [data.examId, data.studentId, data.attemptNumber, data.durationSeconds, data.endsAt]
  );

  const attempt = result.rows[0];

  await db.query(
    `INSERT INTO student_answers (
       attempt_id, exam_id, exam_question_id, question_version_id
     )
     SELECT $1, eq.exam_id, eq.id, eq.question_version_id
     FROM exam_questions eq
     WHERE eq.exam_id = $2`,
    [attempt.id, data.examId]
  );

  return attempt;
}

async function getAttemptForUpdate(db, attemptId, studentId) {
  const result = await db.query(
    `SELECT
       a.*,
       e.title AS exam_title,
       e.exam_mode,
       e.result_release_mode,
       e.ends_at AS exam_ends_at,
       e.show_explanations_after_submit,
       e.shuffle_questions,
       e.shuffle_options
     FROM exam_attempts a
     JOIN exams e ON e.id = a.exam_id
     WHERE a.id = $1 AND a.student_id = $2
     FOR UPDATE OF a`,
    [attemptId, studentId]
  );
  return result.rows[0] || null;
}

async function getAttemptHeader(db, attemptId, studentId) {
  const result = await db.query(
    `SELECT
       a.*,
       e.title AS exam_title,
       e.exam_mode,
       e.result_release_mode,
       e.ends_at AS exam_ends_at,
       e.show_explanations_after_submit,
       e.shuffle_questions,
       e.shuffle_options
     FROM exam_attempts a
     JOIN exams e ON e.id = a.exam_id
     WHERE a.id = $1 AND a.student_id = $2`,
    [attemptId, studentId]
  );
  return result.rows[0] || null;
}

async function getAttemptQuestions(db, attempt) {
  const result = await db.query(
    `SELECT
       eq.id AS exam_question_id,
       eq.display_order,
       eq.marks,
       eq.negative_marks,
       q.difficulty,
       qv.id AS question_version_id,
       qv.question_text,
       qv.explanation,
       sa.selected_option_id,
       sa.marked_for_review,
       sa.is_correct,
       sa.marks_awarded,
       COALESCE(
         json_agg(
           json_build_object(
             'id', qvo.id,
             'key', qvo.option_key,
             'text', qvo.option_text,
             'isCorrect', qvo.is_correct
           ) ORDER BY
             CASE WHEN $3::boolean THEN md5($1::text || qvo.id::text) END,
             qvo.option_key
         ) FILTER (WHERE qvo.id IS NOT NULL),
         '[]'::json
       ) AS options
     FROM student_answers sa
     JOIN exam_questions eq
       ON eq.id = sa.exam_question_id AND eq.exam_id = sa.exam_id
     JOIN question_versions qv ON qv.id = sa.question_version_id
     JOIN questions q ON q.id = qv.question_id
     LEFT JOIN question_version_options qvo ON qvo.question_version_id = qv.id
     WHERE sa.attempt_id = $1
     GROUP BY
       eq.id, eq.display_order, eq.marks, eq.negative_marks,
       q.difficulty, qv.id, qv.question_text, qv.explanation,
       sa.selected_option_id, sa.marked_for_review, sa.is_correct, sa.marks_awarded
     ORDER BY
       CASE WHEN $2::boolean THEN md5($1::text || eq.id::text) END,
       eq.display_order ASC`,
    [attempt.id, attempt.shuffle_questions, attempt.shuffle_options]
  );
  return result.rows;
}

async function getAttemptQuestion(db, attemptId, examQuestionId) {
  const result = await db.query(
    `SELECT
       eq.id AS exam_question_id,
       eq.question_version_id,
       eq.marks,
       eq.negative_marks,
       qv.explanation
     FROM student_answers sa
     JOIN exam_questions eq ON eq.id = sa.exam_question_id AND eq.exam_id = sa.exam_id
     JOIN question_versions qv ON qv.id = eq.question_version_id
     WHERE sa.attempt_id = $1 AND eq.id = $2`,
    [attemptId, examQuestionId]
  );
  return result.rows[0] || null;
}

async function getOptionForVersion(db, optionId, versionId) {
  const result = await db.query(
    `SELECT id, option_key, option_text, is_correct
     FROM question_version_options
     WHERE id = $1 AND question_version_id = $2`,
    [optionId, versionId]
  );
  return result.rows[0] || null;
}

async function updateStudentAnswer(db, data) {
  const result = await db.query(
    `UPDATE student_answers
     SET selected_option_id = CASE WHEN $4::boolean THEN $5::uuid ELSE selected_option_id END,
         marked_for_review = COALESCE($6::boolean, marked_for_review),
         answered_at = CASE
           WHEN $4::boolean AND $5::uuid IS NULL THEN NULL
           WHEN $4::boolean AND $5::uuid IS NOT NULL THEN NOW()
           ELSE answered_at
         END,
         is_correct = CASE
           WHEN $7::boolean AND $4::boolean THEN $8::boolean
           WHEN $4::boolean AND $5::uuid IS NULL THEN NULL
           ELSE is_correct
         END,
         marks_awarded = CASE
           WHEN $7::boolean AND $4::boolean THEN $9::numeric
           WHEN $4::boolean AND $5::uuid IS NULL THEN NULL
           ELSE marks_awarded
         END,
         last_saved_at = NOW()
     WHERE attempt_id = $1 AND exam_question_id = $2 AND exam_id = $3
     RETURNING attempt_id, exam_question_id, selected_option_id,
               marked_for_review, is_correct, marks_awarded, answered_at, last_saved_at`,
    [
      data.attemptId,
      data.examQuestionId,
      data.examId,
      data.hasSelectionField,
      data.selectedOptionId ?? null,
      data.markedForReview ?? null,
      data.practiceMode,
      data.isCorrect ?? null,
      data.marksAwarded ?? null
    ]
  );
  return result.rows[0] || null;
}

async function getPracticeFeedback(db, question, selectedOptionId) {
  const result = await db.query(
    `SELECT
       selected.id AS selected_option_id,
       selected.option_key AS selected_option_key,
       selected.option_text AS selected_option_text,
       correct.id AS correct_option_id,
       correct.option_key AS correct_option_key,
       correct.option_text AS correct_option_text,
       correct.is_correct,
       $3::text AS explanation
     FROM question_version_options selected
     JOIN question_version_options correct
       ON correct.question_version_id = selected.question_version_id
      AND correct.is_correct = TRUE
     WHERE selected.id = $1 AND selected.question_version_id = $2`,
    [selectedOptionId, question.question_version_id, question.explanation]
  );
  return result.rows[0] || null;
}

async function evaluateAttemptAnswers(db, attemptId) {
  await db.query(
    `UPDATE student_answers sa
     SET is_correct = (
           SELECT qvo.is_correct
           FROM question_version_options qvo
           WHERE qvo.id = sa.selected_option_id
             AND qvo.question_version_id = sa.question_version_id
         ),
         marks_awarded = CASE
           WHEN sa.selected_option_id IS NULL THEN 0
           ELSE (
             SELECT CASE WHEN qvo.is_correct THEN eq.marks ELSE -eq.negative_marks END
             FROM exam_questions eq
             JOIN question_version_options qvo
               ON qvo.id = sa.selected_option_id
              AND qvo.question_version_id = sa.question_version_id
             WHERE eq.id = sa.exam_question_id
           )
         END
     WHERE sa.attempt_id = $1`,
    [attemptId]
  );
}

async function getAttemptScore(db, attemptId) {
  const result = await db.query(
    `SELECT
       COALESCE(SUM(eq.marks), 0)::numeric(10,2) AS maximum_score,
       COALESCE(SUM(sa.marks_awarded), 0)::numeric(10,2) AS score,
       COUNT(*) FILTER (WHERE sa.selected_option_id IS NOT NULL AND sa.is_correct = TRUE)::int AS correct_count,
       COUNT(*) FILTER (WHERE sa.selected_option_id IS NOT NULL AND sa.is_correct = FALSE)::int AS incorrect_count,
       COUNT(*) FILTER (WHERE sa.selected_option_id IS NULL)::int AS unanswered_count
     FROM student_answers sa
     JOIN exam_questions eq ON eq.id = sa.exam_question_id
     WHERE sa.attempt_id = $1`,
    [attemptId]
  );
  return result.rows[0];
}

async function closeAttempt(db, attempt, status) {
  const result = await db.query(
    `UPDATE exam_attempts
     SET status = $2,
         submitted_at = NOW(),
         time_spent_seconds = GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - started_at)))::int)
     WHERE id = $1 AND status = 'in_progress'
     RETURNING id, status, submitted_at, time_spent_seconds`,
    [attempt.id, status]
  );
  return result.rows[0] || null;
}

async function createExamResult(db, attempt, score) {
  const maximum = Number(score.maximum_score);
  const rawScore = Number(score.score);
  const percentage = maximum > 0
    ? Math.max(0, Math.min(100, (rawScore / maximum) * 100))
    : 0;

  const result = await db.query(
    `INSERT INTO exam_results (
       attempt_id, exam_id, student_id, score, maximum_score, percentage,
       correct_count, incorrect_count, unanswered_count, time_taken_seconds
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
     )
     ON CONFLICT (attempt_id) DO NOTHING
     RETURNING id, attempt_id, exam_id, student_id, score, maximum_score,
               percentage, correct_count, incorrect_count, unanswered_count,
               time_taken_seconds, evaluated_at`,
    [
      attempt.id,
      attempt.exam_id,
      attempt.student_id,
      rawScore,
      maximum,
      Number(percentage.toFixed(2)),
      score.correct_count,
      score.incorrect_count,
      score.unanswered_count,
      Math.max(0, Number(attempt.time_spent_seconds || 0))
    ]
  );

  if (result.rows[0]) return result.rows[0];
  return getExamResult(db, attempt.id);
}

async function getExamResult(db, attemptId) {
  const result = await db.query(
    `SELECT id, attempt_id, exam_id, student_id, score, maximum_score,
            percentage, correct_count, incorrect_count, unanswered_count,
            time_taken_seconds, evaluated_at
     FROM exam_results
     WHERE attempt_id = $1`,
    [attemptId]
  );
  return result.rows[0] || null;
}

async function listAttemptHistory(studentId, examId) {
  const result = await pool.query(
    `SELECT id, attempt_number, status, started_at, deadline_at,
            submitted_at, time_spent_seconds
     FROM exam_attempts
     WHERE student_id = $1 AND exam_id = $2
     ORDER BY attempt_number DESC`,
    [studentId, examId]
  );
  return result.rows;
}

module.exports = {
  listAvailableExams,
  getExamForStudent,
  studentHasExamAccess,
  getAttemptCount,
  getInProgressAttempt,
  createAttempt,
  getAttemptForUpdate,
  getAttemptHeader,
  getAttemptQuestions,
  getAttemptQuestion,
  getOptionForVersion,
  updateStudentAnswer,
  getPracticeFeedback,
  evaluateAttemptAnswers,
  getAttemptScore,
  closeAttempt,
  createExamResult,
  getExamResult,
  listAttemptHistory
};
