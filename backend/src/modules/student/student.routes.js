const express = require("express");
const controller = require("./student.controller");

const asyncHandlerModule = require("../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("student"));

router.get("/profile", asyncHandler(controller.getProfile));
router.patch("/profile", asyncHandler(controller.updateProfile));
router.get("/dashboard", asyncHandler(controller.getDashboard));
router.get("/analytics/performance", asyncHandler(controller.getPerformance));

module.exports = router;
