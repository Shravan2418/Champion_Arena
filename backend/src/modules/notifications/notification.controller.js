const notificationService = require("./notification.service");
const {
  notificationIdParamsSchema,
  batchIdParamsSchema,
  listNotificationsSchema,
  listAdminBatchesSchema,
  listBatchRecipientsSchema,
  sendNotificationSchema
} = require("./notification.validator");

function validate(schema, value) {
  const result = schema.safeParse(value);

  if (!result.success) {
    const error = new Error("Validation failed.");
    error.statusCode = 400;
    error.details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));
    throw error;
  }

  return result.data;
}

async function listForStudent(req, res) {
  const filters = validate(listNotificationsSchema, req.query);
  const result = await notificationService.listForStudent(req.user.id, filters);

  res.status(200).json({
    success: true,
    data: result.items,
    unreadCount: result.unreadCount,
    pagination: result.pagination
  });
}

async function getUnreadCount(req, res) {
  const unreadCount = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { unreadCount }
  });
}

async function markAsRead(req, res) {
  const { notificationId } = validate(
    notificationIdParamsSchema,
    req.params
  );
  const result = await notificationService.markAsRead(
    req.user.id,
    notificationId
  );

  res.status(200).json({
    success: true,
    message: "Notification marked as read.",
    data: result
  });
}

async function markAllAsRead(req, res) {
  const result = await notificationService.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
    data: result
  });
}

async function deleteForStudent(req, res) {
  const { notificationId } = validate(
    notificationIdParamsSchema,
    req.params
  );
  const result = await notificationService.deleteForStudent(
    req.user.id,
    notificationId
  );

  res.status(200).json({
    success: true,
    message: "Notification deleted.",
    data: result
  });
}

async function sendNotification(req, res) {
  const data = validate(sendNotificationSchema, req.body);
  const result = await notificationService.sendNotification(data, req.user.id);

  res.status(201).json({
    success: true,
    message: "Notification sent successfully.",
    data: result
  });
}

async function listAdminBatches(req, res) {
  const filters = validate(listAdminBatchesSchema, req.query);
  const result = await notificationService.listAdminBatches(
    req.user.id,
    filters
  );

  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
}

async function getAdminBatch(req, res) {
  const { batchId } = validate(batchIdParamsSchema, req.params);
  const batch = await notificationService.getAdminBatch(
    req.user.id,
    batchId
  );

  res.status(200).json({
    success: true,
    data: batch
  });
}

async function listBatchRecipients(req, res) {
  const { batchId } = validate(batchIdParamsSchema, req.params);
  const filters = validate(listBatchRecipientsSchema, req.query);
  const result = await notificationService.listBatchRecipients(
    req.user.id,
    batchId,
    filters
  );

  res.status(200).json({
    success: true,
    data: result.items,
    batch: result.batch,
    pagination: result.pagination
  });
}

module.exports = {
  listForStudent,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteForStudent,
  sendNotification,
  listAdminBatches,
  getAdminBatch,
  listBatchRecipients
};
