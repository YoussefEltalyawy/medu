"use client";

import React from "react";
import { Squircle } from "corner-smoothing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEnhancedFlashcards, type FlashcardWord } from "@/hooks/useEnhancedFlashcards";
import { EnhancedFlashcard } from "@/components/vocabulary/EnhancedFlashcard";
import { CheckCircle, Clock, BookOpen, Target } from "lucide-react";



const FlashcardsTab: React.FC = () => {
  const {
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
  } = useEnhancedFlashcards();

  if (loading) {
    return <div className="text-center py-8">Loading flashcards...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-brand-accent text-white px-4 py-2 rounded-full hover:bg-opacity-90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (sessionComplete && currentSession) {
    return (
      <div className="text-center p-6">
        <div className="mb-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Session Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Great job! You've completed your {currentSession.type} session.
          </p>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>Words reviewed: {currentSession.wordsReviewed}</p>
            <p>Accuracy: {Math.round(currentSession.accuracy)}%</p>
            <p>Duration: {currentSession.duration} minutes</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={resetSession}
            className="bg-brand-accent text-white px-4 py-2 rounded-full hover:bg-opacity-90"
          >
            Start New Session
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const renderFlashcard = (word: FlashcardWord, isReview: boolean = true) => {
    const totalCards = isReview ? reviewWords.length : allWords.length;
    const currentCardIndex = isReview ? currentIndex : browseIndex;
    const status = word.status as keyof typeof statusColors;

    return (
      <div className="flex flex-col w-full">
        {/* Progress Bar */}
        {isReview && (
          <div className="w-full mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {currentCardIndex + 1} / {totalCards}
              </span>
            </div>
            <Progress
              value={(currentCardIndex / totalCards) * 100}
              className="h-2 bg-gray-200"
            />
          </div>
        )}

        {/* Flashcard */}
        <div
          className="w-full cursor-pointer transition-transform hover:scale-[1.01]"
          onClick={() => setFlipped(!flipped)}
        >
          <Card className="relative overflow-hidden">
            {/* Status Badge */}
            <div
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
            >
              {statusText[status]}
            </div>

            <CardContent className="p-8 min-h-64 flex items-center justify-center">
              {!flipped ? (
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">{word.german}</h3>
                  {word.example && (
                    <p className="text-gray-600 italic">
                      &ldquo;{word.example}&rdquo;
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    Click to reveal translation
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-2">{word.english}</h3>
                  <p className="text-gray-600 text-xl mb-4">{word.german}</p>
                  {word.example && (
                    <p className="text-gray-600 italic">
                      &ldquo;{word.example}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <CardFooter className="flex justify-center space-x-4 mt-6">
          {isReview ? (
            flipped ? (
              <>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  onClick={() => updateWordStatus(word.id, "learning")}
                  disabled={word.isOptimistic}
                >
                  Learning
                </Button>
                <Button
                  variant="outline"
                  className="bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
                  onClick={() => updateWordStatus(word.id, "familiar")}
                  disabled={word.isOptimistic}
                >
                  Familiar
                </Button>
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                  onClick={() => updateWordStatus(word.id, "mastered")}
                  disabled={word.isOptimistic}
                >
                  Mastered
                </Button>
              </>
            ) : (
              <Button onClick={() => setFlipped(true)} variant="outline">
                Reveal Answer
              </Button>
            )
          ) : (
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setFlipped(!flipped)}>
                {flipped ? "Show Original" : "Show Translation"}
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setBrowseIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={browseIndex === 0}
                >
                  ←
                </Button>
                <span className="text-sm text-gray-500">
                  {browseIndex + 1} / {allWords.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setBrowseIndex((prev) =>
                      Math.min(allWords.length - 1, prev + 1)
                    )
                  }
                  disabled={browseIndex === allWords.length - 1}
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </div>
    );
  };

  // If no session is active, show the dashboard
  if (!currentSession) {
    return (
      <div className="space-y-8 w-full">
        <div className="text-left">
          <h2 className="text-3xl font-bold mb-4">Flashcard Dashboard</h2>
          <p className="text-muted-foreground mb-8">
            Choose your study session type and start learning!
          </p>
        </div>

        {/* Session Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Review Session */}
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => startReviewSession('review')}>
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Review Session</h3>
              <p className="text-muted-foreground mb-4">
                Review words that are due for repetition
              </p>
              <div className="text-2xl font-bold text-blue-600">
                {dueWords.filter(w => w.reviewStatus === 'overdue' || w.reviewStatus === 'due_today').length}
              </div>
              <div className="text-sm text-muted-foreground">words due</div>
            </CardContent>
          </Card>

          {/* Learning Session */}
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => startLearningSession()}>
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Learning Session</h3>
              <p className="text-muted-foreground mb-4">
                Learn new words for the first time
              </p>
              <div className="text-2xl font-bold text-green-600">
                {learningWords.length}
              </div>
              <div className="text-sm text-muted-foreground">new words</div>
            </CardContent>
          </Card>

          {/* Mixed Session */}
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => startMixedSession()}>
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mixed Session</h3>
              <p className="text-muted-foreground mb-4">
                Combine review and learning for variety
              </p>
              <div className="text-2xl font-bold text-purple-600">
                {Math.min(20, dueWords.length + learningWords.length)}
              </div>
              <div className="text-sm text-muted-foreground">total words</div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        {sessionStats && (
          <div className="w-full">
            <h3 className="text-xl font-semibold mb-4 text-left">Your Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{sessionStats.totalReviews}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
              <div className="bg-card p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{sessionStats.averageAccuracy}%</div>
                <div className="text-sm text-muted-foreground">Avg. Accuracy</div>
              </div>
              <div className="bg-card p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{sessionStats.wordsMastered}</div>
                <div className="text-sm text-muted-foreground">Words Mastered</div>
              </div>
              <div className="bg-card p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{sessionStats.streakDays}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If session is active, show the flashcard
  if (currentWord) {
    return (
      <div className="space-y-6">
        {/* Session Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={previousWord}
              disabled={currentSession.currentIndex === 0}
            >
              ← Previous
            </Button>
            <span className="text-lg font-medium">
              {currentSession.currentIndex + 1} of {currentSession.totalWords}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextWord}
              disabled={currentSession.currentIndex === currentSession.totalWords - 1}
            >
              Next →
            </Button>
          </div>

          {/* Progress Bar */}
          <Progress
            value={getProgressPercentage()}
            className="h-2 max-w-md mx-auto"
          />

          {/* Session Info */}
          <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <span>Accuracy: {Math.round(currentSession.accuracy)}%</span>
            <span>Time: ~{getEstimatedTimeRemaining()} min left</span>
          </div>
        </div>

        {/* Enhanced Flashcard Component */}
        <EnhancedFlashcard
          word={currentWord}
          onReview={reviewCurrentWord}
          onSkip={nextWord}
          showProgress={false}
          currentIndex={currentSession.currentIndex}
          totalWords={currentSession.totalWords}
          sessionType={currentSession.type}
        />
      </div>
    );
  }
};

export default FlashcardsTab;
