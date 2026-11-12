const { z } = require("zod");

const notificationTypes = [
  "general",
  "announcement",
  "exam",
  "result",
  "reward",
  "system"
];

const notificationIdParamsSchema = z.object({
  notificationId: z.string().uuid("Invalid notification ID")
});

const batchIdParamsSchema = z.object({
  batchId: z.string().uuid("Invalid notification batch ID")
});

const listNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.enum(["true", "false"]).transform((value) => value === "true").optional().default(false),
  type: z.enum(notificationTypes).optional()
});

const listAdminBatchesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(notificationTypes).optional()
});

const listBatchRecipientsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(["all", "read", "unread"]).default("all")
});

const sendNotificationSchema = z.object({
  target: z.enum(["all_students", "student"]),
  studentId: z.string().uuid().optional(),
  type: z.enum(notificationTypes).default("announcement"),
  title: z.string().trim().min(2).max(180),
  message: z.string().trim().min(1).max(5000),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
  expiresAt: z.string().datetime({ offset: true }).optional().nullable()
}).superRefine((data, context) => {
  if (data.target === "student" && !data.studentId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "studentId is required when target is student",
      path: ["studentId"]
    });
  }

  if (data.target === "all_students" && data.studentId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "studentId must not be supplied when target is all_students",
      path: ["studentId"]
    });
  }
});

module.exports = {
  notificationIdParamsSchema,
  batchIdParamsSchema,
  listNotificationsSchema,
  listAdminBatchesSchema,
  listBatchRecipientsSchema,
  sendNotificationSchema
};
