/**
 * SuperMemo 2 Spaced Repetition Algorithm Implementation
 * Based on the research by Piotr Wozniak
 * 
 * This algorithm calculates optimal intervals between reviews
 * to maximize retention while minimizing study time.
 */

export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  quality: number;
  nextReview: Date;
}

export interface ReviewResult {
  newEaseFactor: number;
  newInterval: number;
  newRepetitions: number;
  nextReview: Date;
  isDue: boolean;
}

/**
 * Quality ratings for user responses
 * 5: perfect response
 * 4: correct response after a hesitation
 * 3: correct response with difficulty
 * 2: incorrect response; where the correct one seemed easy to recall
 * 1: incorrect response; the correct one remembered
 * 0: complete blackout
 */
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Calculate new SRS parameters after a review
 * @param currentData - Current SRS data for the word
 * @param quality - Quality rating of the user's response (0-5)
 * @returns New SRS parameters
 */
export function calculateNextReview(
  currentData: SRSData,
  quality: QualityRating
): ReviewResult {
  let newEaseFactor = currentData.easeFactor;
  let newInterval = currentData.interval;
  let newRepetitions = currentData.repetitions;

  // Calculate new ease factor
  if (quality >= 3) {
    // Good response - increase ease factor
    newEaseFactor = Math.max(1.3, currentData.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  } else {
    // Poor response - decrease ease factor
    newEaseFactor = Math.max(1.3, currentData.easeFactor - 0.2);
  }

  // Calculate new interval based on repetitions and quality
  if (quality < 3) {
    // Reset to learning phase
    newRepetitions = 0;
    newInterval = 1; // Review tomorrow
  } else {
    newRepetitions += 1;

    if (newRepetitions === 1) {
      newInterval = 1; // First repetition: 1 day
    } else if (newRepetitions === 2) {
      newInterval = 6; // Second repetition: 6 days
    } else {
      // Subsequent repetitions: interval * ease factor
      newInterval = Math.round(newInterval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    newEaseFactor,
    newInterval,
    newRepetitions,
    nextReview,
    isDue: true,
  };
}

/**
 * Check if a word is due for review
 * @param lastReview - Last review date
 * @param interval - Current interval in days
 * @returns True if the word is due for review
 */
export function isDueForReview(lastReview: Date, interval: number): boolean {
  const now = new Date();
  const dueDate = new Date(lastReview);
  dueDate.setDate(dueDate.getDate() + interval);

  return now >= dueDate;
}

/**
 * Calculate days until next review
 * @param lastReview - Last review date
 * @param interval - Current interval in days
 * @returns Days until next review (negative if overdue)
 */
export function daysUntilReview(lastReview: Date, interval: number): number {
  const now = new Date();
  const dueDate = new Date(lastReview);
  dueDate.setDate(dueDate.getDate() + interval);

  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get initial SRS data for new words
 * @returns Initial SRS parameters
 */
export function getInitialSRSData(): SRSData {
  return {
    easeFactor: 2.5, // Starting ease factor
    interval: 1, // Start with 1 day interval
    repetitions: 0, // No repetitions yet
    quality: 0, // No quality rating yet
    nextReview: new Date(), // Review today
  };
}

/**
 * Calculate retention rate based on SRS data
 * @param easeFactor - Current ease factor
 * @param interval - Current interval
 * @returns Estimated retention rate (0-1)
 */
export function calculateRetentionRate(easeFactor: number, interval: number): number {
  // Simplified retention calculation based on ease factor and interval
  // Higher ease factor and longer intervals generally indicate better retention
  const baseRetention = 0.85; // Base retention rate
  const easeFactorBonus = Math.min(0.1, (easeFactor - 2.0) * 0.05);
  const intervalBonus = Math.min(0.05, Math.log(interval + 1) * 0.01);

  return Math.min(0.98, baseRetention + easeFactorBonus + intervalBonus);
}

/**
 * Get review priority score for sorting due cards
 * @param lastReview - Last review date
 * @param interval - Current interval
 * @param easeFactor - Current ease factor
 * @returns Priority score (higher = more urgent)
 */
export function getReviewPriority(lastReview: Date, interval: number, easeFactor: number): number {
  const daysOverdue = daysUntilReview(lastReview, interval);

  if (daysOverdue <= 0) {
    // Overdue cards get highest priority
    return Math.abs(daysOverdue) * 10;
  } else if (daysOverdue <= 1) {
    // Due today/tomorrow get high priority
    return 5;
  } else {
    // Future reviews get lower priority
    return Math.max(1, 5 - daysOverdue);
  }
}
