const express = require("express");
const attemptController = require("./attempt.controller");

const asyncHandlerModule = require("../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

// Exam attempts are exclusively for authenticated Student accounts.
router.use(requireAuth);
router.use(requireRole("student"));

router.get("/exams", asyncHandler(attemptController.listExams));
router.get("/exams/:examId", asyncHandler(attemptController.getExamDetails));
router.post("/exams/:examId/attempts", asyncHandler(attemptController.startAttempt));

router.get("/attempts/:attemptId", asyncHandler(attemptController.getAttempt));
router.put(
  "/attempts/:attemptId/answers/:examQuestionId",
  asyncHandler(attemptController.saveAnswer)
);
router.post("/attempts/:attemptId/submit", asyncHandler(attemptController.submitAttempt));
router.get("/attempts/:attemptId/result", asyncHandler(attemptController.getAttemptResult));

module.exports = router;
