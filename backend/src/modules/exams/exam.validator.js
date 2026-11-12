const { z } = require("zod");

const optionSchema = z.object({
  key: z.enum(["A", "B", "C", "D"]),
  text: z.string().trim().min(1, "Option text is required").max(1000),
  isCorrect: z.boolean()
});

const optionsSchema = z.array(optionSchema).length(4, "Exactly four options are required")
  .superRefine((options, context) => {
    const keys = options.map((option) => option.key);
    if (new Set(keys).size !== 4 || !["A", "B", "C", "D"].every((key) => keys.includes(key))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options must contain unique keys A, B, C and D"
      });
    }
    if (options.filter((option) => option.isCorrect).length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one option must be marked as correct"
      });
    }
  });

const examPayloadSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(5000).nullable().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  examMode: z.enum(["practice", "formal"]),
  accessMode: z.enum(["public", "institution_code", "assigned"]),
  institutionId: z.string().uuid().nullable().optional(),
  durationSeconds: z.number().int().positive().max(86400),
  attemptLimit: z.number().int().min(1).max(32767).default(1),
  resultReleaseMode: z.enum(["immediately", "after_exam_end", "manual"]).default("immediately"),
  startsAt: z.string().datetime({ offset: true }).nullable().optional(),
  endsAt: z.string().datetime({ offset: true }).nullable().optional(),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showExplanationsAfterSubmit: z.boolean().default(true)
}).superRefine((data, context) => {
  if (data.accessMode === "institution_code" && !data.institutionId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["institutionId"],
      message: "Select an institution for institution-code access"
    });
  }
  if (data.accessMode !== "institution_code" && data.institutionId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["institutionId"],
      message: "Institution ID is only allowed for institution-code access"
    });
  }
  if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endsAt"],
      message: "End time must be later than start time"
    });
  }
});

const listExamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(["draft", "scheduled", "published", "archived", "all"]).default("all"),
  examMode: z.enum(["practice", "formal"]).optional(),
  accessMode: z.enum(["public", "institution_code", "assigned"]).optional()
});

const idParamsSchema = z.object({ id: z.string().uuid("Invalid exam ID") });
const examQuestionParamsSchema = z.object({
  examId: z.string().uuid("Invalid exam ID"),
  examQuestionId: z.string().uuid("Invalid exam question ID")
});

const attachBankQuestionSchema = z.object({
  questionId: z.string().uuid(),
  marks: z.number().positive().max(100000).default(1),
  negativeMarks: z.number().min(0).max(100000).default(0)
});

const createExamSpecificQuestionSchema = z.object({
  questionText: z.string().trim().min(1).max(5000),
  explanation: z.string().trim().max(5000).nullable().optional(),
  topicId: z.string().uuid().nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  options: optionsSchema,
  marks: z.number().positive().max(100000).default(1),
  negativeMarks: z.number().min(0).max(100000).default(0)
});

const assignmentsSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(1000),
  dueAt: z.string().datetime({ offset: true }).nullable().optional()
}).superRefine((data, context) => {
  if (new Set(data.studentIds).size !== data.studentIds.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["studentIds"],
      message: "Student IDs must not contain duplicates"
    });
  }
});

module.exports = {
  examPayloadSchema,
  listExamsSchema,
  idParamsSchema,
  examQuestionParamsSchema,
  attachBankQuestionSchema,
  createExamSpecificQuestionSchema,
  assignmentsSchema
};
