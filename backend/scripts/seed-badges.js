require("dotenv").config();

const pool = require("../src/config/database");

const badges = [
  {
    code: "FIRST_STEPS",
    name: "First Steps",
    description: "Complete your first exam or practice attempt.",
    tier: "bronze",
    iconName: "flag",
    criteria: { type: "completed_attempts", threshold: 1 },
    xpReward: 20
  },
  {
    code: "TEN_ATTEMPTS",
    name: "Getting Consistent",
    description: "Complete 10 exam or practice attempts.",
    tier: "silver",
    iconName: "calendar-check",
    criteria: { type: "completed_attempts", threshold: 10 },
    xpReward: 50
  },
  {
    code: "ACCURACY_25",
    name: "Accuracy Builder",
    description: "Answer 25 questions correctly across submitted attempts.",
    tier: "silver",
    iconName: "target",
    criteria: { type: "correct_answers", threshold: 25 },
    xpReward: 75
  },
  {
    code: "SEVEN_DAY_STREAK",
    name: "Seven-Day Streak",
    description: "Maintain activity for seven consecutive days.",
    tier: "gold",
    iconName: "flame",
    criteria: { type: "streak_days", threshold: 7 },
    xpReward: 100
  },
  {
    code: "PERFECT_THREE",
    name: "Perfect Performer",
    description: "Earn 100% in three submitted attempts.",
    tier: "gold",
    iconName: "trophy",
    criteria: { type: "perfect_attempts", threshold: 3 },
    xpReward: 150
  },
  {
    code: "THOUSAND_XP",
    name: "Arena Champion",
    description: "Reach 1,000 total XP.",
    tier: "platinum",
    iconName: "crown",
    criteria: { type: "total_xp", threshold: 1000 },
    xpReward: 100
  }
];

async function seedBadges() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const badge of badges) {
      await client.query(
        `INSERT INTO badges
           (code, name, description, tier, icon_name, criteria, xp_reward, is_active)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, TRUE)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           tier = EXCLUDED.tier,
           icon_name = EXCLUDED.icon_name,
           criteria = EXCLUDED.criteria,
           xp_reward = EXCLUDED.xp_reward`,
        [
          badge.code,
          badge.name,
          badge.description,
          badge.tier,
          badge.iconName,
          JSON.stringify(badge.criteria),
          badge.xpReward
        ]
      );
    }

    await client.query("COMMIT");
    console.log(`Successfully seeded ${badges.length} Champion Arena badges.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Badge seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedBadges();
