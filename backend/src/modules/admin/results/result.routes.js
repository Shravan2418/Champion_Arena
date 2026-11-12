const express = require("express");
const controller = require("./result.controller");

const asyncHandlerModule = require("../../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", asyncHandler(controller.listResults));
router.get("/exams/:examId/summary", asyncHandler(controller.getExamSummary));
router.post("/exams/:examId/release", asyncHandler(controller.releaseManualResults));
router.get("/:resultId", asyncHandler(controller.getResultDetail));

module.exports = router;
