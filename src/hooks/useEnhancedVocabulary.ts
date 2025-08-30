'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  VocabularyWord,
  ReviewStats,
  VocabularyCategory,
  VocabularyWordRelationship,
  LearningSession,
  VocabularyReviewHistory,
  DueWord,
  VocabularyStats,
  QualityRating,
  FilterStatus,
  FilterDifficulty
} from '@/types/vocabulary';
import {
  calculateNextReview,
  getInitialSRSData,
  isDueForReview,
  getReviewPriority
} from '@/utils/srsAlgorithm';
import { toast } from 'sonner';

export const useEnhancedVocabulary = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [dueWords, setDueWords] = useState<DueWord[]>([]);
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VocabularyStats | null>(null);

  const supabase = createClient();

  const generateTempId = () => `temp_${Date.now()}_${Math.random()}`;

  // Fetch all vocabulary words with SRS data
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to view your vocabulary");
        return;
      }

      const { data, error } = await supabase
        .from("vocabulary_words")
        .select("*")
        .eq("user_id", user.id)
        .order("next_review", { ascending: true });

      if (error) throw error;

      if (!data) {
        setWords([]);
        setDueWords([]);
      } else {
        setWords(data);

        // Filter due words for review
        const due = data.filter(word =>
          word.next_review && isDueForReview(new Date(word.next_review), word.interval_days || 1)
        ).map(word => ({
          ...word,
          easeFactor: word.ease_factor || 2.5,
          interval: word.interval_days || 1,
          repetitions: word.repetitions || 0,
          nextReview: word.next_review || new Date().toISOString(),
          daysOverdue: word.next_review ?
            Math.max(0, Math.ceil((new Date().getTime() - new Date(word.next_review).getTime()) / (1000 * 60 * 60 * 24))) : 0,
          reviewStatus: word.next_review ?
            (new Date(word.next_review) < new Date() ? 'overdue' :
              new Date(word.next_review).toDateString() === new Date().toDateString() ? 'due_today' : 'due_tomorrow') : 'future'
        })).sort((a, b) => getReviewPriority(new Date(a.nextReview), a.interval, a.easeFactor) -
          getReviewPriority(new Date(b.nextReview), b.interval, b.easeFactor));

        setDueWords(due);
      }
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
      setError("Failed to load vocabulary words");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Fetch vocabulary categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, check if user has categories, if not create default ones
      let { data: existingCategories, error: checkError } = await supabase
        .from("vocabulary_categories")
        .select("*")
        .eq("user_id", user.id);

      if (checkError) throw checkError;

      // If no categories exist, create default ones
      if (!existingCategories || existingCategories.length === 0) {
        console.log("No categories found, attempting to create default ones for user:", user.id);

        // First check if the RPC function exists
        try {
          const { error: createError } = await supabase
            .rpc('create_default_categories_for_user', { user_uuid: user.id });

          if (createError) {
            console.error("Error creating default categories:", {
              error: createError,
              message: createError.message,
              details: createError.details,
              hint: createError.hint,
              code: createError.code
            });

            // Try to create categories manually as fallback
            console.log("Attempting manual category creation as fallback...");
            try {
              const defaultCategories = [
                { name: 'Basic Vocabulary', description: 'Essential everyday words', color: '#3B82F6' },
                { name: 'Food & Dining', description: 'Words related to food and restaurants', color: '#10B981' },
                { name: 'Travel & Transportation', description: 'Transportation and travel vocabulary', color: '#F59E0B' },
                { name: 'Family & Relationships', description: 'Family members and relationships', color: '#EF4444' },
                { name: 'Work & Business', description: 'Professional and business vocabulary', color: '#8B5CF6' },
                { name: 'Hobbies & Leisure', description: 'Recreational activities and hobbies', color: '#06B6D4' }
              ];

              const { data: manualCategories, error: manualError } = await supabase
                .from("vocabulary_categories")
                .insert(defaultCategories.map(cat => ({ ...cat, user_id: user.id })))
                .select();

              if (manualError) {
                console.error("Manual category creation also failed:", manualError);
              } else {
                console.log("Manual category creation successful:", manualCategories);
                setCategories(manualCategories || []);
                return;
              }
            } catch (manualErr) {
              console.error("Exception during manual category creation:", manualErr);
            }
          } else {
            console.log("Default categories created successfully via RPC");
            // Fetch the newly created categories
            const { data: newCategories, error: fetchError } = await supabase
              .from("vocabulary_categories")
              .select("*")
              .eq("user_id", user.id)
              .order("name");

            if (fetchError) throw fetchError;
            setCategories(newCategories || []);
            return;
          }
        } catch (rpcErr) {
          console.error("RPC function call failed:", rpcErr);
          // Fall through to manual creation
        }
      }

      // Set existing categories
      setCategories(existingCategories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Set empty array to avoid blocking the app
      setCategories([]);
    }
  }, [supabase]);

  // Fetch vocabulary statistics
  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_user_vocabulary_stats', { user_uuid: user.id });

      if (error) throw error;
      setStats(data[0] || null);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [supabase]);

  // Add new word with SRS initialization
  const addWord = async (wordData: {
    german: string;
    english: string;
    example?: string;
    difficulty_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    category_ids?: string[];
    notes?: string;
    tags?: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to add words");
      return false;
    }

    const tempId = generateTempId();
    const srsData = getInitialSRSData();

    const optimisticWord: VocabularyWord = {
      id: tempId,
      german: wordData.german,
      english: wordData.english,
      example: wordData.example || null,
      status: "learning",
      isOptimistic: true,
      ease_factor: srsData.easeFactor,
      interval_days: srsData.interval,
      repetitions: srsData.repetitions,
      next_review: srsData.nextReview.toISOString(),
      difficulty_level: wordData.difficulty_level || 'A1',
      notes: wordData.notes,
      tags: wordData.tags || [],
    };

    try {
      setWords((prev) => [...prev, optimisticWord]);

      const { data, error } = await supabase
        .from("vocabulary_words")
        .insert([{
          user_id: user.id,
          german: optimisticWord.german,
          english: optimisticWord.english,
          example: optimisticWord.example,
          status: optimisticWord.status,
          ease_factor: optimisticWord.ease_factor,
          interval_days: optimisticWord.interval_days,
          repetitions: optimisticWord.repetitions,
          next_review: optimisticWord.next_review,
          difficulty_level: optimisticWord.difficulty_level,
          notes: optimisticWord.notes,
          tags: optimisticWord.tags,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add category relationships if specified
      if (wordData.category_ids && wordData.category_ids.length > 0) {
        const categoryInserts = wordData.category_ids.map(categoryId => ({
          word_id: data.id,
          category_id: categoryId,
        }));

        await supabase
          .from("vocabulary_word_categories")
          .insert(categoryInserts);
      }

      setWords((prev) =>
        prev.map((word) =>
          word.id === tempId ? { ...data, isOptimistic: false } : word
        )
      );

      // Refresh data
      await fetchWords();
      await fetchStats();

      toast.success("Word added successfully!");
      return true;
    } catch (err) {
      console.error("Error adding word:", err);
      setWords((prev) => prev.filter((word) => word.id !== tempId));
      setError("Failed to add word");
      toast.error("Failed to add word");
      return false;
    }
  };

  // Update word with SRS integration
  const updateWord = async (id: string, updates: Partial<VocabularyWord>) => {
    try {
      const originalWord = words.find((word) => word.id === id);
      if (!originalWord) return false;

      const { error } = await supabase
        .from("vocabulary_words")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setWords((prev) =>
        prev.map((word) =>
          word.id === id ? { ...word, ...updates } : word
        )
      );

      await fetchWords();
      await fetchStats();

      toast.success("Word updated successfully!");
      return true;
    } catch (err) {
      console.error("Error updating word:", err);
      setError("Failed to update word");
      toast.error("Failed to update word");
      return false;
    }
  };

  // Review word with SRS algorithm
  const reviewWord = async (id: string, quality: QualityRating, reviewDuration?: number) => {
    try {
      const word = words.find((w) => w.id === id);
      if (!word) return false;

      const currentSRSData = {
        easeFactor: word.ease_factor || 2.5,
        interval: word.interval_days || 1,
        repetitions: word.repetitions || 0,
        quality: word.last_quality_rating || 0,
        nextReview: word.next_review || new Date().toISOString(),
      };

      const reviewResult = calculateNextReview(currentSRSData, quality);

      // Determine new status based on quality
      let newStatus = word.status;
      if (quality >= 4) {
        newStatus = word.status === 'learning' ? 'familiar' : 'mastered';
      } else if (quality <= 2) {
        newStatus = 'learning';
      }

      // Update word with new SRS data
      const updateData = {
        status: newStatus,
        ease_factor: reviewResult.newEaseFactor,
        interval_days: reviewResult.newInterval,
        repetitions: reviewResult.newRepetitions,
        next_review: reviewResult.nextReview.toISOString(),
        last_reviewed: new Date().toISOString(),
        last_quality_rating: quality,
      };

      // Create learning session if it doesn't exist
      let sessionId: string | undefined;
      const today = new Date().toISOString().split('T')[0];
      const { data: existingSession } = await supabase
        .from("learning_sessions")
        .select("id")
        .eq("user_id", word.user_id)
        .eq("session_type", "vocabulary")
        .gte("created_at", today)
        .single();

      if (existingSession) {
        sessionId = existingSession.id;
      } else {
        const { data: newSession } = await supabase
          .from("learning_sessions")
          .insert([{
            user_id: word.user_id!,
            session_type: "vocabulary",
            duration_minutes: 0,
            words_reviewed: 0,
            words_correct: 0,
            accuracy_rate: 0,
          }])
          .select()
          .single();

        if (newSession) sessionId = newSession.id;
      }

      // Record review history
      if (sessionId) {
        await supabase
          .from("vocabulary_review_history")
          .insert([{
            word_id: id,
            user_id: word.user_id!,
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

      // Update the word
      await updateWord(id, updateData);

      toast.success(`Word reviewed! Quality: ${quality}/5`);
      return true;
    } catch (err) {
      console.error("Error reviewing word:", err);
      setError("Failed to review word");
      toast.error("Failed to review word");
      return false;
    }
  };

  // Delete word
  const deleteWord = async (id: string) => {
    try {
      const { error } = await supabase
        .from("vocabulary_words")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setWords((prev) => prev.filter((word) => word.id !== id));
      await fetchStats();

      toast.success("Word deleted successfully!");
      return true;
    } catch (err) {
      console.error("Error deleting word:", err);
      setError("Failed to delete word");
      toast.error("Failed to delete word");
      return false;
    }
  };

  // Get review statistics
  const getReviewStats = (): ReviewStats => {
    const today = new Date().toDateString();
    const reviewedToday = words.filter(
      (word) =>
        word.last_reviewed &&
        new Date(word.last_reviewed).toDateString() === today
    ).length;

    const overdue = dueWords.filter(word => word.reviewStatus === 'overdue').length;
    const averageEaseFactor = words.length > 0 ?
      words.reduce((sum, word) => sum + (word.ease_factor || 2.5), 0) / words.length : 0;
    const totalRepetitions = words.reduce((sum, word) => sum + (word.repetitions || 0), 0);

    return {
      learning: words.filter((w) => w.status === "learning").length,
      familiar: words.filter((w) => w.status === "familiar").length,
      mastered: words.filter((w) => w.status === "mastered").length,
      dueForReview: dueWords.length,
      reviewedToday,
      total: words.length,
      overdue,
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
      totalRepetitions,
      studyStreak: stats?.study_streak_days || 0,
    };
  };

  // Filter words by various criteria
  const filterWords = (
    statusFilter: FilterStatus = "all",
    difficultyFilter: FilterDifficulty = "all",
    categoryFilter: string = "all",
    searchQuery: string = ""
  ) => {
    let filtered = words;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((word) => word.status === statusFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((word) => word.difficulty_level === difficultyFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      // TODO: Implement category filtering when categories are properly linked
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (word) =>
          word.german.toLowerCase().includes(query) ||
          word.english.toLowerCase().includes(query) ||
          (word.example && word.example.toLowerCase().includes(query)) ||
          (word.notes && word.notes.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  // Get words due for review
  const getDueWords = (limit?: number) => {
    const due = dueWords.filter(word => word.reviewStatus === 'overdue' || word.reviewStatus === 'due_today');
    return limit ? due.slice(0, limit) : due;
  };

  // Get words for learning (new words)
  const getLearningWords = (limit?: number) => {
    const learning = words.filter(word => word.status === 'learning' && word.repetitions === 0);
    return limit ? learning.slice(0, limit) : learning;
  };

  useEffect(() => {
    fetchWords();
    fetchCategories();
    fetchStats();
  }, [fetchWords, fetchCategories, fetchStats]);

  return {
    // State
    words,
    dueWords,
    categories,
    loading,
    error,
    stats,

    // Actions
    addWord,
    updateWord,
    reviewWord,
    deleteWord,
    fetchWords,
    fetchCategories,
    fetchStats,

    // Utilities
    getReviewStats,
    filterWords,
    getDueWords,
    getLearningWords,

    // Error handling
    setError,
  };
};
