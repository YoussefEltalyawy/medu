"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VocabularyTab from "@/components/Learn/VocabularyTab";
import FlashcardsTab from "@/components/Learn/FlashcardsTab";
import ProgressTab from "@/components/Learn/ProgressTab";

const LearnPage = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "Flashcards" | "Vocabulary" | "Progress"
  >("Vocabulary");

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam === 'flashcards') {
      setActiveTab("Flashcards");
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text">Learn</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("Flashcards")}
            className={`px-4 py-2 rounded-full ${activeTab === "Flashcards"
              ? "bg-brand-accent text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab("Vocabulary")}
            className={`px-4 py-2 rounded-full ${activeTab === "Vocabulary"
              ? "bg-brand-accent text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Vocabulary
          </button>
          <button
            onClick={() => setActiveTab("Progress")}
            className={`px-4 py-2 rounded-full ${activeTab === "Progress"
              ? "bg-brand-accent text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            Progress
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "Flashcards" && <FlashcardsTab />}
          {activeTab === "Vocabulary" && <VocabularyTab />}
          {activeTab === "Progress" && <ProgressTab />}
        </div>
      </div>
    </main>
  );
};

export default LearnPage;