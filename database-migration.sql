-- Database Migration for Onboarding Features
-- Run this in your Supabase SQL editor

-- Add new columns to users table for onboarding
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS native_language TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS content_preferences JSONB,
ADD COLUMN IF NOT EXISTS learning_goals TEXT[],
ADD COLUMN IF NOT EXISTS weekly_study_time INTEGER,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN users.display_name IS 'User display name for the app';
COMMENT ON COLUMN users.native_language IS 'User''s native language';
COMMENT ON COLUMN users.experience_level IS 'User''s language learning experience level';
COMMENT ON COLUMN users.content_preferences IS 'JSON object containing user content preferences';
COMMENT ON COLUMN users.learning_goals IS 'Array of learning goal IDs or descriptions';
COMMENT ON COLUMN users.weekly_study_time IS 'Weekly study time commitment in minutes';
COMMENT ON COLUMN users.onboarding_completed IS 'Whether user has completed onboarding';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when onboarding was completed';

-- Create index for onboarding status queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

-- Update existing users to mark onboarding as completed (optional)
-- Uncomment the line below if you want to mark existing users as having completed onboarding
-- UPDATE users SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;
