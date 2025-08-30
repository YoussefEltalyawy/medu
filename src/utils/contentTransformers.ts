import { 
  Movie, 
  TVShow, 
  ContentItem, 
  SearchResult, 
  TMDBDiscoverResponse, 
  TMDBSearchResponse, 
  ContentResponse 
} from '@/types/content';

/**
 * Transform a Movie object to a unified ContentItem
 * @param movie - Movie object from TMDB API
 * @returns ContentItem with movie data
 */
export function transformMovieToContentItem(movie: Movie): ContentItem {
  return {
    id: movie.id,
    title: movie.title,
    type: 'movie',
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    release_date: movie.release_date,
    runtime: movie.runtime,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    original_language: movie.original_language,
    spoken_languages: movie.spoken_languages
  };
}

/**
 * Transform a TVShow object to a unified ContentItem
 * @param tvShow - TVShow object from TMDB API
 * @returns ContentItem with TV show data
 */
export function transformTVShowToContentItem(tvShow: TVShow): ContentItem {
  return {
    id: tvShow.id,
    title: tvShow.name,
    name: tvShow.name,
    type: 'tv',
    poster_path: tvShow.poster_path,
    backdrop_path: tvShow.backdrop_path,
    overview: tvShow.overview,
    first_air_date: tvShow.first_air_date,
    episode_run_time: tvShow.episode_run_time,
    vote_average: tvShow.vote_average,
    vote_count: tvShow.vote_count,
    original_language: tvShow.original_language,
    spoken_languages: tvShow.spoken_languages
  };
}

/**
 * Transform a SearchResult object to a unified ContentItem
 * @param searchResult - SearchResult object from TMDB search API
 * @returns ContentItem with search result data
 */
export function transformSearchResultToContentItem(searchResult: SearchResult): ContentItem {
  const isMovie = searchResult.media_type === 'movie';
  
  return {
    id: searchResult.id,
    title: isMovie ? (searchResult.title || '') : (searchResult.name || ''),
    name: !isMovie ? searchResult.name : undefined,
    type: searchResult.media_type,
    poster_path: searchResult.poster_path,
    backdrop_path: searchResult.backdrop_path,
    overview: searchResult.overview,
    release_date: isMovie ? searchResult.release_date : undefined,
    first_air_date: !isMovie ? searchResult.first_air_date : undefined,
    vote_average: searchResult.vote_average,
    vote_count: searchResult.vote_count,
    original_language: searchResult.original_language
  };
}

/**
 * Transform TMDB discover response to unified ContentResponse
 * @param response - TMDB discover API response
 * @param contentType - Type of content being transformed
 * @returns ContentResponse with unified content items
 */
export function transformDiscoverResponse(
  response: TMDBDiscoverResponse, 
  contentType: 'movie' | 'tv'
): ContentResponse {
  const results = response.results.map(item => {
    if (contentType === 'movie') {
      return transformMovieToContentItem(item as Movie);
    } else {
      return transformTVShowToContentItem(item as TVShow);
    }
  });

  return {
    results,
    totalPages: response.total_pages,
    totalResults: response.total_results,
    page: response.page
  };
}

/**
 * Transform TMDB search response to unified ContentResponse
 * @param response - TMDB search API response
 * @returns ContentResponse with unified content items
 */
export function transformSearchResponse(response: TMDBSearchResponse): ContentResponse {
  // Filter out person results and only keep movie/tv results
  const filteredResults = response.results.filter(
    result => result.media_type === 'movie' || result.media_type === 'tv'
  );

  const results = filteredResults.map(transformSearchResultToContentItem);

  return {
    results,
    totalPages: response.total_pages,
    totalResults: response.total_results,
    page: response.page
  };
}

/**
 * Merge multiple ContentResponse objects (useful for combining movie and TV results)
 * @param responses - Array of ContentResponse objects to merge
 * @returns Single ContentResponse with merged results
 */
export function mergeContentResponses(responses: ContentResponse[]): ContentResponse {
  if (responses.length === 0) {
    return {
      results: [],
      totalPages: 0,
      totalResults: 0,
      page: 1
    };
  }

  if (responses.length === 1) {
    return responses[0];
  }

  const mergedResults = responses.flatMap(response => response.results);
  const totalResults = responses.reduce((sum, response) => sum + response.totalResults, 0);
  const maxPages = Math.max(...responses.map(response => response.totalPages));

  return {
    results: mergedResults,
    totalPages: maxPages,
    totalResults,
    page: responses[0].page // Assume all responses are for the same page
  };
}

/**
 * Sort content items by popularity (vote_average * vote_count)
 * @param items - Array of ContentItem objects
 * @returns Sorted array of ContentItem objects
 */
export function sortContentByPopularity(items: ContentItem[]): ContentItem[] {
  return items.sort((a, b) => {
    const popularityA = (a.vote_average || 0) * (a.vote_count || 0);
    const popularityB = (b.vote_average || 0) * (b.vote_count || 0);
    return popularityB - popularityA;
  });
}

/**
 * Filter content items by minimum rating
 * @param items - Array of ContentItem objects
 * @param minRating - Minimum vote average required
 * @returns Filtered array of ContentItem objects
 */
export function filterContentByRating(items: ContentItem[], minRating: number): ContentItem[] {
  return items.filter(item => (item.vote_average || 0) >= minRating);
}