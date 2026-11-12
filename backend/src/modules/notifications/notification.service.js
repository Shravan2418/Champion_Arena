const crypto = require("crypto");
const notificationRepository = require("./notification.repository");

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listForStudent(studentId, filters) {
  return notificationRepository.listForStudent(studentId, filters);
}

async function getUnreadCount(studentId) {
  return notificationRepository.getUnreadCount(studentId);
}

async function markAsRead(studentId, notificationId) {
  const notification = await notificationRepository.markAsRead(
    studentId,
    notificationId
  );

  if (!notification) {
    throw createError("Notification not found.", 404);
  }

  return notification;
}

async function markAllAsRead(studentId) {
  const updatedCount = await notificationRepository.markAllAsRead(studentId);
  return { updatedCount };
}

async function deleteForStudent(studentId, notificationId) {
  const notification = await notificationRepository.deleteForStudent(
    studentId,
    notificationId
  );

  if (!notification) {
    throw createError("Notification not found.", 404);
  }

  return { deleted: true };
}

async function sendNotification(data, adminId) {
  const batchId = crypto.randomUUID();
  const payload = {
    batchId,
    createdBy: adminId,
    type: data.type,
    title: data.title,
    message: data.message,
    payload: data.payload,
    expiresAt: data.expiresAt || null
  };

  let recipientCount;

  if (data.target === "all_students") {
    recipientCount = await notificationRepository.sendToAllStudents(payload);
  } else {
    recipientCount = await notificationRepository.sendToStudent({
      ...payload,
      studentId: data.studentId
    });

    if (recipientCount === 0) {
      throw createError(
        "The specified active student account was not found.",
        404
      );
    }
  }

  if (data.target === "all_students" && recipientCount === 0) {
    throw createError("There are no active student accounts to notify.", 409);
  }

  return {
    batchId,
    recipientCount,
    target: data.target
  };
}

async function listAdminBatches(adminId, filters) {
  return notificationRepository.listAdminBatches(adminId, filters);
}

async function getAdminBatch(adminId, batchId) {
  const batch = await notificationRepository.getAdminBatch(adminId, batchId);

  if (!batch) {
    throw createError("Notification batch not found.", 404);
  }

  return batch;
}

async function listBatchRecipients(adminId, batchId, filters) {
  const batch = await getAdminBatch(adminId, batchId);
  const recipients = await notificationRepository.listBatchRecipients(
    adminId,
    batchId,
    filters
  );

  return {
    batch,
    ...recipients
  };
}

// Internal helpers for other backend modules (exam, results, rewards, etc.).
// Pass an existing pg client as db when notification creation must share a transaction.
async function createForUser(data, db) {
  return notificationRepository.createForUser(data, db);
}

async function createForUsers(data, db) {
  if (!Array.isArray(data.recipientIds) || data.recipientIds.length === 0) {
    return 0;
  }

  return notificationRepository.createForUsers(data, db);
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
  listBatchRecipients,
  createForUser,
  createForUsers
};
