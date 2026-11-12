const rewardService = require("./reward.service");
const {
  badgeIdParamsSchema,
  createBadgeSchema,
  badgeStatusSchema,
  transactionsQuerySchema,
  leaderboardQuerySchema
} = require("./reward.validator");

function validate(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error("Validation failed.");
    error.statusCode = 400;
    error.details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));
    throw error;
  }
  return result.data;
}

async function getSummary(req, res) {
  const summary = await rewardService.getStudentSummary(req.user.id);
  res.status(200).json({ success: true, data: summary });
}

async function getTransactions(req, res) {
  const filters = validate(transactionsQuerySchema, req.query);
  const result = await rewardService.getTransactions(req.user.id, filters);
  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
}

async function getStudentBadges(req, res) {
  const badges = await rewardService.getStudentBadges(req.user.id);
  res.status(200).json({ success: true, data: badges });
}

async function getLeaderboard(req, res) {
  const { limit } = validate(leaderboardQuerySchema, req.query);
  const leaderboard = await rewardService.getLeaderboard(req.user.id, limit);
  res.status(200).json({ success: true, data: leaderboard });
}

async function getAllBadges(req, res) {
  const badges = await rewardService.getAllBadges();
  res.status(200).json({ success: true, data: badges });
}

async function createBadge(req, res) {
  const data = validate(createBadgeSchema, req.body);
  const badge = await rewardService.createBadge(data);
  res.status(201).json({
    success: true,
    message: "Badge created successfully.",
    data: badge
  });
}

async function updateBadgeStatus(req, res) {
  const { id } = validate(badgeIdParamsSchema, req.params);
  const { isActive } = validate(badgeStatusSchema, req.body);
  const badge = await rewardService.updateBadgeStatus(id, isActive);
  res.status(200).json({
    success: true,
    message: "Badge status updated successfully.",
    data: badge
  });
}

module.exports = {
  getSummary,
  getTransactions,
  getStudentBadges,
  getLeaderboard,
  getAllBadges,
  createBadge,
  updateBadgeStatus
};
