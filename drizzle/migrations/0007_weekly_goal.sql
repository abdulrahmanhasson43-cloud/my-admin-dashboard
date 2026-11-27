-- Feature: weekly study goal (single-subject platform rhythm).
ALTER TABLE gamify_flags ADD COLUMN IF NOT EXISTS weekly_goal_minutes integer NOT NULL DEFAULT 150;
