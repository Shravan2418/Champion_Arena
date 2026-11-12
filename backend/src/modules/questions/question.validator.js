const { z } = require("zod");

const optionSchema = z.object({
  key: z.enum(["A", "B", "C", "D"]),
  text: z.string().trim().min(1, "Option text is required").max(1000),
  isCorrect: z.boolean()
});

const questionPayloadSchema = z
  .object({
    questionText: z.string().trim().min(1, "Question text is required").max(5000),

    explanation: z.string().trim().max(5000).nullable().optional(),

    subjectId: z.string().uuid().nullable().optional(),

    topicId: z.string().uuid().nullable().optional(),

    difficulty: z.enum(["easy", "medium", "hard"]),

    options: z.array(optionSchema).length(4, "Exactly four options are required")
  })
  .superRefine((data, context) => {
    const keys = data.options.map((option) => option.key);
    const uniqueKeys = new Set(keys);

    if (uniqueKeys.size !== 4) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options must have unique keys A, B, C and D",
        path: ["options"]
      });
    }

    if (!["A", "B", "C", "D"].every((key) => uniqueKeys.has(key))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "All four option keys A, B, C and D are required",
        path: ["options"]
      });
    }

    const correctCount = data.options.filter(
      (option) => option.isCorrect
    ).length;

    if (correctCount !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one option must be marked as correct",
        path: ["options"]
      });
    }
  });

const listQuestionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().optional(),

  subjectId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),

  difficulty: z.enum(["easy", "medium", "hard"]).optional(),

  status: z.enum(["active", "archived", "all"]).default("active")
});

const questionIdSchema = z.object({
  id: z.string().uuid("Invalid question ID")
});

module.exports = {
  createQuestionSchema: questionPayloadSchema,
  updateQuestionSchema: questionPayloadSchema,
  listQuestionsSchema,
  questionIdSchema
};
