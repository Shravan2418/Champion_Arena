const { z } = require("zod");

const idParamsSchema = z.object({
  id: z.string().uuid("Invalid ID")
});

const subjectIdParamsSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID")
});

const createSubjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).nullable().optional()
});

const updateSubjectSchema = createSubjectSchema;

const createTopicSchema = z.object({
  name: z.string().trim().min(2).max(120)
});

const updateTopicSchema = createTopicSchema;

module.exports = {
  idParamsSchema,
  subjectIdParamsSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createTopicSchema,
  updateTopicSchema
};
