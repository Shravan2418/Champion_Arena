const pool = require("../../config/database");

async function getProfile(studentId) {
  const userResult = await pool.query(
    `SELECT id, full_name, email, role, created_at
     FROM users
     WHERE id = $1 AND role = 'student' AND is_active = TRUE`,
    [studentId]
  );

  if (userResult.rows.length === 0) return null;

  const membershipsResult = await pool.query(
    `SELECT
       i.id AS institution_id,
       i.name AS institution_name,
       i.institution_type,
       si.membership_status,
       si.student_identifier,
       si.department,
       si.course_or_program,
       si.academic_year,
       si.joined_at
     FROM student_institutions si
     JOIN institutions i ON i.id = si.institution_id
     WHERE si.student_id = $1
     ORDER BY si.joined_at DESC`,
    [studentId]
  );

  return {
    ...userResult.rows[0],
    institutions: membershipsResult.rows
  };
}

async function updateProfile(studentId, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (data.fullName !== undefined) {
      const userResult = await client.query(
        `UPDATE users
         SET full_name = $1, updated_at = NOW()
         WHERE id = $2 AND role = 'student' AND is_active = TRUE
         RETURNING id`,
        [data.fullName, studentId]
      );

      if (userResult.rowCount === 0) {
        const error = new Error("Student account not found.");
        error.statusCode = 404;
        throw error;
      }
    }

    if (data.institution) {
      const institution = data.institution;
      const fields = [
        ["student_identifier", "studentIdentifier"],
        ["department", "department"],
        ["course_or_program", "courseOrProgram"],
        ["academic_year", "academicYear"]
      ];

      const sets = [];
      const values = [studentId, institution.institutionId];

      for (const [column, property] of fields) {
        if (Object.prototype.hasOwnProperty.call(institution, property)) {
          values.push(institution[property]);
          sets.push(`${column} = $${values.length}`);
        }
      }

      if (sets.length > 0) {
        const membershipResult = await client.query(
          `UPDATE student_institutions
           SET ${sets.join(", ")}
           WHERE student_id = $1
             AND institution_id = $2
           RETURNING student_id`,
          values
        );

        if (membershipResult.rowCount === 0) {
          const error = new Error(
            "You are not registered as a member of the selected institution."
          );
          error.statusCode = 404;
          throw error;
        }
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Profile update rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }

  return getProfile(studentId);
}

async function getDashboard(studentId) {
  const summaryResult = await pool.query(
    `SELECT
       COALESCE(sg.total_xp, 0)::bigint AS total_xp,
       COALESCE(sg.level, 1)::int AS level,
       COALESCE(sg.current_streak, 0)::int AS current_streak,
       COALESCE(sg.longest_streak, 0)::int AS longest_streak,
       (SELECT COUNT(*)::int
        FROM exam_attempts ea
        WHERE ea.student_id = u.id) AS total_attempts,
       (SELECT COUNT(*)::int
        FROM exam_attempts ea
        WHERE ea.student_id = u.id
          AND ea.status IN ('submitted', 'auto_submitted')) AS completed_attempts,
       (SELECT COUNT(*)::int
        FROM exam_results er
        WHERE er.student_id = u.id) AS evaluated_exams,
       (SELECT COALESCE(ROUND(AVG(er.percentage)::numeric, 2), 0)
        FROM exam_results er
        WHERE er.student_id = u.id) AS average_percentage,
       (SELECT COALESCE(MAX(er.percentage), 0)
        FROM exam_results er
        WHERE er.student_id = u.id) AS best_percentage,
       (SELECT COUNT(*)::int
        FROM student_badges sb
        WHERE sb.student_id = u.id) AS badges_earned
     FROM users u
     LEFT JOIN student_gamification sg ON sg.student_id = u.id
     WHERE u.id = $1
       AND u.role = 'student'
       AND u.is_active = TRUE`,
    [studentId]
  );

  if (summaryResult.rows.length === 0) return null;

  const recentResultsResult = await pool.query(
    `SELECT
       er.id AS result_id,
       er.attempt_id,
       er.exam_id,
       e.title AS exam_title,
       e.exam_mode,
       er.score,
       er.maximum_score,
       er.percentage,
       er.correct_count,
       er.incorrect_count,
       er.unanswered_count,
       er.time_taken_seconds,
       er.evaluated_at
     FROM exam_results er
     JOIN exams e ON e.id = er.exam_id
     WHERE er.student_id = $1
     ORDER BY er.evaluated_at DESC
     LIMIT 5`,
    [studentId]
  );

  const nextBadgesResult = await pool.query(
    `SELECT
       b.id,
       b.code,
       b.name,
       b.description,
       b.tier,
       b.icon_name,
       b.xp_reward,
       (sb.student_id IS NOT NULL) AS earned,
       sb.earned_at
     FROM badges b
     LEFT JOIN student_badges sb
       ON sb.badge_id = b.id AND sb.student_id = $1
     WHERE b.is_active = TRUE
     ORDER BY
       (sb.student_id IS NOT NULL) DESC,
       CASE b.tier
         WHEN 'bronze' THEN 1
         WHEN 'silver' THEN 2
         WHEN 'gold' THEN 3
         WHEN 'platinum' THEN 4
       END,
       b.name
     LIMIT 6`,
    [studentId]
  );

  return {
    summary: summaryResult.rows[0],
    recentResults: recentResultsResult.rows,
    badges: nextBadgesResult.rows
  };
}

async function getPerformance(studentId, days) {
  const trendResult = await pool.query(
    `SELECT
       DATE_TRUNC('day', er.evaluated_at)::date AS result_date,
       ROUND(AVG(er.percentage)::numeric, 2) AS average_percentage,
       COUNT(*)::int AS exams_count
     FROM exam_results er
     WHERE er.student_id = $1
       AND ($2::int = 0 OR er.evaluated_at >= NOW() - make_interval(days => $2::int))
     GROUP BY DATE_TRUNC('day', er.evaluated_at)::date
     ORDER BY result_date ASC`,
    [studentId, days]
  );

  const subjectResult = await pool.query(
    `SELECT
       COALESCE(s.name, 'Uncategorized') AS subject_name,
       COUNT(*)::int AS exams_count,
       ROUND(AVG(er.percentage)::numeric, 2) AS average_percentage,
       ROUND(MAX(er.percentage)::numeric, 2) AS best_percentage
     FROM exam_results er
     JOIN exams e ON e.id = er.exam_id
     LEFT JOIN subjects s ON s.id = e.subject_id
     WHERE er.student_id = $1
       AND ($2::int = 0 OR er.evaluated_at >= NOW() - make_interval(days => $2::int))
     GROUP BY COALESCE(s.name, 'Uncategorized')
     ORDER BY average_percentage DESC, exams_count DESC`,
    [studentId, days]
  );

  const totalsResult = await pool.query(
    `SELECT
       COUNT(*)::int AS exams_count,
       COALESCE(ROUND(AVG(percentage)::numeric, 2), 0) AS average_percentage,
       COALESCE(ROUND(MAX(percentage)::numeric, 2), 0) AS best_percentage,
       COALESCE(SUM(correct_count), 0)::int AS correct_answers,
       COALESCE(SUM(incorrect_count), 0)::int AS incorrect_answers,
       COALESCE(SUM(unanswered_count), 0)::int AS unanswered_questions
     FROM exam_results
     WHERE student_id = $1
       AND ($2::int = 0 OR evaluated_at >= NOW() - make_interval(days => $2::int))`,
    [studentId, days]
  );

  return {
    periodDays: days,
    totals: totalsResult.rows[0],
    dailyTrend: trendResult.rows,
    subjectPerformance: subjectResult.rows
  };
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getPerformance
};
