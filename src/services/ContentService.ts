import { 
  ContentResponse, 
  DiscoverParams, 
  SearchParams, 
  TMDBDiscoverResponse, 
  TMDBSearchResponse,
  LanguageMapping 
} from '@/types/content';
import { getLanguageMapping, getPrioritizedLanguageMapping } from '@/utils/languageMapping';
import { 
  transformDiscoverResponse, 
  transformSearchResponse, 
  mergeContentResponses 
} from '@/utils/contentTransformers';
import { 
  withRetry, 
  AppError, 
  ERROR_CODES, 
  DEFAULT_RETRY_CONFIG,
  getUserFriendlyMessage,
  reportError
} from '@/utils/errorHandling';

export class ContentService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB API key is not defined in environment variables');
    }
    this.apiKey = apiKey;
  }

  /**
   * Get language mapping for TMDB API parameters
   * @param language - User's target language
   * @returns LanguageMapping object
   */
  getLanguageMapping(language: string): LanguageMapping {
    return getLanguageMapping(language);
  }

  /**
   * Get prioritized language mapping with fallback logic
   * @param userLanguage - User's preferred language
   * @param fallbackLanguage - Fallback language if user language not supported
   * @returns LanguageMapping object with API codes
   */
  getPrioritizedLanguageMapping(userLanguage: string, fallbackLanguage: string = 'German'): LanguageMapping {
    return getPrioritizedLanguageMapping(userLanguage, fallbackLanguage);
  }

  /**
   * Discover content (movies and/or TV shows) based on parameters
   * @param params - Discover parameters
   * @returns Promise<ContentResponse>
   */
  async discoverContent(params: DiscoverParams): Promise<ContentResponse> {
    const { language, originalLanguage, page, contentType = 'all' } = params;

    return withRetry(async () => {
      try {
        const promises: Promise<ContentResponse>[] = [];

        // Fetch movies if requested
        if (contentType === 'all' || contentType === 'movie') {
          const moviePromise = this.discoverMovies(language, originalLanguage, page);
          promises.push(moviePromise);
        }

        // Fetch TV shows if requested
        if (contentType === 'all' || contentType === 'tv') {
          const tvPromise = this.discoverTVShows(language, originalLanguage, page);
          promises.push(tvPromise);
        }

        const responses = await Promise.all(promises);

        // Merge responses if fetching both content types
        if (contentType === 'all' && responses.length > 1) {
          return mergeContentResponses(responses);
        }

        return responses[0];
      } catch (error) {
        const appError = new AppError(
          'Failed to discover content',
          ERROR_CODES.CONTENT_LOAD_ERROR,
          { params, originalError: error },
          'ContentService.discoverContent'
        );
        reportError(appError);
        throw appError;
      }
    }, DEFAULT_RETRY_CONFIG, 'discoverContent');
  }

  /**
   * Search for content (movies and/or TV shows) based on query
   * @param params - Search parameters
   * @returns Promise<ContentResponse>
   */
  async searchContent(params: SearchParams): Promise<ContentResponse> {
    const { query, language, page, contentType = 'all' } = params;

    if (!query.trim()) {
      return {
        results: [],
        totalPages: 0,
        totalResults: 0,
        page: 1
      };
    }

    return withRetry(async () => {
      try {
        let searchUrl: string;

        if (contentType === 'all') {
          // Use multi-search for both movies and TV shows
          searchUrl = `${this.baseUrl}/search/multi?api_key=${this.apiKey}&language=${language}&query=${encodeURIComponent(query)}&page=${page}`;
        } else {
          // Use specific search endpoint
          const endpoint = contentType === 'movie' ? 'movie' : 'tv';
          searchUrl = `${this.baseUrl}/search/${endpoint}?api_key=${this.apiKey}&language=${language}&query=${encodeURIComponent(query)}&page=${page}`;
        }

        const response = await fetch(searchUrl);

        if (!response.ok) {
          if (response.status === 429) {
            throw new AppError(
              'Rate limit exceeded',
              ERROR_CODES.API_RATE_LIMIT,
              { status: response.status, params },
              'ContentService.searchContent'
            );
          }
          if (response.status === 401) {
            throw new AppError(
              'API authentication failed',
              ERROR_CODES.API_UNAUTHORIZED,
              { status: response.status, params },
              'ContentService.searchContent'
            );
          }
          throw new AppError(
            `Search request failed with status: ${response.status}`,
            ERROR_CODES.API_ERROR,
            { status: response.status, params },
            'ContentService.searchContent'
          );
        }

        const data: TMDBSearchResponse = await response.json();
        return transformSearchResponse(data);
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        const appError = new AppError(
          'Failed to search content',
          ERROR_CODES.SEARCH_ERROR,
          { params, originalError: error },
          'ContentService.searchContent'
        );
        reportError(appError);
        throw appError;
      }
    }, DEFAULT_RETRY_CONFIG, 'searchContent');
  }

  /**
   * Discover movies in the specified language
   * @param language - Language code for API
   * @param originalLanguage - Original language code
   * @param page - Page number
   * @returns Promise<ContentResponse>
   */
  private async discoverMovies(
    language: string, 
    originalLanguage: string, 
    page: number
  ): Promise<ContentResponse> {
    const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${language}&with_original_language=${originalLanguage}&sort_by=popularity.desc&page=${page}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new AppError(
          'Rate limit exceeded for movie discovery',
          ERROR_CODES.API_RATE_LIMIT,
          { status: response.status, language, originalLanguage, page },
          'ContentService.discoverMovies'
        );
      }
      throw new AppError(
        `Movie discovery request failed with status: ${response.status}`,
        ERROR_CODES.API_ERROR,
        { status: response.status, language, originalLanguage, page },
        'ContentService.discoverMovies'
      );
    }

    const data: TMDBDiscoverResponse = await response.json();
    return transformDiscoverResponse(data, 'movie');
  }

  /**
   * Discover TV shows in the specified language
   * @param language - Language code for API
   * @param originalLanguage - Original language code
   * @param page - Page number
   * @returns Promise<ContentResponse>
   */
  private async discoverTVShows(
    language: string, 
    originalLanguage: string, 
    page: number
  ): Promise<ContentResponse> {
    const url = `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&language=${language}&with_original_language=${originalLanguage}&sort_by=popularity.desc&page=${page}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new AppError(
          'Rate limit exceeded for TV show discovery',
          ERROR_CODES.API_RATE_LIMIT,
          { status: response.status, language, originalLanguage, page },
          'ContentService.discoverTVShows'
        );
      }
      throw new AppError(
        `TV show discovery request failed with status: ${response.status}`,
        ERROR_CODES.API_ERROR,
        { status: response.status, language, originalLanguage, page },
        'ContentService.discoverTVShows'
      );
    }

    const data: TMDBDiscoverResponse = await response.json();
    return transformDiscoverResponse(data, 'tv');
  }

  /**
   * Get content details by ID and type
   * @param id - Content ID
   * @param type - Content type ('movie' or 'tv')
   * @param language - Language code
   * @returns Promise with detailed content information
   */
  async getContentDetails(id: number, type: 'movie' | 'tv', language: string): Promise<any> {
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const url = `${this.baseUrl}/${endpoint}/${id}?api_key=${this.apiKey}&language=${language}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Content details request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching content details:', error);
      throw new Error('Failed to fetch content details. Please try again.');
    }
  }

  /**
   * Get trending content for today
   * @param language - Language code
   * @param contentType - Type of content to fetch
   * @returns Promise<ContentResponse>
   */
  async getTrendingContent(
    language: string, 
    contentType: 'movie' | 'tv' | 'all' = 'all'
  ): Promise<ContentResponse> {
    try {
      const endpoint = contentType === 'all' ? 'all' : contentType;
      const url = `${this.baseUrl}/trending/${endpoint}/day?api_key=${this.apiKey}&language=${language}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Trending content request failed with status: ${response.status}`);
      }

      const data: TMDBSearchResponse = await response.json();
      return transformSearchResponse(data);
    } catch (error) {
      console.error('Error fetching trending content:', error);
      throw new Error('Failed to fetch trending content. Please try again.');
    }
  }
}

// Export a singleton instance
export const contentService = new ContentService();