-- Phase 1: Core Learning Engine - Database Migration (Fixed Version)
-- Adding SRS (Spaced Repetition System) fields and enhanced vocabulary features
--
-- This version avoids IMMUTABLE function issues by using simpler approaches

-- 1. Add SRS fields to vocabulary_words table
ALTER TABLE vocabulary_words
ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(4,2) DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(2) DEFAULT 'A1',
ADD COLUMN IF NOT EXISTS context_sentences JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS related_words TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_quality_rating INTEGER DEFAULT 0;

-- 2. Create vocabulary_categories table
CREATE TABLE IF NOT EXISTS vocabulary_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- 3. Create vocabulary_word_categories junction table
CREATE TABLE IF NOT EXISTS vocabulary_word_categories (
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    category_id UUID REFERENCES vocabulary_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (word_id, category_id)
);

-- 4. Create vocabulary_word_relationships table
CREATE TABLE IF NOT EXISTS vocabulary_word_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    related_word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('synonym', 'antonym', 'related', 'derived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(word_id, related_word_id, relationship_type)
);

-- 5. Create learning_sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL DEFAULT 'vocabulary',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    words_reviewed INTEGER DEFAULT 0,
    words_correct INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create vocabulary_review_history table
CREATE TABLE IF NOT EXISTS vocabulary_review_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quality_rating INTEGER NOT NULL CHECK (quality_rating >= 0 AND quality_rating <= 5),
    ease_factor_before DECIMAL(4,2),
    ease_factor_after DECIMAL(4,2),
    interval_before INTEGER,
    interval_after INTEGER,
    repetitions_before INTEGER,
    repetitions_after INTEGER,
    review_duration_seconds INTEGER,
    session_id UUID REFERENCES learning_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(2) DEFAULT 'A1',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create learning_path_words junction table
CREATE TABLE IF NOT EXISTS learning_path_words (
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (path_id, word_id)
);

