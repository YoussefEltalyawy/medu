import React from 'react';
import { usePagination } from '@/hooks/usePagination';
import { DiscoverParams } from '@/types/content';
import ContentCard from './ContentCard';
import LoadingSkeleton from './LoadingSkeleton';
import LoadMoreButton from './LoadMoreButton';
import EndOfContent from './EndOfContent';

interface PaginationExampleProps {
  language: string;
  originalLanguage: string;
  contentType?: 'movie' | 'tv' | 'all';
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
}

const PaginationExample: React.FC<PaginationExampleProps> = ({
  language,
  originalLanguage,
  contentType = 'all',
  onContentClick
}) => {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Initialize pagination hook
  const {
    items,
    totalResults,
    totalPages,
    currentPage,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    loadMore,
    reset,
    retry,
    observerRef
  } = usePagination({
    initialParams: {
      language,
      originalLanguage,
      page: 1,
      contentType
    },
    enabled: true,
    threshold: 200
  });

  // Handle parameter changes (language, content type, etc.)
  React.useEffect(() => {
    reset({
      language,
      originalLanguage,
      contentType,
      page: 1
    });
  }, [language, originalLanguage, contentType, reset]);

  // Initial loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <LoadingSkeleton count={20} />
        </div>
      </div>
    );
  }

  // Error state (initial load failed)
  if (error && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Failed to Load Content
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
      </div>
    );
  }

  // No content found
  if (!isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No {contentType === 'all' ? 'content' : contentType === 'movie' ? 'movies' : 'TV shows'} found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Results summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {items.length.toLocaleString()} of {totalResults.toLocaleString()} results
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
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
          <LoadingSkeleton count={10} />
        )}
      </div>

      {/* Infinite scroll trigger element */}
      <div ref={observerRef} className="h-4" />

      {/* Load more button (fallback) */}
      {hasNextPage && (
        <LoadMoreButton
          onLoadMore={loadMore}
          isLoading={isLoadingMore}
          hasNextPage={hasNextPage}
          error={error}
          onRetry={retry}
          className="mt-8"
        />
      )}

      {/* End of content indicator */}
      {!hasNextPage && items.length > 0 && (
        <EndOfContent
          totalResults={totalResults}
          contentType={contentType}
          className="mt-8"
        />
      )}
    </div>
  );
};

export default PaginationExample;