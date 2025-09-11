-- Database Migration: Learning Activities System
-- This script adds support for interactive learning activities, progress tracking, and achievements

-- 1. Learning Activities Table
CREATE TABLE IF NOT EXISTS learning_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('vocabulary', 'grammar', 'listening', 'speaking', 'writing', 'mixed')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    estimated_time INTEGER, -- in minutes
    points INTEGER DEFAULT 20,
    content JSONB, -- Flexible content storage
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Learning Progress Table
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES learning_activities(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    time_spent INTEGER NOT NULL, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB, -- Additional data like word count, attempts, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL, -- Reference to achievement definition
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    icon TEXT,
    points INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Learning Sessions Table (for tracking study sessions)
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL, -- 'vocabulary', 'grammar', 'listening', 'speaking', 'writing', 'mixed'
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    words_reviewed INTEGER DEFAULT 0,
    words_correct INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    activities_completed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_activity_id ON learning_progress(activity_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_completed_at ON learning_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_activity ON learning_progress(user_id, activity_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_start_time ON learning_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_type ON learning_sessions(session_type);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- Learning activities: Readable by all authenticated users
CREATE POLICY "Learning activities are viewable by authenticated users" ON learning_activities
    FOR SELECT USING (auth.role() = 'authenticated');

-- Learning progress: Users can only see their own progress
CREATE POLICY "Users can view their own learning progress" ON learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" ON learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" ON learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User achievements: Users can only see their own achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning sessions: Users can only see their own sessions
CREATE POLICY "Users can view their own learning sessions" ON learning_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning sessions" ON learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning sessions" ON learning_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Functions for learning activities

-- Function to get user learning statistics
CREATE OR REPLACE FUNCTION get_user_learning_stats(user_uuid UUID)
RETURNS TABLE (
    total_activities INTEGER,
    completed_activities INTEGER,
    total_score INTEGER,
    average_accuracy DECIMAL(5,2),
    total_time_spent INTEGER,
    current_streak INTEGER,
    longest_streak INTEGER
) AS $$
DECLARE
    streak_count INTEGER := 0;
    max_streak INTEGER := 0;
    temp_streak INTEGER := 0;
    prev_date DATE;
    curr_date DATE;
BEGIN
    -- Get basic stats
    SELECT 
        COUNT(DISTINCT activity_id),
        COUNT(*),
        COALESCE(SUM(score), 0),
        COALESCE(ROUND(AVG(accuracy), 2), 0),
        COALESCE(SUM(time_spent), 0)
    INTO 
        completed_activities,
        total_activities,
        total_score,
        average_accuracy,
        total_time_spent
    FROM learning_progress 
    WHERE user_id = user_uuid;

    -- Calculate streaks
    FOR curr_date IN 
        SELECT DISTINCT DATE(completed_at) 
        FROM learning_progress 
        WHERE user_id = user_uuid 
        ORDER BY DATE(completed_at) DESC
    LOOP
        IF prev_date IS NULL THEN
            temp_streak := 1;
        ELSIF curr_date = prev_date - INTERVAL '1 day' THEN
            temp_streak := temp_streak + 1;
        ELSE
            temp_streak := 1;
        END IF;
        
        max_streak := GREATEST(max_streak, temp_streak);
        IF streak_count = 0 THEN
            streak_count := temp_streak;
        END IF;
        
        prev_date := curr_date;
    END LOOP;

    RETURN QUERY SELECT 
        total_activities,
        completed_activities,
        total_score,
        average_accuracy,
        total_time_spent,
        streak_count,
        max_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get user achievements
CREATE OR REPLACE FUNCTION get_user_achievements(user_uuid UUID)
RETURNS TABLE (
    achievement_id TEXT,
    achievement_name TEXT,
    achievement_description TEXT,
    icon TEXT,
    points INTEGER,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    is_unlocked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY SELECT 
        ua.achievement_id,
        ua.achievement_name,
        ua.achievement_description,
        ua.icon,
        ua.points,
        ua.unlocked_at,
        true as is_unlocked
    FROM user_achievements ua
    WHERE ua.user_id = user_uuid
    ORDER BY ua.unlocked_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(user_uuid UUID)
RETURNS TABLE (
    achievement_id TEXT,
    achievement_name TEXT,
    achievement_description TEXT,
    icon TEXT,
    points INTEGER,
    newly_unlocked BOOLEAN
) AS $$
DECLARE
    completed_activities INTEGER;
    current_streak INTEGER;
    average_accuracy DECIMAL(5,2);
    achievement_record RECORD;
BEGIN
    -- Get user stats
    SELECT 
        COUNT(*),
        MAX(current_streak),
        AVG(accuracy)
    INTO 
        completed_activities,
        current_streak,
        average_accuracy
    FROM get_user_learning_stats(user_uuid);

    -- Check for first activity achievement
    IF completed_activities >= 1 THEN
        IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_uuid AND achievement_id = 'first-activity') THEN
            INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_description, icon, points)
            VALUES (user_uuid, 'first-activity', 'First Steps', 'Complete your first learning activity', '🎯', 10);
            
            achievement_record.achievement_id := 'first-activity';
            achievement_record.achievement_name := 'First Steps';
            achievement_record.achievement_description := 'Complete your first learning activity';
            achievement_record.icon := '🎯';
            achievement_record.points := 10;
            achievement_record.newly_unlocked := true;
            
            RETURN NEXT achievement_record;
        END IF;
    END IF;

    -- Check for streak achievements
    IF current_streak >= 3 THEN
        IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_uuid AND achievement_id = 'streak-3') THEN
            INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_description, icon, points)
            VALUES (user_uuid, 'streak-3', 'Consistent Learner', 'Maintain a 3-day learning streak', '🔥', 25);
            
            achievement_record.achievement_id := 'streak-3';
            achievement_record.achievement_name := 'Consistent Learner';
            achievement_record.achievement_description := 'Maintain a 3-day learning streak';
            achievement_record.icon := '🔥';
            achievement_record.points := 25;
            achievement_record.newly_unlocked := true;
            
            RETURN NEXT achievement_record;
        END IF;
    END IF;

    IF current_streak >= 7 THEN
        IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_uuid AND achievement_id = 'streak-7') THEN
            INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_description, icon, points)
            VALUES (user_uuid, 'streak-7', 'Week Warrior', 'Maintain a 7-day learning streak', '⚡', 50);
            
            achievement_record.achievement_id := 'streak-7';
            achievement_record.achievement_name := 'Week Warrior';
            achievement_record.achievement_description := 'Maintain a 7-day learning streak';
            achievement_record.icon := '⚡';
            achievement_record.points := 50;
            achievement_record.newly_unlocked := true;
            
            RETURN NEXT achievement_record;
        END IF;
    END IF;

    -- Check for accuracy achievement
    IF average_accuracy >= 90 THEN
        IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = user_uuid AND achievement_id = 'accuracy-90') THEN
            INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_description, icon, points)
            VALUES (user_uuid, 'accuracy-90', 'Accuracy Master', 'Achieve 90% accuracy in an activity', '🎯', 30);
            
            achievement_record.achievement_id := 'accuracy-90';
            achievement_record.achievement_name := 'Accuracy Master';
            achievement_record.achievement_description := 'Achieve 90% accuracy in an activity';
            achievement_record.icon := '🎯';
            achievement_record.points := 30;
            achievement_record.newly_unlocked := true;
            
            RETURN NEXT achievement_record;
        END IF;
    END IF;

    -- Return empty if no new achievements
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to get learning recommendations
CREATE OR REPLACE FUNCTION get_learning_recommendations(user_uuid UUID)
RETURNS TABLE (
    recommendation_type TEXT,
    title TEXT,
    description TEXT,
    priority INTEGER
) AS $$
DECLARE
    user_level TEXT;
    weak_areas TEXT[];
    recent_activities TEXT[];
