export interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  example: string | null;
  status: "learning" | "familiar" | "mastered";
  last_reviewed?: string;
  isOptimistic?: boolean;

  // SRS (Spaced Repetition System) fields
  ease_factor?: number;
  interval_days?: number;
  repetitions?: number;
  next_review?: string;

  // Enhanced vocabulary fields
  difficulty_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  context_sentences?: string[];
  related_words?: string[];
  notes?: string;
  tags?: string[];
  last_quality_rating?: number;

  // Metadata
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ReviewStats {
  learning: number;
  familiar: number;
  mastered: number;
  dueForReview: number;
  reviewedToday: number;
  total: number;

  // Enhanced SRS stats
  overdue: number;
  averageEaseFactor: number;
  totalRepetitions: number;
  studyStreak: number;
}

export interface VocabularyCategory {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VocabularyWordRelationship {
  id: string;
  word_id: string;
  related_word_id: string;
  relationship_type: 'synonym' | 'antonym' | 'related' | 'derived' | 'compound';
  strength: number;
  created_at?: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  session_type: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'writing' | 'mixed';
  duration_minutes: number;
  words_reviewed: number;
  words_correct: number;
  accuracy_rate: number;
  session_data: Record<string, any>;
  created_at?: string;
}

export interface VocabularyReviewHistory {
  id: string;
  word_id: string;
  user_id: string;
  quality_rating: number;
  ease_factor_before: number;
  ease_factor_after: number;
  interval_before: number;
  interval_after: number;
  repetitions_before: number;
  repetitions_after: number;
  review_duration_seconds?: number;
  session_id?: string;
  created_at?: string;
}

export interface VocabularyLearningPath {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  difficulty_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  target_vocabulary_count: number;
  current_progress: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VocabularyPathWord {
  path_id: string;
  word_id: string;
  order_index: number;
  is_required: boolean;
  prerequisites: string[];
  created_at?: string;
}

export interface SRSReviewData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  daysOverdue: number;
  reviewStatus: 'overdue' | 'due_today' | 'due_tomorrow' | 'future';
}

export interface DueWord extends VocabularyWord, SRSReviewData { }

export interface VocabularyStats {
  total_words: number;
  learning_count: number;
  familiar_count: number;
  mastered_count: number;
  due_for_review: number;
  overdue_count: number;
  average_ease_factor: number;
  total_repetitions: number;
  study_streak_days: number;
}

// Filter types
export type FilterStatus = "all" | "learning" | "familiar" | "mastered";
export type FilterDifficulty = "all" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// Review quality ratings
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

// Session types for learning analytics
export type SessionType = 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'writing' | 'mixed';