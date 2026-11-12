const repository = require("./student.repository");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getProfile(studentId) {
  const profile = await repository.getProfile(studentId);
  if (!profile) throw createError("Student profile not found.", 404);
  return profile;
}

async function updateProfile(studentId, data) {
  const profile = await repository.updateProfile(studentId, data);
  if (!profile) throw createError("Student profile not found.", 404);
  return profile;
}

async function getDashboard(studentId) {
  const dashboard = await repository.getDashboard(studentId);
  if (!dashboard) throw createError("Student account not found.", 404);

  const summary = dashboard.summary;
  return {
    summary: {
      totalXp: Number(summary.total_xp),
      level: summary.level,
      currentStreak: summary.current_streak,
      longestStreak: summary.longest_streak,
      totalAttempts: summary.total_attempts,
      completedAttempts: summary.completed_attempts,
      evaluatedExams: summary.evaluated_exams,
      averagePercentage: Number(summary.average_percentage),
      bestPercentage: Number(summary.best_percentage),
      badgesEarned: summary.badges_earned
    },
    recentResults: dashboard.recentResults,
    badges: dashboard.badges
  };
}

async function getPerformance(studentId, days) {
  return repository.getPerformance(studentId, days);
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getPerformance
};
