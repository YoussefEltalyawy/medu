export interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  example: string | null;
  status: "learning" | "familiar" | "mastered";
  last_reviewed?: string;
  isOptimistic?: boolean;
}

export interface ReviewStats {
  learning: number;
  familiar: number;
  mastered: number;
  dueForReview: number;
  reviewedToday: number;
  total: number;
}

export type WordStatus = "learning" | "familiar" | "mastered";
export type FilterStatus = "all" | WordStatus;