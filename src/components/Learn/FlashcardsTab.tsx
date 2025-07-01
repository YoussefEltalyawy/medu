"use client";

import React from "react";
import { Squircle } from "corner-smoothing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFlashcards, type FlashcardWord } from "@/hooks/useFlashcards";

const statusText = {
  learning: "Learning",
  familiar: "Familiar",
  mastered: "Mastered",
} as const;

const statusColors = {
  learning: "bg-red-100 text-red-800",
  familiar: "bg-yellow-100 text-yellow-800",
  mastered: "bg-green-100 text-green-800",
} as const;

const FlashcardsTab: React.FC = () => {
  const {
    // State
    allWords,
    reviewWords,
    currentIndex,
    browseIndex,
    flipped,
    loading,
    error,
    reviewComplete,
    setReviewComplete,
    mode,
    reviewStats,

    // Actions
    setFlipped,
    setMode,
    setBrowseIndex,
    updateWordStatus,
    resetReview,
    startReview,
    startBrowse,
  } = useFlashcards();

  if (loading) {
    return <div className="text-center py-8">Loading flashcards...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={resetReview}
          className="bg-brand-accent text-white px-4 py-2 rounded-full hover:bg-opacity-90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-[#082408] mb-6">
          Review Complete! 🎉
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-[#240808]">
              {reviewStats.learning}
            </div>
            <div className="text-sm text-gray-600">Learning</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-[#4E4211]">
              {reviewStats.familiar}
            </div>
            <div className="text-sm text-gray-600">Familiar</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-[#082408]">
              {reviewStats.mastered}
            </div>
            <div className="text-sm text-gray-600">Mastered</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm col-span-3">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              Today&apos;s Progress
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Reviewed: {reviewStats.reviewedToday} cards
              </span>
              <span className="text-sm text-gray-600">
                Due: {reviewStats.dueForReview} cards
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={resetReview}
            className="bg-brand-accent text-white px-6 py-3 rounded-full hover:bg-opacity-90 text-lg"
          >
            Start New Review
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setReviewComplete(false);
              setMode("dashboard");
            }}
            className="px-6 py-3 rounded-full text-lg"
          >
            Return
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

  if (mode === "review") {
    if (reviewWords.length === 0) {
      return (
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Cards to Review
          </h2>
          <p className="text-gray-600 mb-6">
            All your words are mastered! Add more words to continue learning.
          </p>
          <Button variant="outline" onClick={() => setMode("dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Flashcard Review</h2>
          <Button
            variant="ghost"
            onClick={() => {
              setMode("dashboard");
              setFlipped(false);
            }}
          >
            Exit Review
          </Button>
        </div>
        {renderFlashcard(reviewWords[currentIndex], true)}
      </div>
    );
  }

  if (mode === "browse") {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Browse All Cards</h2>
          <Button
            variant="ghost"
            onClick={() => {
              setMode("dashboard");
              setFlipped(false);
            }}
          >
            Back to Dashboard
          </Button>
        </div>
        {renderFlashcard(allWords[browseIndex], false)}
      </div>
    );
  }

  // Main dashboard view for flashcards
  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Flashcard Review
        </h2>
        <p className="text-gray-600">
          Review your vocabulary with spaced repetition
        </p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Cards */}
        <Squircle
          cornerRadius={20}
          className="bg-brand-blue p-6 before:bg-blue-100 h-36"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div className="text-lg text-brand-light-blue font-medium">
                Total Cards
              </div>
              <div className="text-brand-light-blue">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-bold text-brand-light-blue">
                {reviewStats.total}
              </div>
            </div>
          </div>
        </Squircle>

        {/* Due for Review */}
        <Squircle
          cornerRadius={20}
          className="bg-brand-yellow p-6 before:bg-yellow-100 h-36"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div className="text-lg text-brand-light-yellow font-medium">
                Due for Review
              </div>
              <div className="text-brand-light-yellow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-bold text-brand-light-yellow">
                {reviewStats.dueForReview}
              </div>
            </div>
          </div>
        </Squircle>

        {/* Reviewed Today */}
        <Squircle
          cornerRadius={20}
          className="bg-brand-green p-6 before:bg-green-100 h-36"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div className="text-lg text-brand-light-green font-medium">
                Reviewed Today
              </div>
              <div className="text-brand-light-green">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-bold text-brand-light-green">
                {reviewStats.reviewedToday}
              </div>
            </div>
          </div>
        </Squircle>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Squircle
          cornerRadius={20}
          className="bg-[#5E7850]/20 dark:bg-[#1d1d1d] p-6 cursor-pointer  transition-all hover:-translate-y-1 before:bg-card h-full"
          onClick={startReview}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-900 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="w-full">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">
                  Start Review
                </h3>
                <span className="ml-2 bg-gray-100 dark:bg-black/60 px-2 py-1 rounded-full text-sm">
                  {reviewWords.length} {reviewWords.length === 1 ? 'card' : 'cards'}

                </span>
              </div>
              <p className="text-sm text-gray-500">
                Review cards with spaced repetition
              </p>
            </div>
          </div>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-[#5E7850]/20 dark:bg-[#1d1d1d] p-6 cursor-pointer  transition-all hover:-translate-y-1 before:bg-card h-full"
          onClick={startBrowse}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-900 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </div>
            <div className="w-full">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">
                  Browse All Cards
                </h3>
                <span className="ml-2 bg-gray-100 dark:bg-black/60 px-2 py-1 rounded-full text-sm">
                  {allWords.length} {allWords.length === 1 ? 'card' : 'cards'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                View and flip through all your cards
              </p>
            </div>
          </div>
        </Squircle>
      </div>

      {/* Recent Cards */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Cards</h3>
        <div className="space-y-4">
          {allWords.slice(0, 3).map((word) => (
            <div key={word.id} className="bg-card p-4 rounded-xl border border-[#5E7850]/20 dark:border-[#1d1d1d]">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{word.german}</h4>
                  <p className="text-gray-600">{word.english}</p>
                </div>
                <div>
                  {word.status === "learning" && (
                    <span className="px-2 py-1 bg-red-800 text-red-100 text-xs rounded-full">
                      learning
                    </span>
                  )}
                  {word.status === "familiar" && (
                    <span className="px-2 py-1 bg-yellow-800 text-yellow-100 text-xs rounded-full">
                      familiar
                    </span>
                  )}
                  {word.status === "mastered" && (
                    <span className="px-2 py-1 bg-green-800 text-green-100 text-xs rounded-full">
                      mastered
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {allWords.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No vocabulary words found. Add some words to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardsTab;
