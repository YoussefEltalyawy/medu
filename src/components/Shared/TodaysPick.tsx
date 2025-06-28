'use client';
import React, { useEffect, useState } from 'react';
import { Squircle } from 'corner-smoothing';
import { createClient } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { useWatchedContent } from '@/contexts/WatchedContentContext';

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

interface TodaysPickProps {
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
}

const TodaysPick: React.FC<TodaysPickProps> = ({ onContentClick }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShow, setTvShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLanguage, setUserLanguage] = useState<string>('de'); // Default to German

  const { isContentWatched } = useWatchedContent();

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
    const fetchMoviesAndTVShow = async () => {
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

        // Get 2 random movies and 1 random TV show
        const randomMovies = getRandomItems(moviesData.results, 2);
        const randomTvShow = getRandomItems(tvData.results, 1)[0];

        setMovies(randomMovies as Movie[]);
        setTvShow(randomTvShow as TVShow);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesAndTVShow();
  }, [userLanguage]);

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

  // Function to render a media card (movie or TV show)
  const renderMediaCard = (item: Movie | TVShow, type: 'movie' | 'tv') => {
    if (!item) return null;

    const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
    const backdropPath = item.backdrop_path;
    const posterPath = item.poster_path;
    const isWatched = isContentWatched(item.id, type);

    const handleClick = () => {
      if (onContentClick) {
        onContentClick(item, type);
      }
    };

    return (
      <Squircle
        key={item.id}
        borderWidth={2}
        cornerRadius={25}
        className="relative overflow-hidden h-[200px] before:bg-black cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        onClick={handleClick}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={`${IMAGE_BASE_URL}${backdropPath || posterPath}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 p-4">
          {/* Title at bottom-left */}
          <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">
            {title}
          </h3>

          {/* Type at bottom-right */}
          <div className="absolute bottom-4 right-4 text-xs text-white bg-[#082408] px-3 py-1 rounded-full">
            {type === 'movie' ? 'Movie' : 'TV Show'}
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
        <h4 className="ml-2 text-black/40 mb-4">Today's Pick</h4>
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
        <h4 className="ml-2 text-black/40 mb-4">Today's Pick</h4>
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
      <h4 className="ml-2 text-black/40 mb-4">Today's Pick</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {movies.map((movie) => renderMediaCard(movie, 'movie'))}
        {tvShow && renderMediaCard(tvShow, 'tv')}
      </div>
    </div>
  );
};

export default TodaysPick;