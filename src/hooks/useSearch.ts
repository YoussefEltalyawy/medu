import { useState, useEffect, useCallback, useRef } from 'react';
import { ContentResponse, ContentItem, SearchParams } from '@/types/content';
import { contentService } from '@/services/ContentService';

interface UseSearchOptions {
  language: string;
  debounceMs?: number;
  minQueryLength?: number;
  enabled?: boolean;
  contentType?: 'movie' | 'tv' | 'all';
}

interface UseSearchReturn {
  // Search state
  query: string;
  results: ContentItem[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  
  // Loading states
  isSearching: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  setQuery: (query: string) => void;
  clearSearch: () => void;
  loadMoreResults: () => Promise<void>;
  retry: () => Promise<void>;
  
  // State flags
  hasSearched: boolean;
  isEmptyQuery: boolean;
}

export function useSearch({
  language,
  debounceMs = 300,
  minQueryLength = 2,
  enabled = true,
  contentType = 'all'
}: UseSearchOptions): UseSearchReturn {
  // Core state
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Loading states
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State flags
  const [hasSearched, setHasSearched] = useState(false);
  
  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController>();

  // Computed values
  const hasNextPage = currentPage < totalPages;
  const isEmptyQuery = query.trim().length === 0;
  const shouldSearch = debouncedQuery.trim().length >= minQueryLength;

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

  // Perform search when debounced query changes
  useEffect(() => {
    if (!enabled) return;

    const performSearch = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear results if query is too short
      if (!shouldSearch) {
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

        const response = await contentService.searchContent(searchParams);

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
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
        isLoadingRef.current = false;
      }
    };

    performSearch();
  }, [debouncedQuery, language, contentType, enabled, shouldSearch]);

  // Set query with immediate state update
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    // Clear results immediately if query becomes empty
    if (newQuery.trim().length === 0) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      setCurrentPage(1);
      setError(null);
      setHasSearched(false);
    }
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
    isLoadingRef.current = false;
  }, []);

  // Load more search results (pagination)
  const loadMoreResults = useCallback(async (): Promise<void> => {
    if (!shouldSearch || !hasNextPage || isLoadingRef.current || !enabled) {
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

      const response = await contentService.searchContent(searchParams);

      setResults(prevResults => [...prevResults, ...response.results]);
      setCurrentPage(currentPage + 1);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more results';
      setError(errorMessage);
      console.error('Load more search results error:', err);
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [debouncedQuery, language, contentType, currentPage, hasNextPage, shouldSearch, enabled]);

  // Retry failed search
  const retry = useCallback(async (): Promise<void> => {
    if (!shouldSearch || isLoadingRef.current) {
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
  }, [shouldSearch, results.length, query, loadMoreResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
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
    
    // Loading states
    isSearching,
    isLoadingMore,
    hasNextPage,
    
    // Error handling
    error,
    
    // Actions
    setQuery,
    clearSearch,
    loadMoreResults,
    retry,
    
    // State flags
    hasSearched,
    isEmptyQuery
  };
}