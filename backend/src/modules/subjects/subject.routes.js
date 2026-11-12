const express = require("express");

const subjectController = require("./subject.controller");

const asyncHandlerModule = require("../../utils/asyncHandler");
const asyncHandler =
  asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

// Only authenticated Admin users can manage subjects and topics.
router.use(requireAuth);
router.use(requireRole("admin"));

// Subject management.
router.post("/", asyncHandler(subjectController.createSubject));
router.get("/", asyncHandler(subjectController.getSubjects));
router.get("/:id", asyncHandler(subjectController.getSubjectById));
router.put("/:id", asyncHandler(subjectController.updateSubject));
router.delete("/:id", asyncHandler(subjectController.deleteSubject));

// Topic management under a subject.
router.post(
  "/:subjectId/topics",
  asyncHandler(subjectController.createTopic)
);

router.get(
  "/:subjectId/topics",
  asyncHandler(subjectController.getTopics)
);

// Update and delete individual topics.
router.put(
  "/topics/:id",
  asyncHandler(subjectController.updateTopic)
);

router.delete(
  "/topics/:id",
  asyncHandler(subjectController.deleteTopic)
);

module.exports = router;
