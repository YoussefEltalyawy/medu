import { useState, useEffect, useCallback, useRef } from 'react';
import { ContentResponse, ContentItem, SearchParams } from '@/types/content';
import { contentService } from '@/services/ContentService';

interface SearchFilters {
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface UseAdvancedSearchOptions {
  language: string;
  debounceMs?: number;
  minQueryLength?: number;
  enabled?: boolean;
  contentType?: 'movie' | 'tv' | 'all';
  initialFilters?: SearchFilters;
}

interface UseAdvancedSearchReturn {
  // Search state
  query: string;
  results: ContentItem[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  filters: SearchFilters;
  
  // Loading states
  isSearching: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearSearch: () => void;
  clearFilters: () => void;
  loadMoreResults: () => Promise<void>;
  retry: () => Promise<void>;
  
  // State flags
  hasSearched: boolean;
  isEmptyQuery: boolean;
  hasActiveFilters: boolean;
  
  // Search suggestions
  suggestions: string[];
  isLoadingSuggestions: boolean;
}

export function useAdvancedSearch({
  language,
  debounceMs = 300,
  minQueryLength = 2,
  enabled = true,
  contentType = 'all',
  initialFilters = {}
}: UseAdvancedSearchOptions): UseAdvancedSearchReturn {
  // Core state
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters);
  
  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State flags
  const [hasSearched, setHasSearched] = useState(false);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController>();

