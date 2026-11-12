const express = require("express");
const controller = require("./reward.controller");

const asyncHandlerModule = require("../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("student"));

router.get("/summary", asyncHandler(controller.getSummary));
router.get("/transactions", asyncHandler(controller.getTransactions));
router.get("/badges", asyncHandler(controller.getStudentBadges));
router.get("/leaderboard", asyncHandler(controller.getLeaderboard));

module.exports = router;
