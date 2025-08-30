// Content types for TMDB API integration

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
  original_language: string;
  spoken_languages?: Language[];
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date?: string;
  episode_run_time?: number[];
  vote_average?: number;
  vote_count?: number;
  original_language: string;
  spoken_languages?: Language[];
}

export interface Language {
  iso_639_1: string;
  english_name: string;
  name: string;
}

// Unified content item for display
export interface ContentItem {
  id: number;
  title: string;
  name?: string;
  type: 'movie' | 'tv';
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  vote_average?: number;
  vote_count?: number;
  original_language: string;
  spoken_languages?: Language[];
}

// API Response types
export interface TMDBDiscoverResponse {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

export interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  original_language: string;
  vote_average?: number;
  vote_count?: number;
}

// Service interfaces
export interface ContentResponse {
  results: ContentItem[];
  totalPages: number;
  totalResults: number;
  page: number;
}

export interface DiscoverParams {
  language: string;
  originalLanguage: string;
  page: number;
  contentType?: 'movie' | 'tv' | 'all';
}

export interface SearchParams {
  query: string;
  language: string;
  page: number;
  contentType?: 'movie' | 'tv' | 'all';
}

export interface LanguageMapping {
  code: string;
  originalCode: string;
  name: string;
}