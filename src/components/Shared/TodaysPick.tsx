'use client';
import React, { useEffect, useState } from 'react';
import { Squircle } from 'corner-smoothing';
import { Check } from 'lucide-react';
import { useWatchedContent } from '@/contexts/WatchedContentContext';
import { useLanguagePreference } from '@/contexts/LanguagePreferenceContext';
import { contentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';



interface TodaysPickProps {
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
}

const TodaysPick: React.FC<TodaysPickProps> = ({ onContentClick }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isContentWatched } = useWatchedContent();
  const { languageMapping, isLoading: languageLoading } = useLanguagePreference();

  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    const fetchTodaysContent = async () => {
      // Don't fetch if language is still loading
      if (languageLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch content using ContentService
        const response = await contentService.discoverContent({
          language: languageMapping.code,
          originalLanguage: languageMapping.originalCode,
          page: 1,
          contentType: 'all'
        });

        // Get 3 random items (2 movies, 1 TV show if possible)
        const randomContent = getRandomItems(response.results, 3);
        setContent(randomContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching today\'s content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysContent();
  }, [languageMapping, languageLoading]);

  // Helper function to get random items from an array with a date-based seed
  // This ensures recommendations stay consistent throughout the day but change daily
  const getRandomItems = <T,>(array: T[], count: number): T[] => {
    if (!array || array.length === 0) return [];

    // Create a date-based seed using the current date (without time)
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Use the date seed to create a deterministic sort
    const shuffled = [...array].sort((a, b) => {
      // Create a deterministic number between 0 and 1 based on array indices and date seed
      const indexA = array.indexOf(a);
      const indexB = array.indexOf(b);
      const seedA = (dateSeed * (indexA + 1)) % 10000 / 10000;
      const seedB = (dateSeed * (indexB + 1)) % 10000 / 10000;
      return seedA - seedB;
    });

    return shuffled.slice(0, count);
  };

  // Function to render a content card
  const renderContentCard = (item: ContentItem) => {
    if (!item) return null;

    const isWatched = isContentWatched(item.id, item.type);

    const handleClick = () => {
      if (onContentClick) {
        onContentClick(item, item.type);
      }
    };

    return (
      <Squircle
        key={`${item.type}-${item.id}`}
        borderWidth={2}
        cornerRadius={25}
        className="relative overflow-hidden h-[200px] before:bg-black cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        onClick={handleClick}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={`${IMAGE_BASE_URL}${item.backdrop_path || item.poster_path}`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 p-4">
          {/* Title at bottom-left */}
          <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">
            {item.title}
          </h3>

          {/* Type at bottom-right */}
          <div className="absolute bottom-4 right-4 text-xs text-white bg-brand-accent px-3 py-1 rounded-full">
            {item.type === 'movie' ? 'Movie' : 'TV Show'}
          </div>

          {/* Watched indicator */}
          {isWatched && (
            <div className="absolute top-4 right-4 bg-green-600 text-white p-1 rounded-full transition-all duration-200">
              <Check size={16} />
            </div>
          )}
        </div>
      </Squircle>
    );
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h4 className="ml-2 text-black/40 mb-2">Today's Pick</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Squircle
              key={i}
              borderWidth={2}
              cornerRadius={25}
              className="h-[200px] bg-gray-200 animate-pulse before:bg-gray-300"
              children={undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h4 className="ml-2 text-black/40 mb-2">Today's Pick</h4>
        <Squircle
          borderWidth={2}
          cornerRadius={25}
          className="p-4 bg-red-50 text-red-500 before:bg-red-100"
        >
          <p>Failed to load recommendations. Please try again later.</p>
        </Squircle>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h4 className="ml-2 text-black/40 mb-2">Today's Pick</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {content.map((item) => renderContentCard(item))}
      </div>
    </div>
  );
};

export default TodaysPick;