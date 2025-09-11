import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  LearningActivity,
  VocabularyQuestion,
  GrammarExercise,
  ListeningExercise,
  SpeakingExercise,
  WritingExercise,
  ActivityResult,
  Achievement
} from '@/components/learning';

export interface UserProgress {
  id: string;
  user_id: string;
  activity_id: string;
  activity_type: string;
  score: number;
  max_score: number;
  accuracy: number;
  time_spent: number;
  completed_at: string;
  metadata: any;
}

export interface LearningStats {
  totalActivities: number;
  completedActivities: number;
  totalScore: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
}

export const useLearningActivities = (userId: string) => {
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all learning activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      // In a real app, this would fetch from a database
      // For now, we'll create sample activities
      const sampleActivities: LearningActivity[] = [
        {
          id: 'vocab-1',
          type: 'vocabulary',
          title: 'Basic Greetings',
          description: 'Learn essential German greetings and introductions',
          difficulty: 'A1',
          estimatedTime: 15,
          isCompleted: false,
          progress: 0,
          instructions: ['Practice common greetings', 'Learn basic phrases'],
          words: []
        },
        {
          id: 'grammar-1',
          type: 'grammar',
          title: 'Present Tense Verbs',
          description: 'Master basic verb conjugation in present tense',
          difficulty: 'A1',
          estimatedTime: 20,
          isCompleted: false,
          progress: 0,
          instructions: ['Learn verb endings', 'Practice conjugation'],
        },
        {
          id: 'listening-1',
          type: 'listening',
          title: 'Simple Conversations',
          description: 'Listen to basic German conversations',
          difficulty: 'A1',
          estimatedTime: 25,
          isCompleted: false,
          progress: 0,
          instructions: ['Listen carefully', 'Answer comprehension questions'],
          audioUrl: '/audio/simple-conversation.mp3'
        },
        {
          id: 'speaking-1',
          type: 'speaking',
          title: 'Pronunciation Practice',
          description: 'Practice German pronunciation with basic words',
          difficulty: 'A1',
          estimatedTime: 15,
          isCompleted: false,
          progress: 0,
          instructions: ['Record your voice', 'Compare with model'],
        },
        {
          id: 'writing-1',
          type: 'writing',
          title: 'Simple Sentences',
          description: 'Write basic German sentences',
          difficulty: 'A1',
          estimatedTime: 20,
          isCompleted: false,
          progress: 0,
          instructions: ['Use learned vocabulary', 'Follow grammar rules'],
        }
      ];

      setActivities(sampleActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to fetch learning activities');
      toast.error('Failed to fetch learning activities');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user progress
  const fetchUserProgress = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setUserProgress(data || []);
    } catch (err) {
      console.error('Error fetching user progress:', err);
      // Don't show error toast for progress fetch
    }
  }, [userId]);

  // Fetch learning statistics
  const fetchLearningStats = useCallback(async () => {
    try {
      // Calculate stats from user progress
      const totalActivities = activities.length;
      const completedActivities = userProgress.length;
      const totalScore = userProgress.reduce((sum, progress) => sum + progress.score, 0);
      const averageAccuracy = completedActivities > 0
        ? Math.round(userProgress.reduce((sum, progress) => sum + progress.accuracy, 0) / completedActivities)
        : 0;
      const totalTimeSpent = userProgress.reduce((sum, progress) => sum + progress.time_spent, 0);

      // Calculate streaks (simplified)
      const sortedProgress = userProgress
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = 0; i < sortedProgress.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const currentDate = new Date(sortedProgress[i].completed_at);
          const prevDate = new Date(sortedProgress[i - 1].completed_at);
          const dayDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

          if (dayDiff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }

        longestStreak = Math.max(longestStreak, tempStreak);
        if (i === 0) currentStreak = tempStreak;
      }

      // Sample achievements
      const achievements: Achievement[] = [
        {
          id: 'first-activity',
          name: 'First Steps',
          description: 'Complete your first learning activity',
          icon: '🎯',
          unlocked: completedActivities > 0,
          points: 10
        },
        {
          id: 'streak-3',
          name: 'Consistent Learner',
          description: 'Maintain a 3-day learning streak',
          icon: '🔥',
          unlocked: currentStreak >= 3,
          points: 25
        },
        {
          id: 'streak-7',
          name: 'Week Warrior',
          description: 'Maintain a 7-day learning streak',
          icon: '⚡',
          unlocked: currentStreak >= 7,
          points: 50
        },
        {
          id: 'accuracy-90',
          name: 'Accuracy Master',
          description: 'Achieve 90% accuracy in an activity',
          icon: '🎯',
          unlocked: averageAccuracy >= 90,
          points: 30
        }
      ];

      setStats({
        totalActivities,
        completedActivities,
        totalScore,
        averageAccuracy,
        totalTimeSpent,
        currentStreak,
        longestStreak,
        achievements
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  }, [activities, userProgress]);

  // Save activity progress
  const saveActivityProgress = useCallback(async (progress: Omit<UserProgress, 'id'>) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('learning_progress')
        .insert([progress])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUserProgress(prev => [...prev, data]);

      // Update activity completion status
      setActivities(prev =>
        prev.map(activity =>
          activity.id === progress.activity_id
            ? { ...activity, isCompleted: true, progress: 100 }
            : activity
        )
      );

      toast.success('Progress saved successfully!');
      return data;
    } catch (err) {
      console.error('Error saving progress:', err);
      setError('Failed to save progress');
      toast.error('Failed to save progress');
      return null;
    }
  }, []);

  // Generate vocabulary questions
  const generateVocabularyQuestions = useCallback((words: any[], count: number = 10): VocabularyQuestion[] => {
    if (words.length === 0) return [];

    const questions: VocabularyQuestion[] = [];
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    shuffledWords.slice(0, Math.min(count, words.length)).forEach((word, index) => {
      // Multiple choice question
      questions.push({
        id: `mc-${index}`,
        type: 'multiple-choice',
        question: `What does "${word.german}" mean in English?`,
        correctAnswer: word.english,
        options: generateOptions(word.english, words),
        word,
        difficulty: getDifficulty(word),
        points: getDifficultyPoints(word)
      });

      // Translation question
      questions.push({
        id: `tr-${index}`,
        type: 'translation',
        question: `Translate "${word.english}" to German`,
        correctAnswer: word.german,
        word,
        difficulty: getDifficulty(word),
        points: getDifficultyPoints(word)
      });
    });

    return questions.sort(() => Math.random() - 0.5);
  }, []);

  // Generate grammar exercises
  const generateGrammarExercises = useCallback((difficulty: string = 'A1'): GrammarExercise[] => {
    const exercises: GrammarExercise[] = [
      {
        id: 'grammar-1',
        type: 'multiple-choice',
        topic: 'Basic Verb Conjugation',
        difficulty: difficulty as any,
        question: 'What is the correct form of "sein" (to be) for "ich"?',
        correctAnswer: 'bin',
        options: ['bin', 'bist', 'ist', 'sind'],
        explanation: 'The verb "sein" conjugates as: ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie sind.',
        rules: ['First person singular uses "bin"', 'This is an irregular verb'],
        examples: ['Ich bin Student.', 'Ich bin müde.', 'Ich bin hier.'],
        points: 20
      },
      {
        id: 'grammar-2',
        type: 'fill-blank',
        topic: 'Articles',
        difficulty: difficulty as any,
        question: 'Fill in the blank: "Das ist _____ Buch." (This is a book)',
        correctAnswer: 'ein',
        explanation: 'The word "Buch" is neuter, so it takes the article "ein".',
        rules: ['Neuter nouns take "ein"', 'Masculine nouns take "ein"', 'Feminine nouns take "eine"'],
        examples: ['Das ist ein Buch.', 'Das ist ein Auto.', 'Das ist ein Kind.'],
        points: 15
      }
    ];

    return exercises;
  }, []);

  // Helper functions
  const getDifficulty = (word: any): 'easy' | 'medium' | 'hard' => {
    const difficulty = word.difficulty_level || 'A1';
    if (difficulty === 'A1' || difficulty === 'A2') return 'easy';
    if (difficulty === 'B1' || difficulty === 'B2') return 'medium';
    return 'hard';
  };

  const getDifficultyPoints = (word: any): number => {
    const difficulty = getDifficulty(word);
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
  };

  const generateOptions = (correctAnswer: string, allWords: any[]): string[] => {
    const options = [correctAnswer];
    const otherWords = allWords
      .filter(w => w.english !== correctAnswer)
      .map(w => w.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    options.push(...otherWords);
    return options.sort(() => Math.random() - 0.5);
  };

  // Initialize
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (userId) {
      fetchUserProgress();
    }
  }, [userId, fetchUserProgress]);

  useEffect(() => {
    if (activities.length > 0 && userProgress.length >= 0) {
      fetchLearningStats();
    }
  }, [activities, userProgress, fetchLearningStats]);

  return {
    activities,
    userProgress,
    stats,
    loading,
    error,
    fetchActivities,
    fetchUserProgress,
    saveActivityProgress,
    generateVocabularyQuestions,
    generateGrammarExercises,
    refreshStats: fetchLearningStats
  };
};
