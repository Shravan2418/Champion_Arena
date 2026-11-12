const { z } = require("zod");

const listResultsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  examId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  search: z.string().trim().max(120).optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional()
}).superRefine((value, ctx) => {
  if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dateTo"],
      message: "dateTo must be on or after dateFrom"
    });
  }
});

const idParamsSchema = z.object({
  resultId: z.string().uuid("Invalid result ID")
});

const examIdParamsSchema = z.object({
  examId: z.string().uuid("Invalid exam ID")
});

module.exports = {
  listResultsSchema,
  idParamsSchema,
  examIdParamsSchema
};