BEGIN
    -- Determine user level based on completed activities
    SELECT 
        CASE 
            WHEN COUNT(*) < 5 THEN 'A1'
            WHEN COUNT(*) < 15 THEN 'A2'
            WHEN COUNT(*) < 30 THEN 'B1'
            WHEN COUNT(*) < 50 THEN 'B2'
            ELSE 'C1'
        END
    INTO user_level
    FROM learning_progress 
    WHERE user_id = user_uuid;

    -- Get weak areas (activities with low accuracy)
    SELECT ARRAY_AGG(DISTINCT activity_type)
    INTO weak_areas
    FROM learning_progress 
    WHERE user_id = user_uuid AND accuracy < 70;

    -- Get recent activity types
    SELECT ARRAY_AGG(DISTINCT activity_type)
    INTO recent_activities
    FROM learning_progress 
    WHERE user_id = user_uuid 
    ORDER BY completed_at DESC 
    LIMIT 5;

    -- Return recommendations based on analysis
    IF user_level = 'A1' THEN
        RETURN QUERY SELECT 
            'beginner'::TEXT,
            'Start with Basic Vocabulary'::TEXT,
            'Focus on essential words and phrases to build a foundation'::TEXT,
            1::INTEGER;
    END IF;

    IF 'vocabulary' = ANY(weak_areas) THEN
        RETURN QUERY SELECT 
            'improvement'::TEXT,
            'Practice Vocabulary'::TEXT,
            'Your vocabulary accuracy could use some improvement'::TEXT,
            2::INTEGER;
    END IF;

    IF 'grammar' = ANY(weak_areas) THEN
        RETURN QUERY SELECT 
            'improvement'::TEXT,
            'Review Grammar Rules'::TEXT,
            'Consider reviewing basic grammar concepts'::TEXT,
            2::INTEGER;
    END IF;

    -- Suggest variety if user focuses on one type
    IF array_length(recent_activities, 1) = 1 THEN
        RETURN QUERY SELECT 
            'variety'::TEXT,
            'Try Different Activity Types'::TEXT,
            'Mix up your learning with different types of exercises'::TEXT,
            3::INTEGER;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 8. Insert sample learning activities
