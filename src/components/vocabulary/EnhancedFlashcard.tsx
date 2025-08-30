'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Repeat, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { DueWord, QualityRating } from '@/types/vocabulary';
import { calculateRetentionRate } from '@/utils/srsAlgorithm';

interface EnhancedFlashcardProps {
  word: DueWord;
  onReview: (quality: QualityRating) => Promise<void>;
  onSkip?: () => void;
  showProgress?: boolean;
  currentIndex?: number;
  totalWords?: number;
  sessionType?: 'review' | 'learning' | 'mixed';
}

const qualityRatingLabels: Record<QualityRating, { label: string; description: string; color: string }> = {
  0: { label: 'Blackout', description: 'Complete blackout', color: 'bg-red-500 hover:bg-red-600' },
  1: { label: 'Incorrect', description: 'Incorrect but remembered', color: 'bg-orange-500 hover:bg-orange-600' },
  2: { label: 'Hard', description: 'Incorrect response', color: 'bg-yellow-500 hover:bg-yellow-600' },
  3: { label: 'Good', description: 'Correct with difficulty', color: 'bg-blue-500 hover:bg-blue-600' },
  4: { label: 'Easy', description: 'Correct after hesitation', color: 'bg-green-500 hover:bg-green-600' },
  5: { label: 'Perfect', description: 'Perfect response', color: 'bg-emerald-500 hover:bg-emerald-600' },
};

export const EnhancedFlashcard: React.FC<EnhancedFlashcardProps> = ({
  word,
  onReview,
  onSkip,
  showProgress = true,
  currentIndex = 0,
  totalWords = 1,
  sessionType = 'review'
}) => {
  const [flipped, setFlipped] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Calculate retention rate for this word
  const retentionRate = calculateRetentionRate(
    word.ease_factor || 2.5,
    word.interval_days || 1
  );

  // Get days until next review
  const getDaysUntilReview = () => {
    if (!word.next_review) return 0;
    const now = new Date();
    const nextReview = new Date(word.next_review);
    const diffTime = nextReview.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleReview = async (quality: QualityRating) => {
    setIsReviewing(true);
    try {
      await onReview(quality);
      setFlipped(false);
      setShowHint(false);
    } catch (error) {
      console.error('Error reviewing word:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    if (!flipped) {
      setShowHint(false);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'learning': return 'bg-red-100 text-red-800 border-red-200';
      case 'familiar': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mastered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'A1': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'A2': return 'bg-green-100 text-green-800 border-green-200';
      case 'B1': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'B2': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'C1': return 'bg-red-100 text-red-800 border-red-200';
      case 'C2': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const progressPercentage = totalWords > 0 ? (currentIndex / totalWords) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{currentIndex + 1} of {totalWords}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Main Flashcard */}
      <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-8">
          {/* Word Status Badges */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2">
              <Badge className={`${getStatusColor(word.status)} border`}>
                {word.status}
              </Badge>
              <Badge className={`${getDifficultyColor(word.difficulty_level || 'A1')} border`}>
                {word.difficulty_level || 'A1'}
              </Badge>
            </div>

            {/* SRS Info */}
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1 mb-1">
                <Repeat className="w-3 h-3" />
                <span>{word.repetitions || 0} reps</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>EF: {(word.ease_factor || 2.5).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* German Word */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-2">
              {word.german}
            </h2>
            {word.tags && word.tags.length > 0 && (
              <div className="flex justify-center gap-2 mt-2">
                {word.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Answer Section */}
          {flipped && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              {/* English Translation */}
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
                  {word.english}
                </h3>
              </div>

              {/* Example Sentence */}
              {word.example && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground italic">
                    "{word.example}"
                  </p>
                </div>
              )}

              {/* Notes */}
              {word.notes && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> {word.notes}
                  </p>
                </div>
              )}

              {/* SRS Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Next review: {getDaysUntilReview()} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>Retention: {Math.round(retentionRate * 100)}%</span>
                </div>
              </div>

              {/* Overdue Warning */}
              {word.reviewStatus === 'overdue' && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>This word is {word.daysOverdue} days overdue for review!</span>
                </div>
              )}
            </div>
          )}

          {/* Hint Section */}
          {!flipped && showHint && (
            <div className="text-center animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Hint:</strong> {word.notes || 'Try to remember the context or related words'}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 p-6">
          {/* Action Buttons */}
          {!flipped ? (
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleShowHint}
                disabled={showHint}
                className="flex-1"
              >
                Show Hint
              </Button>
              <Button
                onClick={handleFlip}
                className="flex-1 bg-brand-accent hover:bg-brand-accent/90"
              >
                Reveal Answer
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              {/* Quality Rating Buttons */}
              <div className="grid grid-cols-6 gap-2">
                {([0, 1, 2, 3, 4, 5] as QualityRating[]).map((quality) => (
                  <Button
                    key={quality}
                    onClick={() => handleReview(quality)}
                    disabled={isReviewing}
                    className={`${qualityRatingLabels[quality].color} text-white border-0 hover:scale-105 transition-transform h-16`}
                    title={qualityRatingLabels[quality].description}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{quality}</div>
                      <div className="text-xs opacity-90">{qualityRatingLabels[quality].label}</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Skip Button */}
              {onSkip && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                  disabled={isReviewing}
                  className="w-full"
                >
                  Skip for now
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Session Type Indicator */}
      {sessionType && (
        <div className="text-center">
          <Badge variant="outline" className="text-sm">
            {sessionType === 'review' && 'Review Session'}
            {sessionType === 'learning' && 'Learning Session'}
            {sessionType === 'mixed' && 'Mixed Session'}
          </Badge>
        </div>
      )}
    </div>
  );
};
