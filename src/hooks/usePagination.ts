import { useState, useEffect, useCallback, useRef } from 'react';
import { ContentResponse, ContentItem, DiscoverParams } from '@/types/content';
import { contentService } from '@/services/ContentService';

interface UsePaginationOptions {
  initialParams: DiscoverParams;
  enabled?: boolean;
  threshold?: number; // Distance from bottom to trigger load (in pixels)
}

interface UsePaginationReturn {
  // Data
  items: ContentItem[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  loadMore: () => Promise<void>;
  reset: (newParams?: Partial<DiscoverParams>) => void;
  retry: () => Promise<void>;
  
  // Intersection observer ref
  observerRef: React.RefObject<HTMLDivElement>;
}

export function usePagination({
  initialParams,
  enabled = true,
  threshold = 200
}: UsePaginationOptions): UsePaginationReturn {
  // State management
  const [items, setItems] = useState<ContentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<DiscoverParams>(initialParams);
  
  // Refs
  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);
  const paramsRef = useRef(params);

  // Update paramsRef when params changes
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // Computed values
  const hasNextPage = currentPage < totalPages;

  // Load content for a specific page
  const loadPage = useCallback(async (page: number, isInitial = false): Promise<ContentResponse | null> => {
    try {
      const pageParams = { ...paramsRef.current, page };
      const response = await contentService.discoverContent(pageParams);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error('Error loading page:', err);
      return null;
    }
  }, []); // Remove params dependency

  // Load more content (next page)
  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingRef.current || !hasNextPage || !enabled) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await loadPage(nextPage);
      
      if (response) {
        setItems(prevItems => [...prevItems, ...response.results]);
        setCurrentPage(nextPage);
        setTotalPages(response.totalPages);
        setTotalResults(response.totalResults);
      }
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, hasNextPage, enabled]); // Remove loadPage dependency

  // Reset pagination with new parameters
  const reset = useCallback((newParams?: Partial<DiscoverParams>) => {
    setParams(prevParams => newParams ? { ...prevParams, ...newParams } : prevParams);
    setItems([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalResults(0);
    setError(null);
    setIsLoading(false);
    setIsLoadingMore(false);
    hasInitialLoadRef.current = false;
    isLoadingRef.current = false;
  }, []); // Remove params dependency

  // Retry loading current page
  const retry = useCallback(async (): Promise<void> => {
    if (isLoadingRef.current) {
      return;
    }

    setError(null);
    
    if (items.length === 0) {
      // Retry initial load
      hasInitialLoadRef.current = false;
    } else {
      // Retry loading more
      await loadMore();
    }
  }, [items.length, loadMore]);

  // Initial load effect
  useEffect(() => {
    if (!enabled || hasInitialLoadRef.current) {
      return;
    }

    const loadInitialContent = async () => {
      if (isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      hasInitialLoadRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const response = await loadPage(1, true);
        
        if (response) {
          setItems(response.results);
          setCurrentPage(1);
          setTotalPages(response.totalPages);
          setTotalResults(response.totalResults);
        }
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadInitialContent();
  }, [enabled]); // Remove params and loadPage dependencies

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!enabled || !observerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && hasNextPage && !isLoadingRef.current) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    const currentObserverRef = observerRef.current;
    observer.observe(currentObserverRef);

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [enabled, hasNextPage, loadMore, threshold]);

  // Alternative scroll-based infinite loading (fallback)
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleScroll = () => {
      if (isLoadingRef.current || !hasNextPage) {
        return;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Check if user is near bottom of page
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        loadMore();
      }
    };

    // Throttle scroll events
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, hasNextPage, loadMore, threshold]);

  return {
    // Data
    items,
    totalResults,
    totalPages,
    currentPage,
    
    // Loading states
    isLoading,
    isLoadingMore,
    hasNextPage,
    
    // Error handling
    error,
    
    // Actions
    loadMore,
    reset,
    retry,
    
    // Intersection observer ref
    observerRef
  };
}