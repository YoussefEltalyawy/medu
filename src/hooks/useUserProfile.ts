'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';

interface UserProfile {
  display_name: string | null;
  native_language: string | null;
  experience_level: string | null;
  target_language: string | null;
  content_preferences: any;
  learning_goals: string[] | null;
  weekly_study_time: number | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    console.log('useUserProfile fetchProfile called with user:', user?.id);

    if (!user) {
      console.log('No user, setting loading to false');
      setLoading(false);
      setProfile(null);
      return;
    }

    try {
      console.log('Fetching profile for user:', user.id);
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('display_name, native_language, experience_level, target_language, content_preferences, learning_goals, weekly_study_time')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log('Profile data fetched:', data);
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      console.error('Error fetching user profile:', err);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state immediately for better UX
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      console.error('Error updating user profile:', err);
      throw new Error(errorMessage);
    }
  }, [user]);

  // Fetch profile when user changes
  useEffect(() => {
    console.log('useUserProfile useEffect triggered with user ID:', user?.id);
    fetchProfile();
  }, [user?.id]); // Only depend on user ID, not the entire user object

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
}
