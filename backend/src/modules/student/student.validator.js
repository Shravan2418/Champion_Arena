const { z } = require("zod");

const institutionProfileSchema = z.object({
  institutionId: z.string().uuid("Invalid institution ID"),
  studentIdentifier: z.string().trim().max(80).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  courseOrProgram: z.string().trim().max(120).nullable().optional(),
  academicYear: z.string().trim().max(30).nullable().optional()
}).strict().refine(
  (data) => Object.keys(data).some((key) => key !== "institutionId"),
  { message: "Provide at least one institution field to update" }
);

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  institution: institutionProfileSchema.optional()
}).strict().refine(
  (data) => data.fullName !== undefined || data.institution !== undefined,
  { message: "Provide at least one profile field to update" }
);

const performanceQuerySchema = z.object({
  days: z.coerce.number().int().refine(
    (value) => [7, 30, 90, 365, 0].includes(value),
    { message: "days must be 7, 30, 90, 365 or 0 (all time)" }
  ).default(30)
});

module.exports = {
  updateProfileSchema,
  performanceQuerySchema
};
