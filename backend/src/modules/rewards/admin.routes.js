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
router.use(requireRole("admin"));

router.get("/badges", asyncHandler(controller.getAllBadges));
router.post("/badges", asyncHandler(controller.createBadge));
router.patch("/badges/:id/status", asyncHandler(controller.updateBadgeStatus));

module.exports = router;
