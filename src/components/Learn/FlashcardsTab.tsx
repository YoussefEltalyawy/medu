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
          className="bg-[#082408] text-white px-4 py-2 rounded-full hover:bg-opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-[#082408] mb-6">
          Review Complete!
        </h2>

        <div className="flex justify-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#240808]">
              {reviewStats.learning}
            </div>
            <div className="text-sm text-gray-600">Learning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#4E4211]">
              {reviewStats.familiar}
            </div>
            <div className="text-sm text-gray-600">Familiar</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#082408]">
              {reviewStats.mastered}
            </div>
            <div className="text-sm text-gray-600">Mastered</div>
          </div>
        </div>

        <button
          onClick={resetReview}
          className="bg-[#082408] text-white px-6 py-3 rounded-full hover:bg-opacity-90 text-lg"
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
          <h2 className="text-xl font-semibold text-[#082408]">
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
                flipped ? "bg-[#F4F4F4]" : ""
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
                className="bg-[#240808] text-white px-6 py-3 rounded-full hover:bg-opacity-90"
              >
                Learning
              </button>
              <button
                onClick={() => updateWordStatus(currentWord.id, "familiar")}
                className="bg-[#4E4211] text-white px-6 py-3 rounded-full hover:bg-opacity-90"
              >
                Familiar
              </button>
              <button
                onClick={() => updateWordStatus(currentWord.id, "mastered")}
                className="bg-[#082408] text-white px-6 py-3 rounded-full hover:bg-opacity-90"
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

  // Main dashboard view for flashcards
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold  mb-6">Flashcard Review</h2>
        <p className="text-gray-600 mb-8">
          Review your vocabulary with spaced repetition
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Squircle
          cornerRadius={20}
          className="bg-brand-blue p-6 before:bg-blue-100 h-24 sm:h-28 md:h-32 lg:h-36"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
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
            <div className="mt-auto text-right">
              <div className="text-3xl font-bold text-brand-light-blue">
                {words.length}
              </div>
            </div>
          </div>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-brand-yellow p-6 before:bg-orange-100"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
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
            <div className="mt-auto text-right">
              <div className="text-3xl font-bold text-brand-light-yellow">
                2
              </div>
            </div>
          </div>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-brand-green p-6 before:bg-green-100"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-auto text-right">
              <div className="text-3xl font-bold text-brand-light-green">0</div>
            </div>
          </div>
        </Squircle>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Squircle
          cornerRadius={20}
          className="bg-white p-6 cursor-pointer hover:bg-gray-50 before:bg-white"
        >
          <button
            onClick={() => {
              setReviewMode(true);
              setCurrentIndex(0);
              setFlipped(false);
            }}
            className="w-full flex items-center"
          >
            <div className="bg-brand-light-blue p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-brand-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">
                Start Review Session
              </h3>
              <p className="text-sm text-gray-600">Review 2 cards due today</p>
            </div>
          </button>
        </Squircle>

        <Squircle
          cornerRadius={20}
          className="bg-white p-6 cursor-pointer hover:bg-gray-50 before:bg-white"
        >
          <button className="w-full flex items-center">
            <div className="bg-brand-light-green p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-brand-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Browse All Cards</h3>
              <p className="text-sm text-gray-600">
                Review all {words.length} flashcards
              </p>
            </div>
          </button>
        </Squircle>
      </div>

      {/* Recent Cards */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Cards</h3>
        <div className="space-y-4">
          {words.slice(0, 3).map((word) => (
            <div key={word.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{word.german}</h4>
                  <p className="text-gray-600">{word.english}</p>
                </div>
                <div>
                  {word.status === "learning" && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      learning
                    </span>
                  )}
                  {word.status === "familiar" && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      familiar
                    </span>
                  )}
                  {word.status === "mastered" && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      mastered
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardsTab;
