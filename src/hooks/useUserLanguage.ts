import { useState, useEffect, useCallback } from 'react';
import { contentService } from '@/services/ContentService';
import { LanguageMapping } from '@/types/content';

interface UseUserLanguageReturn {
  // Language state
  userLanguage: string;
  languageMapping: LanguageMapping;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateUserLanguage: (newLanguage: string) => Promise<void>;
  refreshUserLanguage: () => Promise<void>;
  
  // Computed values
  isLanguageSupported: boolean;
}

export function useUserLanguage(): UseUserLanguageReturn {
  const [userLanguage, setUserLanguage] = useState<string>('German'); // Default to German
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get language mapping using ContentService
  const languageMapping = contentService.getLanguageMapping(userLanguage);
  
  // Check if current language is supported
  const isLanguageSupported = contentService.getLanguageMapping(userLanguage).name === userLanguage;

  // Fetch user's target language from Supabase
  const fetchUserLanguage = useCallback(async (): Promise<string> => {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get user profile with target language
        const { data, error } = await supabase
          .from('users')
          .select('target_language')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          throw new Error('Failed to fetch user language preference');
        }

        if (data && data.target_language) {
          return data.target_language;
        }
      }

      // Return default if no user or no language set
      return 'German';
    } catch (err) {
      console.error('Error fetching user language:', err);
      throw err;
    }
  }, []);

  // Update user's target language in Supabase
  const updateUserLanguage = useCallback(async (newLanguage: string): Promise<void> => {
    try {
      setError(null);
      
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate language is supported
      const mapping = contentService.getLanguageMapping(newLanguage);
      if (mapping.name !== newLanguage) {
        console.warn(`Language ${newLanguage} not fully supported, using ${mapping.name}`);
      }

      // Update user profile with new target language
      const { error } = await supabase
        .from('users')
        .update({ target_language: newLanguage })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user language:', error);
        throw new Error('Failed to update language preference');
      }

      // Update local state
      setUserLanguage(newLanguage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update language';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Refresh user language from database
  const refreshUserLanguage = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Inline the fetch logic to avoid dependency issues
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      let language = 'German'; // Default

      if (user) {
        // Get user profile with target language
        const { data, error } = await supabase
          .from('users')
          .select('target_language')
          .eq('id', user.id)
          .single();

        if (!error && data && data.target_language) {
          language = data.target_language;
        }
      }
      
      setUserLanguage(language);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch language preference';
      setError(errorMessage);
      
      // Keep default language on error
      setUserLanguage('German');
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array

  // Initial load effect
  useEffect(() => {
    refreshUserLanguage();
  }, []); // Remove refreshUserLanguage dependency and only run once

  return {
    // Language state
    userLanguage,
    languageMapping,
    isLoading,
    error,
    
    // Actions
    updateUserLanguage,
    refreshUserLanguage,
    
    // Computed values
    isLanguageSupported
  };
}