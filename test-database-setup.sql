-- Test script to verify database setup
-- Run this after the main migration to test basic functionality

-- 1. Test basic table structure
SELECT 'Testing table structure...' as status;

-- Check if tables exist
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✓' ELSE '✗' END as exists
FROM information_schema.tables 
WHERE table_name IN (
    'vocabulary_words',
    'vocabulary_categories',
    'vocabulary_word_categories',
    'learning_sessions',
    'vocabulary_review_history'
) AND table_schema = 'public';

-- 2. Test function creation
SELECT 'Testing functions...' as status;

-- Check if functions exist
SELECT 
    routine_name,
    CASE WHEN routine_name IS NOT NULL THEN '✓' ELSE '✗' END as exists
FROM information_schema.routines 
WHERE routine_name IN (
    'get_due_words_for_review',
    'get_user_vocabulary_stats',
    'create_default_categories_for_user'
) AND routine_schema = 'public';

-- 3. Test basic insert (if user exists)
SELECT 'Testing basic operations...' as status;

-- Note: Replace 'your-user-uuid-here' with an actual user UUID from your auth.users table
-- SELECT create_default_categories_for_user('your-user-uuid-here');

-- 4. Show current vocabulary_words structure
SELECT 'Current vocabulary_words columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vocabulary_words' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Show current vocabulary_categories structure
SELECT 'Current vocabulary_categories columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vocabulary_categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Database setup test complete!' as status;
