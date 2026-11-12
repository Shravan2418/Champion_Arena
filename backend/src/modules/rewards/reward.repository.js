const pool = require("../../config/database");

async function getStudentSummary(studentId, db = pool) {
  const result = await db.query(
    `SELECT
       u.id AS student_id,
       u.full_name,
       COALESCE(sg.total_xp, 0)::bigint AS total_xp,
       COALESCE(sg.level, 1)::int AS level,
       COALESCE(sg.current_streak, 0)::int AS current_streak,
       COALESCE(sg.longest_streak, 0)::int AS longest_streak,
       sg.last_activity_date,
       (COALESCE(sg.level, 1) * 500 - COALESCE(sg.total_xp, 0))::bigint AS xp_to_next_level
     FROM users u
     LEFT JOIN student_gamification sg ON sg.student_id = u.id
     WHERE u.id = $1 AND u.role = 'student' AND u.is_active = TRUE`,
    [studentId]
  );

  return result.rows[0] || null;
}

async function getTransactions(studentId, { page, limit }) {
  const offset = (page - 1) * limit;
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM xp_transactions
     WHERE student_id = $1`,
    [studentId]
  );

  const result = await pool.query(
    `SELECT id, source_type, source_reference_id, xp_amount, reason, created_at
     FROM xp_transactions
     WHERE student_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT $2 OFFSET $3`,
    [studentId, limit, offset]
  );

  const total = countResult.rows[0].total;

  return {
    items: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getStudentBadges(studentId) {
  const result = await pool.query(
    `SELECT
       b.id,
       b.code,
       b.name,
       b.description,
       b.tier,
       b.icon_name,
       b.criteria,
       b.xp_reward,
       (sb.badge_id IS NOT NULL) AS earned,
       sb.earned_at
     FROM badges b
     LEFT JOIN student_badges sb
       ON sb.badge_id = b.id AND sb.student_id = $1
     WHERE b.is_active = TRUE
     ORDER BY
       CASE b.tier
         WHEN 'bronze' THEN 1
         WHEN 'silver' THEN 2
         WHEN 'gold' THEN 3
         WHEN 'platinum' THEN 4
       END,
       b.name ASC`,
    [studentId]
  );

  return result.rows;
}

async function getLeaderboard(studentId, limit) {
  const result = await pool.query(
    `WITH ranked_students AS (
       SELECT
         u.id AS student_id,
         u.full_name,
         sg.total_xp,
         sg.level,
         RANK() OVER (ORDER BY sg.total_xp DESC) AS rank
       FROM users u
       JOIN student_gamification sg ON sg.student_id = u.id
       WHERE u.role = 'student' AND u.is_active = TRUE
     )
     SELECT student_id, full_name, total_xp, level, rank,
            (student_id = $2) AS is_current_student
     FROM ranked_students
     WHERE rank <= $1 OR student_id = $2
     ORDER BY rank, full_name
     LIMIT $1 + 1`,
    [limit, studentId]
  );

  return result.rows;
}

async function getAllBadges() {
  const result = await pool.query(
    `SELECT id, code, name, description, tier, icon_name, criteria,
            xp_reward, is_active, created_at
     FROM badges
     ORDER BY created_at DESC`
  );

  return result.rows;
}

async function createBadge(data) {
  const result = await pool.query(
    `INSERT INTO badges
       (code, name, description, tier, icon_name, criteria, xp_reward, is_active)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, TRUE)
     RETURNING id, code, name, description, tier, icon_name, criteria,
               xp_reward, is_active, created_at`,
    [
      data.code,
      data.name,
      data.description,
      data.tier,
      data.iconName ?? null,
      JSON.stringify(data.criteria),
      data.xpReward
    ]
  );

  return result.rows[0];
}

async function updateBadgeStatus(badgeId, isActive) {
  const result = await pool.query(
    `UPDATE badges
     SET is_active = $1
     WHERE id = $2
     RETURNING id, code, name, is_active`,
    [isActive, badgeId]
  );

  return result.rows[0] || null;
}

async function lockGamificationRow(client, studentId) {
  await client.query(
    `INSERT INTO student_gamification (student_id)
     VALUES ($1)
     ON CONFLICT (student_id) DO NOTHING`,
    [studentId]
  );

  const result = await client.query(
    `SELECT total_xp, level, current_streak, longest_streak,
            to_char(last_activity_date, 'YYYY-MM-DD') AS last_activity_date
     FROM student_gamification
     WHERE student_id = $1
     FOR UPDATE`,
    [studentId]
  );

  return result.rows[0];
}

async function getSubmittedAttempt(client, attemptId) {
  const result = await client.query(
    `SELECT id, exam_id, student_id, status, submitted_at
     FROM exam_attempts
     WHERE id = $1
     FOR UPDATE`,
    [attemptId]
  );

  return result.rows[0] || null;
}

async function getAttemptResult(client, attemptId) {
  const result = await client.query(
    `SELECT id, score, maximum_score, percentage, correct_count,
            incorrect_count, unanswered_count
     FROM exam_results
     WHERE attempt_id = $1`,
    [attemptId]
  );

  return result.rows[0] || null;
}

async function getCorrectAnswerReferences(client, attemptId) {
  const result = await client.query(
    `SELECT exam_question_id
     FROM student_answers
     WHERE attempt_id = $1 AND is_correct = TRUE
     ORDER BY exam_question_id`,
    [attemptId]
  );

  return result.rows.map((row) => row.exam_question_id);
}

async function insertXpTransaction(client, data) {
  const result = await client.query(
    `INSERT INTO xp_transactions
       (student_id, source_type, source_reference_id, xp_amount, reason)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (student_id, source_type, source_reference_id, reason)
       WHERE source_reference_id IS NOT NULL
     DO NOTHING
     RETURNING id`,
    [
      data.studentId,
      data.sourceType,
      data.sourceReferenceId,
      data.xpAmount,
      data.reason
    ]
  );

  return result.rowCount === 1;
}

async function incrementTotalXp(client, studentId, xpAmount) {
  const result = await client.query(
    `UPDATE student_gamification
     SET total_xp = total_xp + $2,
         level = FLOOR((total_xp + $2)::numeric / 500)::int + 1,
         updated_at = NOW()
     WHERE student_id = $1
     RETURNING total_xp, level`,
    [studentId, xpAmount]
  );

  return result.rows[0];
}

async function getDatabaseActivityDate(client) {
  const result = await client.query(
    `SELECT to_char(CURRENT_DATE, 'YYYY-MM-DD') AS today,
            to_char(CURRENT_DATE - 1, 'YYYY-MM-DD') AS yesterday`
  );

  return result.rows[0];
}

async function updateStreak(client, studentId, currentStreak, longestStreak, today) {
  const result = await client.query(
    `UPDATE student_gamification
     SET current_streak = $2,
         longest_streak = GREATEST(longest_streak, $3),
         last_activity_date = $4::date,
         updated_at = NOW()
     WHERE student_id = $1
     RETURNING current_streak, longest_streak, total_xp, level`,
    [studentId, currentStreak, longestStreak, today]
  );

  return result.rows[0];
}

async function getBadgeEvaluationStats(client, studentId) {
  const result = await client.query(
    `SELECT
       sg.total_xp,
       sg.current_streak,
       (SELECT COUNT(*)::int
        FROM exam_results er
        WHERE er.student_id = $1) AS completed_attempts,
       (SELECT COUNT(*)::int
        FROM student_answers sa
        JOIN exam_attempts ea ON ea.id = sa.attempt_id
        WHERE ea.student_id = $1
          AND ea.status IN ('submitted', 'auto_submitted')
          AND sa.is_correct = TRUE) AS correct_answers,
       (SELECT COUNT(*)::int
        FROM exam_results er
        WHERE er.student_id = $1
          AND er.percentage = 100) AS perfect_attempts
     FROM student_gamification sg
     WHERE sg.student_id = $1`,
    [studentId]
  );

  return result.rows[0];
}

async function getActiveBadges(client) {
  const result = await client.query(
    `SELECT id, code, name, criteria, xp_reward
     FROM badges
     WHERE is_active = TRUE`
  );

  return result.rows;
}

async function insertStudentBadge(client, studentId, badgeId, attemptId) {
  const result = await client.query(
    `INSERT INTO student_badges (student_id, badge_id, source_attempt_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (student_id, badge_id) DO NOTHING
     RETURNING badge_id`,
    [studentId, badgeId, attemptId]
  );

  return result.rowCount === 1;
}

async function getSummaryWithinTransaction(client, studentId) {
  const result = await client.query(
    `SELECT total_xp, level, current_streak, longest_streak,
            last_activity_date
     FROM student_gamification
     WHERE student_id = $1`,
    [studentId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getStudentSummary,
  getTransactions,
  getStudentBadges,
  getLeaderboard,
  getAllBadges,
  createBadge,
  updateBadgeStatus,
  lockGamificationRow,
  getSubmittedAttempt,
  getAttemptResult,
  getCorrectAnswerReferences,
  insertXpTransaction,
  incrementTotalXp,
  getDatabaseActivityDate,
  updateStreak,
  getBadgeEvaluationStats,
  getActiveBadges,
  insertStudentBadge,
  getSummaryWithinTransaction
};
