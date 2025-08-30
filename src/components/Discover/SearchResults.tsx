import React from 'react';
import { Search, AlertCircle } from 'lucide-react';
import ContentCard from './ContentCard';
import LoadingSkeleton from './LoadingSkeleton';
import LoadMoreButton from './LoadMoreButton';
import EndOfContent from './EndOfContent';

interface SearchResultsProps {
  query: string;
  results: any[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  isSearching: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;
  hasSearched: boolean;
  isEmptyQuery: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
  contentType?: 'movie' | 'tv' | 'all';
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  totalResults,
  totalPages,
  currentPage,
  isSearching,
  isLoadingMore,
  hasNextPage,
  error,
  hasSearched,
  isEmptyQuery,
  onLoadMore,
  onRetry,
  onContentClick,
  contentType = 'all',
  className = ""
}) => {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Empty query state
  if (isEmptyQuery && !hasSearched) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Search size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Start Your Search
          </h3>
          <p className="text-gray-500">
            Enter a movie or TV show title to discover content in your target language.
          </p>
        </div>
      </div>
    );
  }

  // Initial search loading
  if (isSearching && results.length === 0) {
    return (
      <div className={className}>
        <div className="mb-4">
          <p className="text-gray-600">Searching for "{query}"...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <LoadingSkeleton count={10} />
        </div>
      </div>
    );
  }

  // Search error (initial search failed)
  if (error && results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Search Failed
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No results found
  if (!isSearching && hasSearched && results.length === 0 && !error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Search size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-500 mb-4">
            We couldn't find any {contentType === 'all' ? 'content' : contentType === 'movie' ? 'movies' : 'TV shows'} matching "{query}".
          </p>
          <div className="text-sm text-gray-400">
            Try different keywords or check your spelling.
          </div>
        </div>
      </div>
    );
  }

  // Search results
  return (
    <div className={className}>
      {/* Results summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Found {totalResults.toLocaleString()} results for "{query}"
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {results.map((item) => (
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

        {/* Loading skeleton for additional results */}
        {isLoadingMore && (
          <LoadingSkeleton count={10} />
        )}
      </div>

      {/* Load more button for search results */}
      {hasNextPage && (
        <LoadMoreButton
          onLoadMore={onLoadMore}
          isLoading={isLoadingMore}
          hasNextPage={hasNextPage}
          error={error}
          onRetry={onRetry}
          className="mt-8"
        />
      )}

      {/* End of search results */}
      {!hasNextPage && results.length > 0 && (
        <EndOfContent
          totalResults={totalResults}
          contentType={contentType}
          className="mt-8"
        />
      )}
    </div>
  );
};

export default SearchResults;