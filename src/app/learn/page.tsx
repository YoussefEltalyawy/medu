'use client';

import React, { useState } from 'react';
import { Squircle } from 'corner-smoothing';
import VocabularyTab from '@/components/Learn/VocabularyTab';
import FlashcardsTab from '@/components/Learn/FlashcardsTab';

const LearnPage = () => {
  const [activeTab, setActiveTab] = useState<'Flashcards' | 'Vocabulary' | 'Journal'>('Vocabulary');

  return (
    <main className="min-h-screen py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#082408]">Learn</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('Flashcards')}
            className={`px-4 py-2 rounded-full ${activeTab === 'Flashcards' ? 'bg-[#082408] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('Vocabulary')}
            className={`px-4 py-2 rounded-full ${activeTab === 'Vocabulary' ? 'bg-[#082408] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Vocabulary
          </button>
          <button
            onClick={() => setActiveTab('Journal')}
            className={`px-4 py-2 rounded-full ${activeTab === 'Journal' ? 'bg-[#082408] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Journal
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'Flashcards' && <FlashcardsTab />}
          {activeTab === 'Vocabulary' && <VocabularyTab />}
          {activeTab === 'Journal' && (
            <div className="text-center py-12">
              <h2 className="text-xl text-gray-500">Journal feature coming soon</h2>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default LearnPage;