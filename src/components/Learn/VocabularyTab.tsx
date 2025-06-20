"use client";

import React, { useState, useEffect } from "react";
import { Squircle } from "corner-smoothing";
import { createClient } from "@/lib/supabase";

interface FlashcardWord {
  id: string;
  german: string;
  english: string;
  example: string | null;
  status: "learning" | "familiar" | "mastered";
}

const FlashcardsTab: React.FC = () => {
  const [words, setWords] = useState<FlashcardWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    learning: 0,
    familiar: 0,
    mastered: 0,
  });
  const [reviewMode, setReviewMode] = useState(false);

  const supabase = createClient();

  // Fetch vocabulary words for review
  const fetchWords = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to review flashcards");
        return;
      }

      // Get words that are due for review or new words
      // In a real SRS system, you would check next_review date
      // For now, we'll just get a random selection of words
      const { data, error } = await supabase
        .from("vocabulary_words")
        .select("id, german, english, example, status")
        .eq("user_id", user.id)
        .limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        setError(
          "No vocabulary words found. Add some words in the Vocabulary tab."
        );
        setLoading(false);
        return;
      }

      // Shuffle the words
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setWords(shuffled);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setError("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  // Update word status after review
  const updateWordStatus = async (
    id: string,
    newStatus: "learning" | "familiar" | "mastered"
  ) => {
    try {
      const { error } = await supabase
        .from("vocabulary_words")
        .update({
          status: newStatus,
          last_reviewed: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update review stats
      setReviewStats((prev) => ({
        ...prev,
        [newStatus]: prev[newStatus] + 1,
      }));

      // Move to next card
      goToNextCard();
    } catch (err) {
      console.error("Error updating word status:", err);
      setError("Failed to update word status");
    }
  };

  const goToNextCard = () => {
    setFlipped(false);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setReviewComplete(true);
    }
  };

  const resetReview = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setReviewComplete(false);
    setReviewStats({ learning: 0, familiar: 0, mastered: 0 });
    fetchWords();
  };

  useEffect(() => {
    fetchWords();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading flashcards...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchWords()}
          className="bg-brand-green text-white px-4 py-2 rounded-full hover:bg-opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-brand-green mb-6">
          Review Complete!
        </h2>

        <div className="flex justify-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-red">
              {reviewStats.learning}
            </div>
            <div className="text-sm text-gray-600">Learning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-yellow">
              {reviewStats.familiar}
            </div>
            <div className="text-sm text-gray-600">Familiar</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-green">
              {reviewStats.mastered}
            </div>
            <div className="text-sm text-gray-600">Mastered</div>
          </div>
        </div>

        <button
          onClick={resetReview}
          className="bg-brand-green text-white px-6 py-3 rounded-full hover:bg-opacity-90 text-lg"
        >
          Start New Review
        </button>
      </div>
    );
  }

  if (reviewMode) {
    const currentWord = words[currentIndex];

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-brand-green">
            Flashcard Review
          </h2>
          <div className="text-sm text-gray-600">
            Card {currentIndex + 1} of {words.length}
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <div
            className="w-full max-w-lg cursor-pointer"
            onClick={() => setFlipped(!flipped)}
          >
            <Squircle
              borderWidth={2}
              cornerRadius={25}
              className={`bg-white p-8 h-64 flex items-center justify-center transition-all duration-300 ${
                flipped ? "bg-gray-50" : ""
              } before:bg-white`}
            >
              <div className="text-center">
                {!flipped ? (
                  <>
                    <h3 className="text-3xl font-bold mb-4">
                      {currentWord.german}
                    </h3>
                    {currentWord.example && (
                      <p className="text-gray-600 italic">
                        "{currentWord.example}"
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-4">
                      Click to reveal translation
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold mb-2">
                      {currentWord.english}
                    </h3>
                    <p className="text-gray-600 mb-4">{currentWord.german}</p>
                    {currentWord.example && (
                      <p className="text-gray-600 italic">
                        "{currentWord.example}"
                      </p>
                    )}
                  </>
                )}
              </div>
            </Squircle>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {flipped ? (
            <>
              <button
                onClick={() => updateWordStatus(currentWord.id, "learning")}
                className="bg-brand-red text-white px-6 py-3 rounded-full hover:bg-opacity-90"
              >
                Learning
              </button>
              <button
                onClick={() => updateWordStatus(currentWord.id, "familiar")}
                className="bg-brand-yellow text-white px-6 py-3 rounded-full hover:bg-opacity-90"
              >
                Familiar
              </button>
              <button
                onClick={() => updateWordStatus(currentWord.id, "mastered")}
                className="bg-brand-green text-white px-6 py-3 rounded-full hover:bg-opacity-90"
              >
                Mastered
              </button>
            </>
          ) : (
            <button
              onClick={() => setFlipped(true)}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-300"
            >
              Reveal Answer
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calculate word counts by status
  const masteredCount = words.filter(
    (word) => word.status === "mastered"
  ).length;
  const familiarCount = words.filter(
    (word) => word.status === "familiar"
  ).length;
  const learningCount = words.filter(
    (word) => word.status === "learning"
  ).length;

  // Main dashboard view for flashcards
  return (
    <div className="p-6">
      {/* Progress Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Squircle
          cornerRadius={20}
          className="bg-brand-green text-white p-6 relative overflow-hidden before:bg-brand-green"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mastered</h3>
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold">{masteredCount} Words</div>
          </div>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-brand-yellow text-white p-6 relative overflow-hidden before:bg-brand-yellow"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Familiar</h3>
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl font-bold">{familiarCount} Words</div>
          </div>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-brand-red text-white p-6 relative overflow-hidden before:bg-brand-red"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Learning</h3>
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6h8M6 2l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold">{learningCount} Words</div>
          </div>
        </Squircle>
      </div>

      {/* Vocabulary Words List */}
      <div className="space-y-4">
        {words.slice(0, 3).map((word) => (
          <div
            key={word.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {word.german}
                </h3>
                <p className="text-gray-600 mb-2">{word.english}</p>
                {word.example && (
                  <p className="text-gray-500 italic text-sm">
                    "{word.example}"
                  </p>
                )}
              </div>
              <div className="ml-4">
                {word.status === "learning" && (
                  <span className="px-3 py-1 bg-brand-light-red text-brand-red text-sm font-medium rounded-full">
                    Learning
                  </span>
                )}
                {word.status === "familiar" && (
                  <span className="px-3 py-1 bg-brand-light-yellow text-brand-yellow text-sm font-medium rounded-full">
                    Familiar
                  </span>
                )}
                {word.status === "mastered" && (
                  <span className="px-3 py-1 bg-brand-light-green text-brand-green text-sm font-medium rounded-full">
                    Mastered
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Start Review Button */}
      {words.length > 0 && (
        <div className="mt-8 text-center">

        </div>
      )}
    </div>
  );
};

export default FlashcardsTab;