INSERT INTO learning_activities (title, description, type, difficulty, estimated_time, points, content) VALUES
('Basic Greetings', 'Learn essential German greetings and introductions', 'vocabulary', 'A1', 15, 20, '{"instructions": ["Practice common greetings", "Learn basic phrases"], "words": ["Hallo", "Guten Tag", "Auf Wiedersehen"]}'),
('Present Tense Verbs', 'Master basic verb conjugation in present tense', 'grammar', 'A1', 20, 25, '{"instructions": ["Learn verb endings", "Practice conjugation"], "topics": ["sein", "haben", "gehen"]}'),
('Simple Conversations', 'Listen to basic German conversations', 'listening', 'A1', 25, 30, '{"instructions": ["Listen carefully", "Answer comprehension questions"], "audio_duration": 120}'),
('Pronunciation Practice', 'Practice German pronunciation with basic words', 'speaking', 'A1', 15, 20, '{"instructions": ["Record your voice", "Compare with model"], "target_phrases": ["Hallo", "Danke", "Bitte"]}'),
('Simple Sentences', 'Write basic German sentences', 'writing', 'A1', 20, 25, '{"instructions": ["Use learned vocabulary", "Follow grammar rules"], "word_count": {"min": 5, "target": 8, "max": 15}}')
ON CONFLICT DO NOTHING;

-- 9. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_activities_updated_at 
    BEFORE UPDATE ON learning_activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Grant necessary permissions
GRANT SELECT ON learning_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON learning_progress TO authenticated;
GRANT SELECT, INSERT ON user_achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON learning_sessions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_learning_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_learning_recommendations(UUID) TO authenticated;

-- 11. Create view for easy access to user progress with activity details
CREATE OR REPLACE VIEW user_learning_progress_view AS
SELECT 
    lp.id,
    lp.user_id,
    lp.activity_id,
    la.title as activity_title,
    la.type as activity_type,
    la.difficulty as activity_difficulty,
    lp.score,
    lp.max_score,
    lp.accuracy,
    lp.time_spent,
    lp.completed_at,
    lp.metadata
FROM learning_progress lp
JOIN learning_activities la ON lp.activity_id = la.id
WHERE la.is_active = true;

GRANT SELECT ON user_learning_progress_view TO authenticated;

-- Migration complete!
SELECT 'Learning Activities System migration completed successfully!' as status;

