const express = require("express");
const examController = require("./exam.controller");

const asyncHandlerModule = require("../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

// Exam creation and management are restricted to Admin accounts.
router.use(requireAuth);
router.use(requireRole("admin"));

router.post("/", asyncHandler(examController.createExam));
router.get("/", asyncHandler(examController.getExams));
router.get("/:id", asyncHandler(examController.getExamById));
router.put("/:id", asyncHandler(examController.updateExam));

router.post("/:id/questions/bank", asyncHandler(examController.attachBankQuestion));
router.post("/:id/questions/custom", asyncHandler(examController.createExamSpecificQuestion));
router.delete("/:examId/questions/:examQuestionId", asyncHandler(examController.removeExamQuestion));

router.post("/:id/assignments", asyncHandler(examController.assignStudents));
router.post("/:id/publish", asyncHandler(examController.publishExam));
router.post("/:id/archive", asyncHandler(examController.archiveExam));

module.exports = router;
