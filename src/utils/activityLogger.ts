import { createClient } from '@/lib/supabase';

export const updateUserStats = async () => {
  const supabase = createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Auth error:', userError.message);
      return;
    }
    if (!user) {
      console.warn('⚠️ No user found.');
      return;
    }

    console.log('🔄 Updating stats for user:', user.id);

    const today = new Date().toISOString().split('T')[0];
    const todayStart = `${today}T00:00:00`;
    const todayEnd = `${today}T23:59:59`;

    console.log('📅 Today is:', today);
    console.log('🔍 Fetching activities between', todayStart, 'and', todayEnd);

    const { data: todayActivities, error: activityError } = await supabase
      .from('activities')
      .select('id')
      .eq('user_id', user.id)
      .gte('time', todayStart)
      .lt('time', todayEnd)
      .limit(1);

    if (activityError) {
      console.error('❌ Error fetching activities:', activityError.message);
      return;
    }

    console.log('📌 Today\'s activities:', todayActivities);

    if (todayActivities && todayActivities.length > 0) {
      const { data: currentStats, error: statsError } = await supabase
        .from('user_stats')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();

      if (statsError) {
        console.warn('🆕 No existing stats found, inserting new row...');
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('❌ Insert error:', insertError.message);
        } else {
          console.log('✅ Inserted new user_stats row.');
        }
        return;
      }

      console.log('📊 Current stats found:', currentStats);

      const lastActivityDate = new Date(currentStats.last_activity_date).toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      console.log('⏪ Last activity date:', lastActivityDate);
      console.log('🕘 Yesterday:', yesterdayStr);

      let newStreak = currentStats.current_streak;

      if (lastActivityDate === yesterdayStr) {
        newStreak += 1;
        console.log('🔥 Continuing streak. New streak:', newStreak);
      } else if (lastActivityDate !== today) {
        newStreak = 1;
        console.log('🔁 Streak reset. New streak:', newStreak);
      } else {
        console.log('🟰 Already logged for today. No change.');
        return;
      }

      const newLongestStreak = Math.max(currentStats.longest_streak, newStreak);
      console.log('🏆 New longest streak:', newLongestStreak);

      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id' // ✅ critical fix here
        });

      if (updateError) {
        console.error('❌ Error updating stats:', updateError.message);
      } else {
        console.log('✅ User stats updated successfully.');
      }
    } else {
      console.log('📭 No activities found for today. Skipping stat update.');
    }
  } catch (error) {
    console.error('🚨 Unexpected error in updateUserStats:', error);
  }
};

export const addActivity = async (type: string, content: string) => {
  const supabase = createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Auth error:', userError.message);
      return;
    }
    if (!user) {
      console.warn('⚠️ No user found.');
      return;
    }

    console.log('➕ Adding activity for user:', user.id, '| Type:', type, '| Content:', content);

    const { error: insertError } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        type: type,
        content: content,
        time: new Date().toISOString(),
      });

    if (insertError) {
      console.error('❌ Failed to insert activity:', insertError.message);
      return;
    }

    console.log('✅ Activity added successfully. Updating stats...');
    await updateUserStats();
  } catch (error) {
    console.error('🚨 Unexpected error in addActivity:', error);
  }
};

export const updateWordsLearned = async (wordsLearned: number) => {
  const supabase = createClient();
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Auth error:', userError.message);
      return;
    }
    if (!user) {
      console.warn('⚠️ No user found.');
      return;
    }
    const { error: updateError } = await supabase
      .from('user_stats')
      .update({ words_learned: wordsLearned, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (updateError) {
      console.error('❌ Error updating words_learned:', updateError.message);
    } else {
      console.log('✅ words_learned updated successfully.');
    }
  } catch (error) {
    console.error('🚨 Unexpected error in updateWordsLearned:', error);
  }
};
