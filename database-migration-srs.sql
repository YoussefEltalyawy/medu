-- Phase 1: Core Learning Engine - Database Migration
-- Adding SRS (Spaced Repetition System) fields and enhanced vocabulary features
--
-- IMPORTANT: Some functions use NOW() which cannot be marked as IMMUTABLE
-- This is expected behavior for time-based functions in PostgreSQL
-- The functions will work correctly but cannot be used in index predicates

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

-- 2. Create vocabulary_categories table for organizing words
CREATE TABLE IF NOT EXISTS vocabulary_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#5E7850',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create vocabulary_word_categories junction table
CREATE TABLE IF NOT EXISTS vocabulary_word_categories (
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    category_id UUID REFERENCES vocabulary_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (word_id, category_id)
);

-- 4. Create vocabulary_word_relationships table for synonyms, antonyms, etc.
CREATE TABLE IF NOT EXISTS vocabulary_word_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    related_word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('synonym', 'antonym', 'related', 'derived', 'compound')),
    strength DECIMAL(3,2) DEFAULT 1.0, -- Relationship strength (0.0 to 1.0)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(word_id, related_word_id, relationship_type)
);

-- 5. Create learning_sessions table for tracking study sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('vocabulary', 'grammar', 'listening', 'speaking', 'writing', 'mixed')),
    duration_minutes INTEGER NOT NULL,
    words_reviewed INTEGER DEFAULT 0,
    words_correct INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.0,
    session_data JSONB DEFAULT '{}', -- Store additional session metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create vocabulary_review_history table for detailed review tracking
CREATE TABLE IF NOT EXISTS vocabulary_review_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quality_rating INTEGER NOT NULL CHECK (quality_rating >= 0 AND quality_rating <= 5),
    ease_factor_before DECIMAL(4,2) NOT NULL,
    ease_factor_after DECIMAL(4,2) NOT NULL,
    interval_before INTEGER NOT NULL,
    interval_after INTEGER NOT NULL,
    repetitions_before INTEGER NOT NULL,
    repetitions_after INTEGER NOT NULL,
    review_duration_seconds INTEGER, -- Time spent on this word
    session_id UUID REFERENCES learning_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create vocabulary_learning_paths table for structured progression
CREATE TABLE IF NOT EXISTS vocabulary_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(2) NOT NULL CHECK (difficulty_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    target_vocabulary_count INTEGER DEFAULT 0,
    current_progress INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create vocabulary_path_words junction table
CREATE TABLE IF NOT EXISTS vocabulary_path_words (
    path_id UUID REFERENCES vocabulary_learning_paths(id) ON DELETE CASCADE,
    word_id UUID REFERENCES vocabulary_words(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    prerequisites TEXT[], -- Array of word IDs that must be mastered first
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (path_id, word_id)
);

-- 9. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_next_review ON vocabulary_words(next_review);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_difficulty ON vocabulary_words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_user_status ON vocabulary_words(user_id, status);
-- Note: Cannot use NOW() in index predicate as it's not immutable
-- This index will be created without the WHERE clause for better performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_due_review ON vocabulary_words(user_id, next_review);
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

-- 13. Create function to get due words for review
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

-- 15. Insert default vocabulary categories
INSERT INTO vocabulary_categories (user_id, name, description, color) VALUES
    (NULL, 'Basic Vocabulary', 'Essential everyday words and phrases', '#5E7850'),
    (NULL, 'Food & Dining', 'Restaurant, cooking, and food-related vocabulary', '#8B4513'),
    (NULL, 'Travel & Transportation', 'Getting around and travel vocabulary', '#4169E1'),
    (NULL, 'Family & Relationships', 'Family members and relationship terms', '#FF69B4'),
    (NULL, 'Work & Business', 'Professional and workplace vocabulary', '#2F4F4F'),
    (NULL, 'Hobbies & Entertainment', 'Leisure activities and entertainment', '#FF4500'),
    (NULL, 'Health & Body', 'Medical terms and body parts', '#DC143C'),
    (NULL, 'Nature & Environment', 'Animals, plants, and environmental terms', '#228B22')
ON CONFLICT DO NOTHING;

-- 16. Update existing vocabulary words with default SRS values
UPDATE vocabulary_words 
SET 
    ease_factor = 2.5,
    interval_days = 1,
    repetitions = 0,
    next_review = NOW(),
    difficulty_level = 'A1'
WHERE ease_factor IS NULL;

-- 17. Create view for easy access to due words
CREATE OR REPLACE VIEW due_words_view AS
SELECT 
    vw.*,
    EXTRACT(DAY FROM (NOW() - vw.next_review))::INTEGER as days_overdue,
    CASE 
        WHEN vw.next_review < NOW() THEN 'overdue'
        WHEN vw.next_review::date = NOW()::date THEN 'due_today'
        WHEN vw.next_review::date = (NOW() + INTERVAL '1 day')::date THEN 'due_tomorrow'
        ELSE 'future'
    END as review_status
FROM vocabulary_words vw
WHERE vw.next_review <= NOW() + INTERVAL '1 day'
    AND vw.status != 'mastered';

-- 18. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Migration complete!
-- Run this migration in your Supabase database to enable Phase 1 features
