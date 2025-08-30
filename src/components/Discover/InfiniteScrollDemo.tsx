import React, { useState } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { useSearch } from '@/hooks/useSearch';
import ContentCard from './ContentCard';
import LoadingSkeleton from './LoadingSkeleton';
import LoadMoreButton from './LoadMoreButton';
import InfiniteScrollIndicator from './InfiniteScrollIndicator';
import ScrollProgressIndicator from './ScrollProgressIndicator';
import ContentLoadingPlaceholder from './ContentLoadingPlaceholder';
import LoadingOverlay from './LoadingOverlay';
import SearchInput from './SearchInput';
import EndOfContent from './EndOfContent';

interface InfiniteScrollDemoProps {
  language: string;
  originalLanguage: string;
  contentType?: 'movie' | 'tv' | 'all';
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
  className?: string;
}

const InfiniteScrollDemo: React.FC<InfiniteScrollDemoProps> = ({
  language,
  originalLanguage,
  contentType = 'all',
  onContentClick,
  className = ""
}) => {
  const [loadingVariant, setLoadingVariant] = useState<'default' | 'shimmer' | 'pulse' | 'wave'>('shimmer');
  const [showOverlay, setShowOverlay] = useState(false);
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Search functionality
  const {
    query,
    results: searchResults,
    isSearching,
    isLoadingMore: isSearchLoadingMore,
    hasNextPage: searchHasNextPage,
    error: searchError,
    setQuery,
    clearSearch,
    loadMoreResults: loadMoreSearchResults,
    retry: retrySearch,
    isEmptyQuery
  } = useSearch({
    language,
    contentType,
    debounceMs: 300,
    minQueryLength: 2,
    enabled: true
  });

  // Browse functionality
  const {
    items: browseItems,
    totalResults,
    totalPages,
    currentPage,
    isLoading: isBrowseLoading,
    isLoadingMore: isBrowseLoadingMore,
    hasNextPage: browseHasNextPage,
    error: browseError,
    loadMore: loadMoreBrowse,
    retry: retryBrowse,
    observerRef
  } = usePagination({
    initialParams: {
      language,
      originalLanguage,
      page: 1,
      contentType
    },
    enabled: isEmptyQuery,
    threshold: 200
  });

  // Determine current mode and data
  const isSearchMode = !isEmptyQuery;
  const currentItems = isSearchMode ? searchResults : browseItems;
  const isInitialLoading = isSearchMode ? (isSearching && searchResults.length === 0) : (isBrowseLoading && browseItems.length === 0);
  const isLoadingMore = isSearchMode ? isSearchLoadingMore : isBrowseLoadingMore;
  const hasNextPage = isSearchMode ? searchHasNextPage : browseHasNextPage;
  const error = isSearchMode ? searchError : browseError;
  const loadMore = isSearchMode ? loadMoreSearchResults : loadMoreBrowse;
  const retry = isSearchMode ? retrySearch : retryBrowse;

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
    if (!showOverlay) {
      setTimeout(() => setShowOverlay(false), 3000);
    }
  };

  return (
    <div className={className}>
      {/* Demo Controls */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Infinite Scroll Demo Controls</h3>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loading Animation:
            </label>
            <select
              value={loadingVariant}
              onChange={(e) => setLoadingVariant(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="default">Default</option>
              <option value="shimmer">Shimmer</option>
              <option value="pulse">Pulse</option>
              <option value="wave">Wave</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={toggleOverlay}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Show Loading Overlay
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <SearchInput
          query={query}
          onQueryChange={handleQueryChange}
          onClear={handleClearSearch}
          isSearching={isSearching}
          placeholder={`Search ${contentType === 'all' ? 'movies and TV shows' : contentType === 'movie' ? 'movies' : 'TV shows'}...`}
        />
      </div>

      {/* Loading Overlay Demo */}
      <LoadingOverlay
        isVisible={showOverlay}
        type={isSearchMode ? 'search' : 'discover'}
        message={isSearchMode ? 'Searching Content' : 'Discovering Content'}
      />

      {/* Initial Loading State */}
      {isInitialLoading && (
        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-medium mb-4">Loading Skeleton ({loadingVariant})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <LoadingSkeleton 
                count={15} 
                variant={loadingVariant}
                showDetails={true}
              />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Content Loading Placeholder</h4>
            <ContentLoadingPlaceholder 
              count={6}
              showMetadata={true}
              variant="grid"
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && currentItems.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              {isSearchMode ? 'Search Failed' : 'Failed to Load Content'}
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {currentItems.length > 0 && (
        <>
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              {isSearchMode ? `Found ${searchResults.length} results for "${query}"` : 
               `Showing ${browseItems.length.toLocaleString()} of ${totalResults.toLocaleString()} results`}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentItems.map((item) => (
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
            {isLoadingMore && (
              <LoadingSkeleton 
                count={10} 
                variant={loadingVariant}
                showDetails={true}
              />
            )}
          </div>

          {/* Infinite scroll trigger element */}
          {!isSearchMode && <div ref={observerRef} className="h-4" />}

          {/* Infinite Scroll Indicator */}
          <InfiniteScrollIndicator
            isLoading={isLoadingMore}
            hasNextPage={hasNextPage}
            error={error}
            onRetry={retry}
            variant="detailed"
            className="mt-8"
          />

          {/* Load More Button (fallback) */}
          <LoadMoreButton
            onLoadMore={loadMore}
            isLoading={isLoadingMore}
            hasNextPage={hasNextPage}
            error={error}
            onRetry={retry}
            loadedCount={currentItems.length}
            totalCount={isSearchMode ? undefined : totalResults}
            variant="detailed"
            className="mt-8"
          />

          {/* End of Content */}
          {!hasNextPage && currentItems.length > 0 && (
            <EndOfContent
              totalResults={isSearchMode ? searchResults.length : totalResults}
              contentType={contentType}
              className="mt-8"
            />
          )}
        </>
      )}

      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator
        totalItems={isSearchMode ? undefined : totalResults}
        loadedItems={currentItems.length}
        showBackToTop={true}
      />
    </div>
  );
};

export default InfiniteScrollDemo;