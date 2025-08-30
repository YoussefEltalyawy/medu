import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import ContentCard from './ContentCard';
import LoadingSkeleton from './LoadingSkeleton';
import LoadMoreButton from './LoadMoreButton';
import EndOfContent from './EndOfContent';

interface BrowseSearchToggleProps {
  language: string;
  originalLanguage: string;
  contentType?: 'movie' | 'tv' | 'all';
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
  className?: string;
  isSearchMode: boolean;
  onToggleSearch: () => void;
}

const BrowseSearchToggle: React.FC<BrowseSearchToggleProps> = ({
  language,
  originalLanguage,
  contentType = 'all',
  onContentClick,
  className = "",
  isSearchMode,
  onToggleSearch
}) => {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination hook for browse mode
  const {
    items: browseItems,
    totalResults: browseTotalResults,
    totalPages: browseTotalPages,
    currentPage: browseCurrentPage,
    isLoading: isBrowseLoading,
    isLoadingMore: isBrowseLoadingMore,
    hasNextPage: browseHasNextPage,
    error: browseError,
    loadMore: loadMoreBrowse,
    reset: resetBrowse,
    retry: retryBrowse,
    observerRef
  } = usePagination({
    initialParams: {
      language,
      originalLanguage,
      page: 1,
      contentType
    },
    enabled: !isSearchMode, // Only enable browse mode when not searching
    threshold: 200
  });

  const isInitialBrowseLoading = isBrowseLoading && browseItems.length === 0;

  // Handle search input changes
  const handleQueryChange = (newQuery: string) => {
    setSearchQuery(newQuery);
  };

  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      // Search TMDB API based on content type
      // Use originalLanguage to search for content in the language the user is learning
      let searchUrl = '';
      const query = encodeURIComponent(searchQuery.trim());

      if (contentType === 'movie') {
        searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=${originalLanguage}&query=${query}&page=1`;
      } else if (contentType === 'tv') {
        searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=${originalLanguage}&query=${query}&page=1`;
      } else {
        // Search both movies and TV shows
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=${originalLanguage}&query=${query}&page=1`),
          fetch(`https://api.themoviedb.org/3/search/tv?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=${originalLanguage}&query=${query}&page=1`)
        ]);

        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();

        // Combine and format results
        const combinedResults = [
          ...(movieData.results || []).map((item: any) => ({ ...item, type: 'movie' })),
          ...(tvData.results || []).map((item: any) => ({ ...item, type: 'tv' }))
        ];

        // Sort by popularity
        combinedResults.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));

        setSearchResults(combinedResults);
        setIsSearching(false);
        return;
      }

      // Single content type search
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status_message || 'Search failed');
      }

      // Format results with content type
      const results = (data.results || []).map((item: any) => ({
        ...item,
        type: contentType === 'movie' ? 'movie' : 'tv'
      }));

      setSearchResults(results);
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setHasSearched(false);
    onToggleSearch(); // Exit search mode
  };

  // Handle content type changes
  React.useEffect(() => {
    // Reset browse when content type changes
    resetBrowse({
      language,
      originalLanguage,
      contentType,
      page: 1
    });
  }, [contentType, language, originalLanguage]);

  // Auto-search when query changes (with debounce)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className={className}>
      {/* Search Input - Only show when in search mode */}
      {isSearchMode && (
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${contentType === 'all' ? 'movies and TV shows' : contentType === 'movie' ? 'movies' : 'TV shows'}...`}
                className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-brand-accent text-white text-sm rounded hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="mt-8">
            {isSearching && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-brand-accent mx-auto mb-4" />
                <p className="text-gray-600">Searching...</p>
              </div>
            )}

            {searchError && (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Search Error</h3>
                  <p className="text-red-600 mb-4">{searchError}</p>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {!isSearching && !searchError && hasSearched && searchResults.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Results Found</h3>
                <p className="text-gray-500 mb-4">
                  No content found matching "{searchQuery}"
                </p>
                <button
                  onClick={onToggleSearch}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Browse
                </button>
              </div>
            )}

            {!isSearching && !searchError && searchResults.length > 0 && (
              <div>
                {/* Search Results Summary */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                </div>

                {/* Search Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {searchResults.map((item) => (
                    <ContentCard
                      key={`search-${item.type}-${item.id}`}
                      id={item.id}
                      title={item.title || item.name}
                      imageUrl={`${IMAGE_BASE_URL}${item.backdrop_path || item.poster_path}`}
                      type={item.type}
                      content={item}
                      onClick={() => onContentClick?.(item, item.type)}
                    />
                  ))}
                </div>

                {/* Back to Browse Button */}
                <div className="text-center mt-8">
                  <button
                    onClick={onToggleSearch}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Browse
                  </button>
                </div>
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Start Searching</h3>
                <p className="text-gray-500">
                  Type in the search box above to find movies and TV shows
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browse Mode */}
      {!isSearchMode && (
        <div>
          {/* Initial loading for browse mode */}
          {isInitialBrowseLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <LoadingSkeleton count={20} />
            </div>
          )}

          {/* Browse error state */}
          {browseError && browseItems.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Failed to Load Content
                </h3>
                <p className="text-red-600 mb-4">{browseError}</p>
                <button
                  onClick={retryBrowse}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Browse results */}
          {!isInitialBrowseLoading && browseItems.length > 0 && (
            <>
              {/* Results summary */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {browseItems.length.toLocaleString()} of {browseTotalResults.toLocaleString()} results
                  {browseTotalPages > 1 && ` (Page ${browseCurrentPage} of ${browseTotalPages})`}
                </p>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {browseItems.map((item) => (
                  <ContentCard
                    key={`${item.type}-${item.id}`}
                    id={item.id}
                    title={item.title}
                    imageUrl={`${IMAGE_BASE_URL}${item.backdrop_path || item.poster_path}`}
                    type={item.type}
                    content={item}
                    onClick={() => onContentClick?.(item, item.type)}
                  />
                ))}

                {/* Loading skeleton for additional content */}
                {isBrowseLoadingMore && (
                  <LoadingSkeleton count={10} />
                )}
              </div>

              {/* Infinite scroll trigger element */}
              <div ref={observerRef} className="h-4" />

              {/* Load more button (fallback) */}
              {browseHasNextPage && (
                <LoadMoreButton
                  onLoadMore={loadMoreBrowse}
                  isLoading={isBrowseLoadingMore}
                  hasNextPage={browseHasNextPage}
                  error={browseError}
                  onRetry={retryBrowse}
                  className="mt-8"
                />
              )}

              {/* End of content indicator */}
              {!browseHasNextPage && browseItems.length > 0 && (
                <EndOfContent
                  totalResults={browseTotalResults}
                  contentType={contentType}
                  className="mt-8"
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseSearchToggle;