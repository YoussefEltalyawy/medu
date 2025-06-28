'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';

interface WatchedContentContextType {
  watchedContent: Set<string>;
  watchedEpisodes: Set<string>;
  isContentWatched: (contentId: number, contentType: 'movie' | 'tv') => boolean;
  isEpisodeWatched: (showId: number, seasonNumber: number, episodeNumber: number) => boolean;
  toggleContentWatched: (content: {
    id: number;
    title: string;
    name?: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    type: 'movie' | 'tv';
  }) => Promise<{ success: boolean; isWatched: boolean; message: string }>;
  toggleEpisodeWatched: (episode: {
    id: number;
    name: string;
    overview: string;
    still_path: string;
    air_date: string;
    episode_number: number;
    season_number: number;
  }, showId: number, showTitle: string) => Promise<{ success: boolean; isWatched: boolean; message: string }>;
  isLoading: boolean;
  refreshWatchedContent: () => Promise<void>;
}

const WatchedContentContext = createContext<WatchedContentContextType | undefined>(undefined);

export const useWatchedContent = () => {
  const context = useContext(WatchedContentContext);
  if (context === undefined) {
    throw new Error('useWatchedContent must be used within a WatchedContentProvider');
  }
  return context;
};

interface WatchedContentProviderProps {
  children: ReactNode;
}

