const express = require("express");
const controller = require("./institution.controller");
const asyncHandlerModule = require("../../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;
const authModule = require("../../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;
const roleModule = require("../../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("admin"));

router.post("/", asyncHandler(controller.createInstitution));
router.get("/", asyncHandler(controller.listInstitutions));
router.get("/:institutionId", asyncHandler(controller.getInstitution));
router.patch("/:institutionId", asyncHandler(controller.updateInstitution));
router.post("/:institutionId/rotate-code", asyncHandler(controller.rotateInstitutionCode));

module.exports = router;
