const { z } = require("zod");

const studentIdSchema = z.object({
  studentId: z.string().uuid("Invalid student ID")
});

const listStudentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(254).optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  institutionId: z.string().uuid().optional()
});

const studentStatusSchema = z.object({
  isActive: z.boolean()
}).strict();

const assignInstitutionSchema = z.object({
  studentIdentifier: z.string().trim().max(80).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  courseOrProgram: z.string().trim().max(120).nullable().optional(),
  academicYear: z.string().trim().max(30).nullable().optional()
}).strict();

const membershipStatusSchema = z.object({
  membershipStatus: z.enum(["active", "inactive"])
}).strict();

const studentInstitutionParamsSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  institutionId: z.string().uuid("Invalid institution ID")
});

module.exports = {
  studentIdSchema,
  listStudentsSchema,
  studentStatusSchema,
  assignInstitutionSchema,
  membershipStatusSchema,
  studentInstitutionParamsSchema
};
