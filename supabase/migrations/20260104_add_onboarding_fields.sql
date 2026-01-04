-- Migration: Add onboarding tracking fields
-- Date: 2026-01-04
-- Purpose: Track first-time user onboarding completion and mark sample decks

-- Add onboarding tracking columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP(3);

-- Add sample deck marker to decks table
ALTER TABLE decks
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for efficient onboarding queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_decks_sample ON decks(is_sample);

-- Comments for documentation
COMMENT ON COLUMN users.onboarding_completed IS 'Whether the user has completed the onboarding tour';
COMMENT ON COLUMN users.onboarding_started_at IS 'Timestamp when user started onboarding tour';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed onboarding tour';
COMMENT ON COLUMN decks.is_sample IS 'Whether this deck is a sample deck created during signup';
