const express = require("express");

const questionController = require("./question.controller");

const asyncHandlerModule = require("../../utils/asyncHandler");
const asyncHandler =
  asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

// Every Question Bank endpoint requires an authenticated Admin.
router.use(requireAuth);
router.use(requireRole("admin"));

// Create a reusable Question Bank question.
router.post(
  "/",
  asyncHandler(questionController.createQuestion)
);

// List questions with search, filters and pagination.
router.get(
  "/",
  asyncHandler(questionController.getQuestions)
);

// Get a question, its current version and version history.
router.get(
  "/:id",
  asyncHandler(questionController.getQuestionById)
);

// Update question by creating a new immutable version.
router.put(
  "/:id",
  asyncHandler(questionController.updateQuestion)
);

// Archive instead of permanently deleting.
router.delete(
  "/:id",
  asyncHandler(questionController.archiveQuestion)
);

module.exports = router;
