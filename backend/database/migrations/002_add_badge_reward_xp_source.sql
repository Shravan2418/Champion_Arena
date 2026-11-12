-- Run this migration once against the champion_arena database before starting
-- the Reward & Gamification module. The engine records XP for earned badges.
ALTER TYPE xp_source ADD VALUE IF NOT EXISTS 'badge_reward';
