const pool = require("../../config/database");
const repository = require("./reward.repository");

const XP_RULES = Object.freeze({
  CORRECT_ANSWER: 10,
  EXAM_COMPLETION: 20,
  DAILY_ACTIVITY: 5,
  SEVEN_DAY_STREAK: 25,
  XP_PER_LEVEL: 500
});

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function badgeCriteriaMet(criteria, stats) {
  if (!criteria || !criteria.type || !Number.isFinite(Number(criteria.threshold))) {
    return false;
  }

  const values = {
    total_xp: Number(stats.total_xp),
    completed_attempts: Number(stats.completed_attempts),
    correct_answers: Number(stats.correct_answers),
    streak_days: Number(stats.current_streak),
    perfect_attempts: Number(stats.perfect_attempts)
  };

  return Object.prototype.hasOwnProperty.call(values, criteria.type) &&
    values[criteria.type] >= Number(criteria.threshold);
}

async function awardXp(client, { studentId, sourceType, attemptId, amount, reason }) {
  if (!amount || amount <= 0) return false;

  const inserted = await repository.insertXpTransaction(client, {
    studentId,
    sourceType,
    sourceReferenceId: attemptId,
    xpAmount: amount,
    reason
  });

  if (inserted) {
    await repository.incrementTotalXp(client, studentId, amount);
  }

  return inserted;
}

async function evaluateAndAwardBadges(client, studentId, attemptId) {
  const [stats, badges] = await Promise.all([
    repository.getBadgeEvaluationStats(client, studentId),
    repository.getActiveBadges(client)
  ]);

  const newlyEarned = [];

  for (const badge of badges) {
    if (!badgeCriteriaMet(badge.criteria, stats)) continue;

    const inserted = await repository.insertStudentBadge(
      client,
      studentId,
      badge.id,
      attemptId
    );

    if (!inserted) continue;

    newlyEarned.push({ id: badge.id, code: badge.code, name: badge.name });

    if (Number(badge.xp_reward) > 0) {
      await awardXp(client, {
        studentId,
        sourceType: "badge_reward",
        attemptId,
        amount: Number(badge.xp_reward),
        reason: `Badge reward: ${badge.code}`
      });
    }
  }

  return newlyEarned;
}

/**
 * Call after the attempt service has committed exam_attempts and exam_results.
 * The function validates the saved attempt and derives all reward inputs from
 * PostgreSQL; it never trusts client-submitted scores or correctness values.
 */
async function awardForAttempt({ studentId, attemptId }) {
  if (!studentId || !attemptId) {
    throw createError("studentId and attemptId are required.", 400);
  }

  const client = await pool.connect();
  let newlyEarnedBadges = [];

  try {
    await client.query("BEGIN");

    const attempt = await repository.getSubmittedAttempt(client, attemptId);

    if (!attempt) {
      throw createError("Exam attempt not found.", 404);
    }

    if (attempt.student_id !== studentId) {
      throw createError("You cannot receive rewards for another student's attempt.", 403);
    }

    if (!['submitted', 'auto_submitted'].includes(attempt.status)) {
      throw createError("Rewards are available after an attempt is submitted.", 409);
    }

    const result = await repository.getAttemptResult(client, attemptId);

    if (!result) {
      throw createError("The evaluated result must be saved before rewards are awarded.", 409);
    }

    await repository.lockGamificationRow(client, studentId);

    const correctQuestionIds = await repository.getCorrectAnswerReferences(client, attemptId);

    for (const examQuestionId of correctQuestionIds) {
      const inserted = await awardXp(client, {
        studentId,
        sourceType: "correct_answer",
        attemptId,
        amount: XP_RULES.CORRECT_ANSWER,
        reason: `Correct answer: ${examQuestionId}`
      });
    }

    const completionInserted = await awardXp(client, {
      studentId,
      sourceType: "exam_completion",
      attemptId,
      amount: XP_RULES.EXAM_COMPLETION,
      reason: "Exam attempt completed"
    });

    const gamification = await repository.lockGamificationRow(client, studentId);
    const dates = await repository.getDatabaseActivityDate(client);
    const lastActivity = gamification.last_activity_date;
    const isNewActivityDay = lastActivity !== dates.today;

    if (isNewActivityDay) {
      let nextStreak = 1;
      if (lastActivity === dates.yesterday) {
        nextStreak = Number(gamification.current_streak) + 1;
      }

      const nextLongest = Math.max(Number(gamification.longest_streak), nextStreak);
      await repository.updateStreak(client, studentId, nextStreak, nextLongest, dates.today);

      const dailyInserted = await awardXp(client, {
        studentId,
        sourceType: "daily_activity",
        attemptId,
        amount: XP_RULES.DAILY_ACTIVITY,
        reason: `Daily activity: ${dates.today}`
      });

      if (nextStreak > 0 && nextStreak % 7 === 0) {
        const streakInserted = await awardXp(client, {
          studentId,
          sourceType: "practice_streak",
          attemptId,
          amount: XP_RULES.SEVEN_DAY_STREAK,
          reason: `${nextStreak}-day activity streak: ${dates.today}`
        });
      }
    }

    newlyEarnedBadges = await evaluateAndAwardBadges(client, studentId, attemptId);

    // Include badge XP added during badge evaluation in this response.
    const totalResult = await client.query(
      `SELECT COALESCE(SUM(xp_amount), 0)::int AS xp_for_attempt
       FROM xp_transactions
       WHERE student_id = $1 AND source_reference_id = $2`,
      [studentId, attemptId]
    );
    const xpFromThisAttempt = Number(totalResult.rows[0].xp_for_attempt);

    await client.query("COMMIT");

    const summary = await repository.getStudentSummary(studentId);

    return {
      xpAwarded: xpFromThisAttempt,
      newlyEarnedBadges,
      gamification: summary
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Reward transaction rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

async function getStudentSummary(studentId) {
  const summary = await repository.getStudentSummary(studentId);
  if (!summary) throw createError("Student account not found.", 404);
  return summary;
}

async function getTransactions(studentId, filters) {
  return repository.getTransactions(studentId, filters);
}

async function getStudentBadges(studentId) {
  return repository.getStudentBadges(studentId);
}

async function getLeaderboard(studentId, limit) {
  return repository.getLeaderboard(studentId, limit);
}

async function getAllBadges() {
  return repository.getAllBadges();
}

async function createBadge(data) {
  try {
    return await repository.createBadge(data);
  } catch (error) {
    if (error.code === "23505") {
      throw createError("A badge with this code already exists.", 409);
    }
    throw error;
  }
}

async function updateBadgeStatus(badgeId, isActive) {
  const badge = await repository.updateBadgeStatus(badgeId, isActive);
  if (!badge) throw createError("Badge not found.", 404);
  return badge;
}

module.exports = {
  XP_RULES,
  awardForAttempt,
  getStudentSummary,
  getTransactions,
  getStudentBadges,
  getLeaderboard,
  getAllBadges,
  createBadge,
  updateBadgeStatus
};