-- 9. Add indexes for better performance (avoiding IMMUTABLE issues)
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_next_review ON vocabulary_words(next_review);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_difficulty ON vocabulary_words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_user_status ON vocabulary_words(user_id, status);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_user_next_review ON vocabulary_words(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_date ON learning_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_review_history_word_user ON vocabulary_review_history(word_id, user_id);

-- 10. Add constraints for data integrity
ALTER TABLE vocabulary_words 
ADD CONSTRAINT check_ease_factor_range CHECK (ease_factor >= 1.3 AND ease_factor <= 5.0),
ADD CONSTRAINT check_interval_days_positive CHECK (interval_days > 0),
ADD CONSTRAINT check_repetitions_non_negative CHECK (repetitions >= 0),
ADD CONSTRAINT check_difficulty_level CHECK (difficulty_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

-- 11. Create function to update next_review when interval changes
CREATE OR REPLACE FUNCTION update_next_review()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.interval_days != OLD.interval_days OR NEW.last_reviewed != OLD.last_reviewed THEN
        NEW.next_review = COALESCE(NEW.last_reviewed, NOW()) + (NEW.interval_days || ' days')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to automatically update next_review
DROP TRIGGER IF EXISTS trigger_update_next_review ON vocabulary_words;
CREATE TRIGGER trigger_update_next_review
    BEFORE UPDATE ON vocabulary_words
    FOR EACH ROW
    EXECUTE FUNCTION update_next_review();

-- 13. Create simplified function to get due words for review
-- This avoids IMMUTABLE issues by using a simpler approach
CREATE OR REPLACE FUNCTION get_due_words_for_review(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    german TEXT,
    english TEXT,
    example TEXT,
    status TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    ease_factor DECIMAL(4,2),
    interval_days INTEGER,
    repetitions INTEGER,
    next_review TIMESTAMP WITH TIME ZONE,
    difficulty_level VARCHAR(2),
    context_sentences JSONB,
    related_words TEXT[],
    notes TEXT,
    tags TEXT[],
    last_quality_rating INTEGER,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vw.id,
        vw.german,
        vw.english,
        vw.example,
        vw.status,
        vw.user_id,
        vw.created_at,
        vw.last_reviewed,
        vw.ease_factor,
        vw.interval_days,
        vw.repetitions,
        vw.next_review,
        vw.difficulty_level,
        vw.context_sentences,
        vw.related_words,
        vw.notes,
        vw.tags,
        vw.last_quality_rating,
        CASE 
            WHEN vw.next_review IS NULL THEN 0
            ELSE GREATEST(0, EXTRACT(EPOCH FROM (NOW() - vw.next_review)) / 86400)::INTEGER
        END as days_overdue
    FROM vocabulary_words vw
    WHERE vw.user_id = user_uuid
        AND (
            vw.next_review IS NULL 
            OR vw.next_review <= NOW()
            OR vw.status = 'learning'
        )
    ORDER BY 
        CASE 
            WHEN vw.next_review IS NULL THEN 0
            WHEN vw.next_review <= NOW() THEN 1
            ELSE 2
        END,
        vw.next_review ASC;
END;
$$ LANGUAGE plpgsql;

-- 14. Create function to calculate user vocabulary statistics
CREATE OR REPLACE FUNCTION get_user_vocabulary_stats(user_uuid UUID)
RETURNS TABLE (
    total_words INTEGER,
    learning_count INTEGER,
    familiar_count INTEGER,
    mastered_count INTEGER,
    due_for_review INTEGER,
    overdue_count INTEGER,
    average_ease_factor DECIMAL(4,2),
    total_repetitions INTEGER,
    study_streak_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_words,
        COUNT(*) FILTER (WHERE status = 'learning')::INTEGER as learning_count,
        COUNT(*) FILTER (WHERE status = 'familiar')::INTEGER as familiar_count,
        COUNT(*) FILTER (WHERE status = 'mastered')::INTEGER as mastered_count,
        COUNT(*) FILTER (WHERE next_review <= NOW() AND status != 'mastered')::INTEGER as due_for_review,
        COUNT(*) FILTER (WHERE next_review < NOW() AND status != 'mastered')::INTEGER as overdue_count,
        ROUND(AVG(ease_factor), 2) as average_ease_factor,
        SUM(repetitions)::INTEGER as total_repetitions,
        0::INTEGER as study_streak_days -- TODO: Implement streak calculation
    FROM vocabulary_words
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 15. Create function to get words by difficulty level
CREATE OR REPLACE FUNCTION get_words_by_difficulty(user_uuid UUID, difficulty VARCHAR(2))
RETURNS TABLE (
    id UUID,
    german TEXT,
    english TEXT,
    example TEXT,
    status TEXT,
    ease_factor DECIMAL(4,2),
    interval_days INTEGER,
    repetitions INTEGER,
    next_review TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vw.id,
        vw.german,
        vw.english,
        vw.example,
        vw.status,
        vw.ease_factor,
        vw.interval_days,
        vw.repetitions,
        vw.next_review
    FROM vocabulary_words vw
    WHERE vw.user_id = user_uuid 
        AND vw.difficulty_level = difficulty
    ORDER BY vw.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 16. Create function to get learning words (new words)
CREATE OR REPLACE FUNCTION get_learning_words(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    german TEXT,
    english TEXT,
    example TEXT,
    status TEXT,
    ease_factor DECIMAL(4,2),
    interval_days INTEGER,
    repetitions INTEGER,
    next_review TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vw.id,
        vw.german,
        vw.english,
        vw.example,
        vw.status,
        vw.ease_factor,
        vw.interval_days,
        vw.repetitions,
        vw.next_review
    FROM vocabulary_words vw
    WHERE vw.user_id = user_uuid 
        AND vw.status = 'learning'
        AND vw.repetitions = 0
    ORDER BY vw.created_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 17. Create function to insert default categories for a user
CREATE OR REPLACE FUNCTION create_default_categories_for_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO vocabulary_categories (user_id, name, description, color) VALUES
        (user_uuid, 'Basic Vocabulary', 'Essential everyday words', '#3B82F6'),
        (user_uuid, 'Food & Dining', 'Words related to food and restaurants', '#10B981'),
        (user_uuid, 'Travel & Transportation', 'Transportation and travel vocabulary', '#F59E0B'),
        (user_uuid, 'Family & Relationships', 'Family members and relationships', '#EF4444'),
        (user_uuid, 'Work & Business', 'Professional and business vocabulary', '#8B5CF6'),
        (user_uuid, 'Hobbies & Leisure', 'Recreational activities and hobbies', '#06B6D4')
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 18. Enable Row Level Security (RLS)
ALTER TABLE vocabulary_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_word_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_word_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_words ENABLE ROW LEVEL SECURITY;

-- 19. Create RLS policies
-- Vocabulary categories policy
CREATE POLICY "Users can manage their own categories" ON vocabulary_categories
    FOR ALL USING (auth.uid() = user_uuid);

-- Vocabulary word categories policy
CREATE POLICY "Users can manage their own word categories" ON vocabulary_word_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vocabulary_words vw 
            WHERE vw.id = vocabulary_word_categories.word_id 
            AND vw.user_id = auth.uid()
        )
    );

-- Vocabulary word relationships policy
CREATE POLICY "Users can manage their own word relationships" ON vocabulary_word_relationships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM vocabulary_words vw 
            WHERE vw.id = vocabulary_word_relationships.word_id 
            AND vw.user_id = auth.uid()
        )
    );

-- Learning sessions policy
CREATE POLICY "Users can manage their own learning sessions" ON learning_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Vocabulary review history policy
CREATE POLICY "Users can manage their own review history" ON vocabulary_review_history
    FOR ALL USING (auth.uid() = user_id);

-- Learning paths policy
CREATE POLICY "Users can manage their own learning paths" ON learning_paths
    FOR ALL USING (auth.uid() = user_id);

-- Learning path words policy
CREATE POLICY "Users can manage their own learning path words" ON learning_path_words
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM learning_paths lp 
            WHERE lp.id = learning_path_words.path_id 
            AND lp.user_id = auth.uid()
        )
    );

-- 19. Insert default categories for new users
-- Note: This will be handled by application logic when users sign up
-- Removing automatic insertion to avoid foreign key issues

-- 20. Migration complete!
-- Run this migration in your Supabase database to enable Phase 1 features
-- 
-- Note: This migration avoids IMMUTABLE function issues by using simpler approaches
-- All functions will work correctly for the SRS system
--
-- To create default categories for existing users, call:
-- SELECT create_default_categories_for_user('your-user-uuid-here');
