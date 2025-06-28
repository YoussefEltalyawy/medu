'use client';
import React, { useState, useEffect } from 'react';
import { Squircle } from 'corner-smoothing';
import ContentCard from '@/components/Discover/ContentCard';
import ContentDetailModal from '@/components/Discover/ContentDetailModal';
import TodaysPick from '@/components/Shared/TodaysPick';
import { Search, Filter } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date?: string;
  episode_run_time?: number[];
  vote_average?: number;
  vote_count?: number;
}

interface UserProfile {
  id: string;
  target_language: string;
}

const DiscoverPage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState<string>('German'); // Default to German
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [selectedContent, setSelectedContent] = useState<{
    content: any;
    type: 'movie' | 'tv';
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TMDB API configuration from environment variables
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Check if API key is available
  if (!TMDB_API_KEY) {
    console.error('TMDB API key is not defined in environment variables');
  }

  // Language mapping for TMDB API
  const languageMapping: Record<string, { code: string, originalCode: string }> = {
    'German': { code: 'de-DE', originalCode: 'de' },
    'French': { code: 'fr-FR', originalCode: 'fr' },
    'Spanish': { code: 'es-ES', originalCode: 'es' },
    'English': { code: 'en-US', originalCode: 'en' },
  };

  useEffect(() => {
    // Fetch user's target language from Supabase
    const fetchUserLanguage = async () => {
      try {
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Get user profile with target language
          const { data, error } = await supabase
            .from('users')
            .select('target_language')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
          } else if (data) {
            // Set the user's target language
            setUserLanguage(data.target_language || 'German'); // Default to German if not set
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserLanguage();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        // Get language codes based on user's target language
        const languageCode = languageMapping[userLanguage]?.code || 'de-DE';
        const originalLanguageCode = languageMapping[userLanguage]?.originalCode || 'de';

        // Fetch movies in user's target language
        const moviesResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=${languageCode}&with_original_language=${originalLanguageCode}&sort_by=popularity.desc&page=1`
        );

        if (!moviesResponse.ok) {
          throw new Error('Failed to fetch movies');
        }

        const moviesData = await moviesResponse.json();

        // Fetch TV shows in user's target language
        const tvResponse = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=${languageCode}&with_original_language=${originalLanguageCode}&sort_by=popularity.desc&page=1`
        );

        if (!tvResponse.ok) {
          throw new Error('Failed to fetch TV shows');
        }

        const tvData = await tvResponse.json();

        setMovies(moviesData.results || []);
        setTvShows(tvData.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [userLanguage]);

  // Filter content based on search query and selected filter
  const filteredContent = () => {
    let allContent: Array<{ content: Movie | TVShow; type: 'movie' | 'tv' }> = [];

    if (selectedFilter === 'all' || selectedFilter === 'movies') {
      allContent.push(...movies.map(movie => ({ content: movie, type: 'movie' as const })));
    }

    if (selectedFilter === 'all' || selectedFilter === 'tv') {
      allContent.push(...tvShows.map(show => ({ content: show, type: 'tv' as const })));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allContent = allContent.filter(({ content }) => {
        const title = 'title' in content ? content.title : content.name;
        return title.toLowerCase().includes(query);
      });
    }

    return allContent;
  };

  const handleContentClick = (content: any, type: 'movie' | 'tv') => {
    setSelectedContent({ content, type });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
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
      <div className="container mx-auto px-4 py-8">
        <Squircle
          borderWidth={2}
          cornerRadius={25}
          className="p-8 bg-red-50 text-red-500 text-center before:bg-red-100"
        >
          <p className="text-lg font-semibold mb-2">Error Loading Content</p>
          <p>{error}</p>
        </Squircle>
      </div>
    );
  }

  const contentToShow = filteredContent();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Today's Pick Section */}
      <TodaysPick onContentClick={handleContentClick} />

      {/* Search and Filter Section */}
      <div className="mt-8 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#082408] focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-3 rounded-full transition-colors ${selectedFilter === 'all'
                ? 'bg-[#082408] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('movies')}
              className={`px-4 py-3 rounded-full transition-colors ${selectedFilter === 'movies'
                ? 'bg-[#082408] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSelectedFilter('tv')}
              className={`px-4 py-3 rounded-full transition-colors ${selectedFilter === 'tv'
                ? 'bg-[#082408] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              TV Shows
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {contentToShow.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No content found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {contentToShow.map(({ content, type }) => (
            <ContentCard
              key={`${type}-${content.id}`}
              id={content.id}
              title={'title' in content ? content.title : content.name}
              imageUrl={`${IMAGE_BASE_URL}${content.backdrop_path || content.poster_path}`}
              type={type}
              content={content}
              onClick={() => handleContentClick(content, type)}
            />
          ))}
        </div>
      )}

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