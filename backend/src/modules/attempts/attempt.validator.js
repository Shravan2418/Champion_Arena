const { z } = require("zod");

const uuidSchema = z.string().uuid("Invalid UUID");

const examIdParamsSchema = z.object({
  examId: uuidSchema
});

const attemptIdParamsSchema = z.object({
  attemptId: uuidSchema
});

const saveAnswerParamsSchema = z.object({
  attemptId: uuidSchema,
  examQuestionId: uuidSchema
});

const saveAnswerBodySchema = z
  .object({
    selectedOptionId: uuidSchema.nullable().optional(),
    markedForReview: z.boolean().optional()
  })
  .strict()
  .refine(
    (data) =>
      Object.prototype.hasOwnProperty.call(data, "selectedOptionId") ||
      Object.prototype.hasOwnProperty.call(data, "markedForReview"),
    { message: "Provide selectedOptionId, markedForReview, or both." }
  );

const listExamsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(180).optional(),
  examMode: z.enum(["practice", "formal"]).optional(),
  subjectId: uuidSchema.optional()
});

module.exports = {
  examIdParamsSchema,
  attemptIdParamsSchema,
  saveAnswerParamsSchema,
  saveAnswerBodySchema,
  listExamsQuerySchema
};
