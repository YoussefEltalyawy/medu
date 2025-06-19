"use client";
import React, { useEffect, useState } from "react";
import { Squircle } from "corner-smoothing";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
}

const ForYouRecommendations: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShow, setTvShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TMDB API configuration from environment variables
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  // Language preference - can be changed to any valid TMDB language code
  // Examples: 'en-US' (English), 'de-DE' (German), 'fr-FR' (French), 'es-ES' (Spanish)
  const LANGUAGE_PREFERENCE = "de-DE"; // German content
  const LANGUAGE_PREFERENCE_OG = "de"; // German content

  // Check if API key is available
  if (!TMDB_API_KEY) {
    console.error("TMDB API key is not defined in environment variables");
  }

  useEffect(() => {
    const fetchMoviesAndTVShow = async () => {
      try {
        setLoading(true);

        // Fetch German movies (with original language as German)
        const moviesResponse = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=${LANGUAGE_PREFERENCE}&with_original_language=${LANGUAGE_PREFERENCE_OG}&sort_by=popularity.desc&page=1`
        );

        if (!moviesResponse.ok) {
          throw new Error("Failed to fetch movies");
        }

        const moviesData = await moviesResponse.json();

        // Fetch German TV shows (with original language as German)
        const tvResponse = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=${LANGUAGE_PREFERENCE}&with_original_language=${LANGUAGE_PREFERENCE}&with_original_language=${LANGUAGE_PREFERENCE_OG}&sort_by=popularity.desc&page=1`
        );

        if (!tvResponse.ok) {
          throw new Error("Failed to fetch TV shows");
        }

        const tvData = await tvResponse.json();

        // Get 2 random movies and 1 random TV show
        const randomMovies = getRandomItems(moviesData.results, 2);
        const randomTvShow = getRandomItems(tvData.results, 1)[0];

        setMovies(randomMovies as Movie[]);
        setTvShow(randomTvShow as TVShow);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesAndTVShow();
  }, []);

  // Helper function to get random items from an array
  const getRandomItems = <T,>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Function to render a media card (movie or TV show)
  const renderMediaCard = (item: Movie | TVShow, type: "movie" | "tv") => {
    const title =
      type === "movie" ? (item as Movie).title : (item as TVShow).name;
    const backdropPath = item.backdrop_path;
    const posterPath = item.poster_path;
    const overview = item.overview;

    return (
      <Squircle
        key={item.id}
        borderWidth={2}
        cornerRadius={25}
        className="relative overflow-hidden h-[200px] before:bg-black"
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
            {type === "movie" ? "Movie" : "TV Show"}
          </div>
        </div>
      </Squircle>
    );
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h4 className="ml-2 text-black/40 mb-4">For You (German Content)</h4>
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
        <h4 className="ml-2 text-black/40 mb-4">For You (German Content)</h4>
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
      <h4 className="ml-2 text-black/40 mb-4">For You</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {movies.map((movie) => renderMediaCard(movie, "movie"))}
        {tvShow && renderMediaCard(tvShow, "tv")}
      </div>
    </div>
  );
};

export default ForYouRecommendations;