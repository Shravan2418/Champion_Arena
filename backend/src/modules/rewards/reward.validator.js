const { z } = require("zod");

const badgeCriteriaSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("total_xp"), threshold: z.number().int().positive() }),
  z.object({ type: z.literal("completed_attempts"), threshold: z.number().int().positive() }),
  z.object({ type: z.literal("correct_answers"), threshold: z.number().int().positive() }),
  z.object({ type: z.literal("streak_days"), threshold: z.number().int().positive() }),
  z.object({ type: z.literal("perfect_attempts"), threshold: z.number().int().positive() })
]);

const badgeIdParamsSchema = z.object({
  id: z.string().uuid("Invalid badge ID")
});

const createBadgeSchema = z.object({
  code: z.string().trim().min(2).max(60).regex(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers and underscores"),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(2).max(1000),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]),
  iconName: z.string().trim().max(80).nullable().optional(),
  criteria: badgeCriteriaSchema,
  xpReward: z.number().int().min(0).max(100000).default(0)
});

const badgeStatusSchema = z.object({
  isActive: z.boolean()
});

const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

module.exports = {
  badgeIdParamsSchema,
  createBadgeSchema,
  badgeStatusSchema,
  transactionsQuerySchema,
  leaderboardQuerySchema
};
