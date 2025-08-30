'use client';
import React, { useState } from 'react';
import ContentDetailModal from '@/components/Discover/ContentDetailModal';
import TodaysPick from '@/components/Shared/TodaysPick';
import BrowseSearchToggle from '@/components/Discover/BrowseSearchToggle';
import { useLanguagePreference } from '@/contexts/LanguagePreferenceContext';

const DiscoverPage = () => {
  // Use language preference context
  const {
    userLanguage,
    languageMapping,
    isLoading: languageLoading,
    error: languageError
  } = useLanguagePreference();

  // State for content filtering and modal
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [selectedContent, setSelectedContent] = useState<{
    content: any;
    type: 'movie' | 'tv';
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const handleContentClick = (content: any, type: 'movie' | 'tv') => {
    setSelectedContent({ content, type });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };



  // Show loading while fetching user language
  if (languageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized content...</p>
        </div>
      </div>
    );
  }

  // Show error if language loading failed
  if (languageError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-yellow-700 mb-2">
              Language Preference Issue
            </h3>
            <p className="text-yellow-600 mb-4">{languageError}</p>
            <p className="text-sm text-yellow-500">
              Using German as default. Content will still be available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Today's Pick Section */}
      <TodaysPick onContentClick={handleContentClick} />

      {/* Content Type Filter Buttons and Search */}
      <div className="mt-8 mb-6">
        <div className="flex justify-between items-center">
          {/* Filter Buttons - Left Side */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-6 py-3 rounded-full transition-colors font-medium ${selectedFilter === 'all'
                ? 'bg-brand-accent text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All Content
            </button>
            <button
              onClick={() => setSelectedFilter('movies')}
              className={`px-6 py-3 rounded-full transition-colors font-medium ${selectedFilter === 'movies'
                ? 'bg-brand-accent text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSelectedFilter('tv')}
              className={`px-6 py-3 rounded-full transition-colors font-medium ${selectedFilter === 'tv'
                ? 'bg-brand-accent text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              TV Shows
            </button>
          </div>

          {/* Search Button - Right Side */}
          <button
            onClick={() => setIsSearchMode(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 rounded-full transition-colors text-white font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Browse/Search Toggle Component */}
      <BrowseSearchToggle
        language={languageMapping.code}
        originalLanguage={languageMapping.originalCode}
        contentType={selectedFilter === 'movies' ? 'movie' : selectedFilter === 'tv' ? 'tv' : 'all'}
        onContentClick={handleContentClick}
        className="mt-8"
        isSearchMode={isSearchMode}
        onToggleSearch={() => setIsSearchMode(false)}
      />

      {/* Content Detail Modal */}
      <ContentDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        content={selectedContent ? {
          ...selectedContent.content,
          type: selectedContent.type
        } : null}
      />
    </div>
  );
};

export default DiscoverPage;