const { z } = require("zod");

const createInstitutionSchema = z.object({
  name: z.string().trim().min(2).max(180),
  institutionType: z.string().trim().max(40).nullable().optional()
}).strict();

const updateInstitutionSchema = z.object({
  name: z.string().trim().min(2).max(180).optional(),
  institutionType: z.string().trim().max(40).nullable().optional(),
  isActive: z.boolean().optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update."
});

const institutionIdSchema = z.object({
  institutionId: z.string().uuid("Invalid institution ID")
});

const listInstitutionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(180).optional(),
  status: z.enum(["active", "inactive", "all"]).default("all")
});

module.exports = {
  createInstitutionSchema,
  updateInstitutionSchema,
  institutionIdSchema,
  listInstitutionsSchema
};