  // Computed values
  const hasNextPage = currentPage < totalPages;
  const isEmptyQuery = query.trim().length === 0;
  const shouldSearch = debouncedQuery.trim().length >= minQueryLength;
  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  // Debounce query input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  // Load search suggestions
  useEffect(() => {
    if (!enabled || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        // Generate suggestions based on query
        const searchSuggestions = await generateSearchSuggestions(query, contentType);
        setSuggestions(searchSuggestions);
      } catch (err) {
        console.error('Error loading suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 150); // Faster debounce for suggestions

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [query, contentType, enabled]);

  // Perform search when debounced query or filters change
  useEffect(() => {
    if (!enabled) return;

    const performSearch = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear results if query is too short and no filters
      if (!shouldSearch && !hasActiveFilters) {
        setResults([]);
        setTotalResults(0);
        setTotalPages(0);
        setCurrentPage(1);
        setError(null);
        setIsSearching(false);
        return;
      }

      // Prevent concurrent searches
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setIsSearching(true);
      setError(null);
      setHasSearched(true);

      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        const searchParams: SearchParams = {
          query: debouncedQuery,
          language,
          page: 1,
          contentType
        };

        const response = await performAdvancedSearch(searchParams, filters);

        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        setResults(response.results);
        setTotalResults(response.totalResults);
        setTotalPages(response.totalPages);
        setCurrentPage(1);
      } catch (err) {
        // Don't set error if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        console.error('Advanced search error:', err);
      } finally {
        setIsSearching(false);
        isLoadingRef.current = false;
      }
    };

    performSearch();
  }, [debouncedQuery, filters, language, contentType, enabled, shouldSearch, hasActiveFilters]);

  // Set query with immediate state update
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    // Clear results immediately if query becomes empty and no filters
    if (newQuery.trim().length === 0 && !hasActiveFilters) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      setCurrentPage(1);
      setError(null);
      setHasSearched(false);
    }
  }, [hasActiveFilters]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  // Clear search completely
  const clearSearch = useCallback(() => {
    // Cancel any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setQueryState('');
    setDebouncedQuery('');
    setResults([]);
    setTotalResults(0);
    setTotalPages(0);
    setCurrentPage(1);
    setError(null);
    setIsSearching(false);
    setIsLoadingMore(false);
    setHasSearched(false);
    setSuggestions([]);
    isLoadingRef.current = false;
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Load more search results (pagination)
  const loadMoreResults = useCallback(async (): Promise<void> => {
    if ((!shouldSearch && !hasActiveFilters) || !hasNextPage || isLoadingRef.current || !enabled) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const searchParams: SearchParams = {
        query: debouncedQuery,
        language,
        page: currentPage + 1,
        contentType
      };

      const response = await performAdvancedSearch(searchParams, filters);

      setResults(prevResults => [...prevResults, ...response.results]);
      setCurrentPage(currentPage + 1);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more results';
      setError(errorMessage);
      console.error('Load more advanced search results error:', err);
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [debouncedQuery, language, contentType, currentPage, hasNextPage, shouldSearch, hasActiveFilters, enabled, filters]);

  // Retry failed search
  const retry = useCallback(async (): Promise<void> => {
    if ((!shouldSearch && !hasActiveFilters) || isLoadingRef.current) {
      return;
    }

    setError(null);
    
    if (results.length === 0) {
      // Retry initial search by triggering debounced query update
      setDebouncedQuery('');
      setTimeout(() => setDebouncedQuery(query), 0);
    } else {
      // Retry loading more results
      await loadMoreResults();
    }
  }, [shouldSearch, hasActiveFilters, results.length, query, loadMoreResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Search state
    query,
    results,
    totalResults,
    totalPages,
    currentPage,
    filters,
    
    // Loading states
    isSearching,
    isLoadingMore,
    hasNextPage,
    
    // Error handling
    error,
    
    // Actions
    setQuery,
    setFilters,
    clearSearch,
    clearFilters,
    loadMoreResults,
    retry,
    
    // State flags
    hasSearched,
    isEmptyQuery,
    hasActiveFilters,
    
    // Search suggestions
    suggestions,
    isLoadingSuggestions
  };
}

// Helper function to perform advanced search with filters
async function performAdvancedSearch(
  searchParams: SearchParams, 
  filters: SearchFilters
): Promise<ContentResponse> {
  // For now, use the basic search and apply client-side filtering
  // In a real implementation, you'd pass filters to the API
  const response = await contentService.searchContent(searchParams);
  
  // Apply client-side filters
  let filteredResults = response.results;
  
  if (filters.minRating) {
    filteredResults = filteredResults.filter(item => 
      (item.vote_average || 0) >= filters.minRating!
    );
  }
  
  if (filters.maxRating) {
    filteredResults = filteredResults.filter(item => 
      (item.vote_average || 0) <= filters.maxRating!
    );
  }
  
  if (filters.yearFrom || filters.yearTo) {
    filteredResults = filteredResults.filter(item => {
      const year = item.type === 'movie' 
        ? new Date(item.release_date || '').getFullYear()
        : new Date(item.first_air_date || '').getFullYear();
      
      if (filters.yearFrom && year < filters.yearFrom) return false;
      if (filters.yearTo && year > filters.yearTo) return false;
      return true;
    });
  }
  
  // Apply sorting
  if (filters.sortBy) {
    filteredResults.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'rating':
          aValue = a.vote_average || 0;
          bValue = b.vote_average || 0;
          break;
        case 'release_date':
          aValue = new Date(a.release_date || a.first_air_date || '').getTime();
          bValue = new Date(b.release_date || b.first_air_date || '').getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default: // popularity
          aValue = (a.vote_average || 0) * (a.vote_count || 0);
          bValue = (b.vote_average || 0) * (b.vote_count || 0);
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }
  
  return {
    ...response,
    results: filteredResults,
    totalResults: filteredResults.length
  };
}

// Helper function to generate search suggestions
async function generateSearchSuggestions(
  query: string, 
  contentType: 'movie' | 'tv' | 'all'
): Promise<string[]> {
  // This is a simplified implementation
  // In a real app, you might use a dedicated suggestions API
  const suggestions: string[] = [];
  
  // Add some common search suggestions based on query
  const commonSuggestions = [
    'action movies',
    'comedy series',
    'drama films',
    'thriller movies',
    'sci-fi shows',
    'romantic comedies',
    'horror films',
    'documentary series'
  ];
  
  const queryLower = query.toLowerCase();
  const matchingSuggestions = commonSuggestions.filter(suggestion =>
    suggestion.includes(queryLower) || queryLower.includes(suggestion.split(' ')[0])
  );
  
  suggestions.push(...matchingSuggestions.slice(0, 5));
  
  // Add the original query if it's not already included
  if (!suggestions.includes(query)) {
    suggestions.unshift(query);
  }
  
  return suggestions.slice(0, 6);
}