export const WatchedContentProvider: React.FC<WatchedContentProviderProps> = ({ children }) => {
  const [watchedContent, setWatchedContent] = useState<Set<string>>(new Set());
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Check if content is watched
  const isContentWatched = (contentId: number, contentType: 'movie' | 'tv'): boolean => {
    return watchedContent.has(`${contentId}-${contentType}`);
  };

  // Check if episode is watched
  const isEpisodeWatched = (showId: number, seasonNumber: number, episodeNumber: number): boolean => {
    return watchedEpisodes.has(`${showId}-${seasonNumber}-${episodeNumber}`);
  };

  // Update user stats (streak, etc.)
  const updateUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Check if user has any activity today
      const { data: todayActivities } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', user.id)
        .gte('time', `${today}T00:00:00`)
        .lt('time', `${today}T23:59:59`)
        .limit(1);

      if (todayActivities && todayActivities.length > 0) {
        // User has activity today, update streak
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('current_streak, longest_streak, last_activity_date')
          .eq('user_id', user.id)
          .single();

        if (currentStats) {
          const lastActivityDate = currentStats.last_activity_date;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = currentStats.current_streak;

          if (lastActivityDate === yesterdayStr) {
            // Consecutive day, increment streak
            newStreak = currentStats.current_streak + 1;
          } else if (lastActivityDate !== today) {
            // Not consecutive, reset streak to 1
            newStreak = 1;
          }

          const newLongestStreak = Math.max(currentStats.longest_streak, newStreak);

          // Update user stats
          await supabase
            .from('user_stats')
            .upsert({
              user_id: user.id,
              current_streak: newStreak,
              longest_streak: newLongestStreak,
              last_activity_date: today,
              updated_at: new Date().toISOString()
            });
        } else {
          // Create new user stats
          await supabase
            .from('user_stats')
            .insert({
              user_id: user.id,
              current_streak: 1,
              longest_streak: 1,
              last_activity_date: today,
              updated_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  // Add activity to activities table
  const addActivity = async (type: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          type: type,
          content: content,
          time: new Date().toISOString()
        });

      // Update user stats after adding activity
      await updateUserStats();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  // Load all watched content at once
  const loadWatchedContent = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Load watched content and episodes in parallel
      const [watchedContentResponse, watchedEpisodesResponse] = await Promise.all([
        supabase
          .from('watched_content')
          .select('content_id, content_type')
          .eq('user_id', user.id),
        supabase
          .from('watched_episodes')
          .select('show_id, season_number, episode_number')
          .eq('user_id', user.id)
      ]);

      if (watchedContentResponse.data) {
        const contentSet = new Set(
          watchedContentResponse.data.map(item => `${item.content_id}-${item.content_type}`)
        );
        setWatchedContent(contentSet);
      }

      if (watchedEpisodesResponse.data) {
        const episodeSet = new Set(
          watchedEpisodesResponse.data.map(item => `${item.show_id}-${item.season_number}-${item.episode_number}`)
        );
        setWatchedEpisodes(episodeSet);
      }
    } catch (error) {
      console.error('Error loading watched content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh watched content (for manual refresh)
  const refreshWatchedContent = async () => {
    await loadWatchedContent();
  };

  // Mark content as watched/unwatched with optimistic updates
  const toggleContentWatched = async (content: {
    id: number;
    title: string;
    name?: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    type: 'movie' | 'tv';
  }): Promise<{ success: boolean; isWatched: boolean; message: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, isWatched: false, message: 'User not authenticated' };
      }

      const contentKey = `${content.id}-${content.type}`;
      const isCurrentlyWatched = watchedContent.has(contentKey);
      const title = content.title || content.name || '';

      // Optimistic update
      if (isCurrentlyWatched) {
        // Optimistically remove from watched
        setWatchedContent(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentKey);
          return newSet;
        });
      } else {
        // Optimistically add to watched
        setWatchedContent(prev => new Set(prev).add(contentKey));
      }

      if (isCurrentlyWatched) {
        // Remove from watched
        await supabase
          .from('watched_content')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', content.id)
          .eq('content_type', content.type);

        // Add activity for unwatching
        await addActivity('content_unwatched', `Removed "${title}" from watched list`);

        return {
          success: true,
          isWatched: false,
          message: `Removed "${title}" from watched list`
        };
      } else {
        // Add to watched
        await supabase
          .from('watched_content')
          .upsert({
            user_id: user.id,
            content_id: content.id,
            content_type: content.type,
            title: title,
            poster_path: content.poster_path,
            backdrop_path: content.backdrop_path,
            overview: content.overview
          });

        // Add activity for watching
        const contentType = content.type === 'movie' ? 'Movie' : 'TV Show';
        await addActivity('content_watched', `Watched ${contentType}: "${title}"`);

        return {
          success: true,
          isWatched: true,
          message: `Added "${title}" to watched list`
        };
      }
    } catch (error) {
      // Revert optimistic update on error
      const contentKey = `${content.id}-${content.type}`;
      const isCurrentlyWatched = watchedContent.has(contentKey);

      if (isCurrentlyWatched) {
        setWatchedContent(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentKey);
          return newSet;
        });
      } else {
        setWatchedContent(prev => new Set(prev).add(contentKey));
      }

      console.error('Error toggling content watched status:', error);
      return {
        success: false,
        isWatched: isCurrentlyWatched,
        message: 'Failed to update watched status'
      };
    }
  };

  // Mark episode as watched/unwatched with optimistic updates
  const toggleEpisodeWatched = async (episode: {
    id: number;
    name: string;
    overview: string;
    still_path: string;
    air_date: string;
    episode_number: number;
    season_number: number;
  }, showId: number, showTitle: string): Promise<{ success: boolean; isWatched: boolean; message: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, isWatched: false, message: 'User not authenticated' };
      }

      const episodeKey = `${showId}-${episode.season_number}-${episode.episode_number}`;
      const isCurrentlyWatched = watchedEpisodes.has(episodeKey);

      // Optimistic update
      if (isCurrentlyWatched) {
        // Optimistically remove from watched
        setWatchedEpisodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(episodeKey);
          return newSet;
        });
      } else {
        // Optimistically add to watched
        setWatchedEpisodes(prev => new Set(prev).add(episodeKey));
      }

      if (isCurrentlyWatched) {
        // Remove from watched
        await supabase
          .from('watched_episodes')
          .delete()
          .eq('user_id', user.id)
          .eq('show_id', showId)
          .eq('season_number', episode.season_number)
          .eq('episode_number', episode.episode_number);

        // Add activity for unwatching episode
        await addActivity('episode_unwatched', `Removed episode "${episode.name}" from "${showTitle}"`);

        return {
          success: true,
          isWatched: false,
          message: `Removed episode "${episode.name}" from watched list`
        };
      } else {
        // Add to watched
        await supabase
          .from('watched_episodes')
          .upsert({
            user_id: user.id,
            show_id: showId,
            season_number: episode.season_number,
            episode_number: episode.episode_number,
            episode_title: episode.name,
            show_title: showTitle,
            poster_path: episode.still_path,
            overview: episode.overview
          });

        // Add activity for watching episode
        await addActivity('episode_watched', `Watched episode "${episode.name}" from "${showTitle}"`);

        return {
          success: true,
          isWatched: true,
          message: `Added episode "${episode.name}" to watched list`
        };
      }
    } catch (error) {
      // Revert optimistic update on error
      const episodeKey = `${showId}-${episode.season_number}-${episode.episode_number}`;
      const isCurrentlyWatched = watchedEpisodes.has(episodeKey);

      if (isCurrentlyWatched) {
        setWatchedEpisodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(episodeKey);
          return newSet;
        });
      } else {
        setWatchedEpisodes(prev => new Set(prev).add(episodeKey));
      }

      console.error('Error toggling episode watched status:', error);
      return {
        success: false,
        isWatched: isCurrentlyWatched,
        message: 'Failed to update episode watched status'
      };
    }
  };

  // Load watched content on mount
  useEffect(() => {
    loadWatchedContent();
  }, []);

  const value: WatchedContentContextType = {
    watchedContent,
    watchedEpisodes,
    isContentWatched,
    isEpisodeWatched,
    toggleContentWatched,
    toggleEpisodeWatched,
    isLoading,
    refreshWatchedContent
  };

  return (
    <WatchedContentContext.Provider value={value}>
      {children}
    </WatchedContentContext.Provider>
  );
}; 