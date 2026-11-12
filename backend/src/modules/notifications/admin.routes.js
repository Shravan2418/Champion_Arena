const express = require("express");
const notificationController = require("./notification.controller");

const asyncHandlerModule = require("../../utils/asyncHandler");
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule;

const authModule = require("../../middleware/require-auth.middleware");
const requireAuth = authModule.requireAuth || authModule;

const roleModule = require("../../middleware/require-role.middleware");
const requireRole = roleModule.requireRole || roleModule;

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.post("/", asyncHandler(notificationController.sendNotification));
router.get("/", asyncHandler(notificationController.listAdminBatches));
router.get("/:batchId", asyncHandler(notificationController.getAdminBatch));
router.get("/:batchId/recipients", asyncHandler(notificationController.listBatchRecipients));

module.exports = router;
