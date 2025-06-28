import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { VocabularyWord, ReviewStats } from "@/types/vocabulary";
import { toast } from "sonner";

export const useVocabulary = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const generateTempId = () => `temp_${Date.now()}_${Math.random()}`;

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
        .select("id, german, english, example, status, last_reviewed")
        .eq("user_id", user.id)
        .order("german", { ascending: true });

      if (error) throw error;

      if (!data) {
        setWords([]);
      } else {
        setWords((prev) => [
          ...data,
          ...prev.filter((word) => word.isOptimistic),
        ]);
      }
    } catch (err) {
      console.error("Error fetching vocabulary:", err);
      setError("Failed to load vocabulary words");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const addWord = async (wordData: { german: string; english: string; example?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to add words");
      return false;
    }

    const tempId = generateTempId();
    const optimisticWord: VocabularyWord = {
      id: tempId,
      german: wordData.german,
      english: wordData.english,
      example: wordData.example || null,
      status: "learning",
      isOptimistic: true,
    };

    try {
      setWords((prev) => [...prev, optimisticWord]);

      const { data, error } = await supabase
        .from("vocabulary_words")
        .insert([
          {
            user_id: user.id,
            german: optimisticWord.german,
            english: optimisticWord.english,
            example: optimisticWord.example,
            status: optimisticWord.status,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setWords((prev) =>
        prev.map((word) =>
          word.id === tempId ? { ...data, isOptimistic: false } : word
        )
      );
      return true;
    } catch (err) {
      console.error("Error adding word:", err);
      setWords((prev) => prev.filter((word) => word.id !== tempId));
      setError("Failed to add word");
      toast.error("Failed to add word");
      return false;
    }
  };

  const updateWord = async (id: string, updates: Partial<VocabularyWord>) => {
    const originalWord = words.find((word) => word.id === id);
    if (!originalWord) return false;

    try {
      setWords((prev) =>
        prev.map((word) =>
          word.id === id
            ? { ...word, ...updates, isOptimistic: true }
            : word
        )
      );

      const { error } = await supabase
        .from("vocabulary_words")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setWords((prev) =>
        prev.map((word) =>
          word.id === id ? { ...word, isOptimistic: false } : word
        )
      );
      return true;
    } catch (err) {
      console.error("Error updating word:", err);
      setWords((prev) =>
        prev.map((word) =>
          word.id === id ? { ...originalWord, isOptimistic: false } : word
        )
      );
      setError("Failed to update word");
      toast.error("Failed to update word");
      return false;
    }
  };

  const updateWordStatus = async (id: string, status: WordStatus) => {
    return updateWord(id, { 
      status, 
      last_reviewed: new Date().toISOString() 
    });
  };

  const deleteWord = async (id: string) => {
    const originalWord = words.find((word) => word.id === id);
    if (!originalWord) return false;

    try {
      setWords((prev) => prev.filter((word) => word.id !== id));

      const { error } = await supabase
        .from("vocabulary_words")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error deleting word:", err);
      setWords((prev) => [...prev, originalWord]);
      setError("Failed to delete word");
      toast.error("Failed to delete word");
      return false;
    }
  };

  const getReviewStats = (): ReviewStats => {
    const today = new Date().toDateString();
    const reviewedToday = words.filter(
      (word) =>
        word.last_reviewed &&
        new Date(word.last_reviewed).toDateString() === today
    ).length;

    return {
      learning: words.filter((w) => w.status === "learning").length,
      familiar: words.filter((w) => w.status === "familiar").length,
      mastered: words.filter((w) => w.status === "mastered").length,
      dueForReview: words.filter(
        (word) => word.status === "learning" || word.status === "familiar"
      ).length,
      reviewedToday,
      total: words.length,
    };
  };

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return {
    words,
    loading,
    error,
    addWord,
    updateWord,
    updateWordStatus,
    deleteWord,
    fetchWords,
    getReviewStats,
    setError,
  };
};