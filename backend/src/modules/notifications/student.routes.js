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
router.use(requireRole("student"));

router.get("/", asyncHandler(notificationController.listForStudent));
router.get("/unread-count", asyncHandler(notificationController.getUnreadCount));
router.patch("/read-all", asyncHandler(notificationController.markAllAsRead));
router.patch("/:notificationId/read", asyncHandler(notificationController.markAsRead));
router.delete("/:notificationId", asyncHandler(notificationController.deleteForStudent));

module.exports = router;
