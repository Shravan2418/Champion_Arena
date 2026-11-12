const express = require("express");
const controller = require("./student.controller");
const asyncHandlerModule = require("../../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;
const authModule = require("../../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;
const roleModule = require("../../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", asyncHandler(controller.listStudents));
router.get("/:studentId", asyncHandler(controller.getStudent));
router.patch("/:studentId/status", asyncHandler(controller.updateStudentStatus));
router.put(
  "/:studentId/institutions/:institutionId",
  asyncHandler(controller.assignInstitution)
);
router.patch(
  "/:studentId/institutions/:institutionId",
  asyncHandler(controller.updateMembershipStatus)
);

module.exports = router;
