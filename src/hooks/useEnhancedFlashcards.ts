'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  VocabularyWord,
  DueWord,
  LearningSession,
  VocabularyReviewHistory,
  QualityRating
} from '@/types/vocabulary';
import {
  calculateNextReview,
  getReviewPriority,
  calculateRetentionRate
} from '@/utils/srsAlgorithm';
import { toast } from 'sonner';

export interface FlashcardSession {
  id: string;
  type: 'review' | 'learning' | 'mixed';
  words: DueWord[];
  currentIndex: number;
  totalWords: number;
  startTime: Date;
  endTime?: Date;
  duration: number;
  accuracy: number;
  wordsReviewed: number;
  wordsCorrect: number;
}

export interface FlashcardStats {
  totalReviews: number;
  averageAccuracy: number;
  totalStudyTime: number;
  streakDays: number;
  retentionRate: number;
  wordsMastered: number;
  wordsLearning: number;
  dueToday: number;
  overdue: number;
}

export const useEnhancedFlashcards = () => {
  const [currentSession, setCurrentSession] = useState<FlashcardSession | null>(null);
  const [dueWords, setDueWords] = useState<DueWord[]>([]);
  const [learningWords, setLearningWords] = useState<VocabularyWord[]>([]);
  const [currentWord, setCurrentWord] = useState<DueWord | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState<FlashcardStats | null>(null);

  const supabase = createClient();

  // Fetch due words for review
  const fetchDueWords = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to review flashcards");
        return;
      }

      // Get due words using the database function
      const { data, error } = await supabase
        .rpc('get_due_words_for_review', { user_uuid: user.id });

      if (error) throw error;

      if (data) {
        const dueWordsWithMetadata = data.map(word => ({
          ...word,
          easeFactor: word.ease_factor || 2.5,
          interval: word.interval_days || 1,
          repetitions: word.repetitions || 0,
          nextReview: word.next_review || new Date().toISOString(),
          daysOverdue: word.days_overdue || 0,
          reviewStatus: word.days_overdue > 0 ? 'overdue' : 'due_today'
        })).sort((a, b) => getReviewPriority(new Date(a.nextReview), a.interval, a.easeFactor) -
          getReviewPriority(new Date(b.nextReview), b.interval, b.easeFactor));

        setDueWords(dueWordsWithMetadata);
      }
    } catch (err) {
      console.error("Error fetching due words:", err);
      setError("Failed to load due words");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Fetch learning words (new words)
  const fetchLearningWords = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vocabulary_words")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "learning")
        .eq("repetitions", 0)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setLearningWords(data || []);
    } catch (err) {
      console.error("Error fetching learning words:", err);
    }
  }, [supabase]);

  // Start a review session
  const startReviewSession = useCallback((sessionType: 'review' | 'learning' | 'mixed' = 'review') => {
    let sessionWords: DueWord[] = [];

    if (sessionType === 'review') {
      sessionWords = dueWords.slice(0, 20); // Limit to 20 words per session
    } else if (sessionType === 'learning') {
      // Convert learning words to DueWord format
      sessionWords = learningWords.slice(0, 10).map(word => ({
        ...word,
        easeFactor: word.ease_factor || 2.5,
        interval: word.interval_days || 1,
        repetitions: word.repetitions || 0,
        nextReview: word.next_review || new Date().toISOString(),
        daysOverdue: 0,
        reviewStatus: 'due_today' as const
      }));
    } else {
      // Mixed session: combine review and learning words
      const reviewWords = dueWords.slice(0, 15);
      const newLearningWords = learningWords.slice(0, 5).map(word => ({
        ...word,
        easeFactor: word.ease_factor || 2.5,
        interval: word.interval_days || 1,
        repetitions: word.repetitions || 0,
        nextReview: word.next_review || new Date().toISOString(),
        daysOverdue: 0,
        reviewStatus: 'due_today' as const
      }));
      sessionWords = [...reviewWords, ...newLearningWords];
    }

    if (sessionWords.length === 0) {
      toast.info("No words available for review!");
      return;
    }

    const session: FlashcardSession = {
      id: `session_${Date.now()}`,
      type: sessionType,
      words: sessionWords,
      currentIndex: 0,
      totalWords: sessionWords.length,
      startTime: new Date(),
      duration: 0,
      accuracy: 0,
      wordsReviewed: 0,
      wordsCorrect: 0,
    };

    setCurrentSession(session);
    setCurrentWord(sessionWords[0]);
    setFlipped(false);
    setSessionComplete(false);

    toast.success(`Started ${sessionType} session with ${sessionWords.length} words`);
  }, [dueWords, learningWords]);

  // Start a learning session (new words)
  const startLearningSession = useCallback(() => {
    startReviewSession('learning');
  }, [startReviewSession]);

  // Start a mixed session
  const startMixedSession = useCallback(() => {
    startReviewSession('mixed');
  }, [startReviewSession]);

  // Review current word with quality rating
  const reviewCurrentWord = useCallback(async (quality: QualityRating) => {
    if (!currentWord || !currentSession) return;

    const startTime = Date.now();

    // Immediately update UI state for better responsiveness
    const newWordsReviewed = currentSession.wordsReviewed + 1;
    const newWordsCorrect = currentSession.wordsCorrect + (quality >= 3 ? 1 : 0);
    const newAccuracy = (newWordsCorrect / newWordsReviewed) * 100;

    // Move to next word immediately
    const nextIndex = currentSession.currentIndex + 1;
    if (nextIndex < currentSession.words.length) {
      setCurrentSession(prev => prev ? { ...prev, currentIndex: nextIndex } : null);
      setCurrentWord(currentSession.words[nextIndex]);
      setFlipped(false);
    } else {
      // Session complete
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60);

      setCurrentSession(prev => prev ? { ...prev, endTime, duration } : null);
      setSessionComplete(true);
    }

    // Update session progress immediately
    setCurrentSession(prev => prev ? {
      ...prev,
      wordsReviewed: newWordsReviewed,
      wordsCorrect: newWordsCorrect,
      accuracy: newAccuracy,
    } : null);

    // Show quality feedback immediately
    const qualityMessages = {
      0: "Complete blackout - let's review this again soon!",
      1: "Incorrect but remembered - keep practicing!",
      2: "Incorrect response - needs more review",
      3: "Correct with difficulty - getting there!",
      4: "Correct after hesitation - good progress!",
      5: "Perfect response - excellent!"
    };

    toast.success(qualityMessages[quality] || `Quality: ${quality}/5`);

    // Run database operations in background (non-blocking)
    (async () => {
      try {
        // Calculate new SRS parameters
        const currentSRSData = {
          easeFactor: currentWord.ease_factor || 2.5,
          interval: currentWord.interval_days || 1,
          repetitions: currentWord.repetitions || 0,
          quality: currentWord.last_quality_rating || 0,
          nextReview: currentWord.next_review || new Date().toISOString(),
        };

        const reviewResult = calculateNextReview(currentSRSData, quality);

        // Determine new status based on quality
        let newStatus = currentWord.status;
        if (quality >= 4) {
          newStatus = currentWord.status === 'learning' ? 'familiar' : 'mastered';
        } else if (quality <= 2) {
          newStatus = 'learning';
        }

        // Update word in database
        await supabase
          .from("vocabulary_words")
          .update({
            status: newStatus,
            ease_factor: reviewResult.newEaseFactor,
            interval_days: reviewResult.newInterval,
            repetitions: reviewResult.newRepetitions,
            next_review: reviewResult.nextReview.toISOString(),
            last_reviewed: new Date().toISOString(),
            last_quality_rating: quality,
          })
          .eq("id", currentWord.id);

        // Create or update learning session
        const today = new Date().toISOString().split('T')[0];
        let sessionId: string | undefined;

        const { data: existingSession } = await supabase
          .from("learning_sessions")
          .select("id, words_reviewed, words_correct")
          .eq("user_id", currentWord.user_id)
          .eq("session_type", "vocabulary")
          .gte("created_at", today)
          .single();

        if (existingSession) {
          sessionId = existingSession.id;
          // Update existing session
          await supabase
            .from("learning_sessions")
            .update({
              words_reviewed: existingSession.words_reviewed + 1,
              words_correct: existingSession.words_correct + (quality >= 3 ? 1 : 0),
              accuracy_rate: ((existingSession.words_correct + (quality >= 3 ? 1 : 0)) / (existingSession.words_reviewed + 1)) * 100,
            })
            .eq("id", existingSession.id);
        } else {
          // Create new session
          const { data: newSession } = await supabase
            .from("learning_sessions")
            .insert([{
              user_id: currentWord.user_id!,
              session_type: "vocabulary",
              duration_minutes: 0,
              words_reviewed: 1,
              words_correct: quality >= 3 ? 1 : 0,
              accuracy_rate: quality >= 3 ? 100 : 0,
            }])
            .select()
            .single();

          if (newSession) sessionId = newSession.id;
        }

        // Record review history
        if (sessionId) {
          const reviewDuration = Math.round((Date.now() - startTime) / 1000);

          await supabase
            .from("vocabulary_review_history")
            .insert([{
              word_id: currentWord.id,
              user_id: currentWord.user_id!,
              quality_rating: quality,
              ease_factor_before: currentSRSData.easeFactor,
              ease_factor_after: reviewResult.newEaseFactor,
              interval_before: currentSRSData.interval,
              interval_after: reviewResult.newInterval,
              repetitions_before: currentSRSData.repetitions,
              repetitions_after: reviewResult.newRepetitions,
              review_duration_seconds: reviewDuration,
              session_id: sessionId,
            }]);
        }

        // Update final session stats if session is complete
        if (nextIndex >= currentSession.words.length && sessionId) {
          await supabase
            .from("learning_sessions")
            .update({
              duration_minutes: Math.round((Date.now() - currentSession.startTime.getTime()) / 1000 / 60),
              words_reviewed: newWordsReviewed,
              words_correct: newWordsCorrect,
              accuracy_rate: newAccuracy,
            })
            .eq("id", sessionId);
        }

      } catch (err) {
        console.error("Error in background review update:", err);
        // Don't show error to user since UI already updated
      }
    })();

  }, [currentWord, currentSession, supabase]);

  // Reset current session
  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setCurrentWord(null);
    setFlipped(false);
    setSessionComplete(false);
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recent session data
      const { data: sessions, error: sessionsError } = await supabase
        .from("learning_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("session_type", "vocabulary")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get vocabulary stats
      const { data: vocabStats, error: vocabError } = await supabase
        .rpc('get_user_vocabulary_stats', { user_uuid: user.id });

      if (vocabError) throw vocabError;

      if (sessions && vocabStats) {
        const totalReviews = sessions.reduce((sum, session) => sum + session.words_reviewed, 0);
        const averageAccuracy = sessions.length > 0 ?
          sessions.reduce((sum, session) => sum + session.accuracy_rate, 0) / sessions.length : 0;
        const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration_minutes, 0);

        // Calculate retention rate
        const totalWords = vocabStats[0]?.total_words || 0;
        const masteredWords = vocabStats[0]?.mastered_count || 0;
        const retentionRate = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

        const stats: FlashcardStats = {
          totalReviews,
          averageAccuracy: Math.round(averageAccuracy * 100) / 100,
          totalStudyTime,
          streakDays: vocabStats[0]?.study_streak_days || 0,
          retentionRate: Math.round(retentionRate * 100) / 100,
          wordsMastered: vocabStats[0]?.mastered_count || 0,
          wordsLearning: vocabStats[0]?.learning_count || 0,
          dueToday: dueWords.filter(word => word.reviewStatus === 'due_today').length,
          overdue: dueWords.filter(word => word.reviewStatus === 'overdue').length,
        };

        setSessionStats(stats);
      }
    } catch (err) {
      console.error("Error fetching session stats:", err);
    }
  }, [dueWords, supabase]);

  // Flip card to show answer
  const flipCard = useCallback(() => {
    setFlipped(!flipped);
  }, [flipped]);

  // Get next word in session
  const nextWord = useCallback(() => {
    if (!currentSession || currentSession.currentIndex >= currentSession.words.length - 1) {
      setSessionComplete(true);
      return;
    }

    const nextIndex = currentSession.currentIndex + 1;
    setCurrentSession(prev => prev ? { ...prev, currentIndex: nextIndex } : null);
    setCurrentWord(currentSession.words[nextIndex]);
    setFlipped(false);
  }, [currentSession]);

  // Get previous word in session
  const previousWord = useCallback(() => {
    if (!currentSession || currentSession.currentIndex <= 0) return;

    const prevIndex = currentSession.currentIndex - 1;
    setCurrentSession(prev => prev ? { ...prev, currentIndex: prevIndex } : null);
    setCurrentWord(currentSession.words[prevIndex]);
    setFlipped(false);
  }, [currentSession]);

  // Get progress percentage
  const getProgressPercentage = useCallback(() => {
    if (!currentSession) return 0;
    return Math.round((currentSession.currentIndex / currentSession.words.length) * 100);
  }, [currentSession]);

  // Get estimated time remaining
  const getEstimatedTimeRemaining = useCallback(() => {
    if (!currentSession || currentSession.currentIndex === 0) return 0;

    const elapsedTime = Date.now() - currentSession.startTime.getTime();
    const averageTimePerWord = elapsedTime / currentSession.currentIndex;
    const remainingWords = currentSession.words.length - currentSession.currentIndex;

    return Math.round((averageTimePerWord * remainingWords) / 1000 / 60); // in minutes
  }, [currentSession]);

  useEffect(() => {
    fetchDueWords();
    fetchLearningWords();
    getSessionStats();
  }, [fetchDueWords, fetchLearningWords, getSessionStats]);

  return {
    // State
    currentSession,
    currentWord,
    dueWords,
    learningWords,
    flipped,
    loading,
    error,
    sessionComplete,
    sessionStats,

    // Actions
    startReviewSession,
    startLearningSession,
    startMixedSession,
    reviewCurrentWord,
    resetSession,
    flipCard,
    nextWord,
    previousWord,

    // Utilities
    getProgressPercentage,
    getEstimatedTimeRemaining,
    getSessionStats,

    // Error handling
    setError,
  };
};
