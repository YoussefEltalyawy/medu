import React, { useState } from 'react';
import { Search, AlertCircle, Filter, Grid, List, Star, Calendar, Clock } from 'lucide-react';
import ContentCard from './ContentCard';
import LoadingSkeleton from './LoadingSkeleton';
import LoadMoreButton from './LoadMoreButton';
import EndOfContent from './EndOfContent';

interface SearchFilters {
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface EnhancedSearchResultsProps {
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
  hasActiveFilters: boolean;
  filters: SearchFilters;
  onLoadMore: () => void;
  onRetry: () => void;
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
  contentType?: 'movie' | 'tv' | 'all';
  className?: string;
}

const EnhancedSearchResults: React.FC<EnhancedSearchResultsProps> = ({
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
  hasActiveFilters,
  filters,
  onLoadMore,
  onRetry,
  onContentClick,
  contentType = 'all',
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Empty query state
  if (isEmptyQuery && !hasSearched && !hasActiveFilters) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <Search size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Discover Content
          </h3>
          <p className="text-gray-500 mb-4">
            Search for movies and TV shows, or use filters to discover content in your target language.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Filter size={16} />
            <span>Try using filters to browse by rating, year, or genre</span>
          </div>
        </div>
      </div>
    );
  }

  // Initial search loading
  if (isSearching && results.length === 0) {
    return (
      <div className={className}>
        <div className="mb-4">
          <p className="text-gray-600">
            {query ? `Searching for "${query}"...` : 'Searching with filters...'}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <LoadingSkeleton count={15} variant="shimmer" showDetails={true} />
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
          <div className="text-gray-500 mb-4">
            {query && hasActiveFilters ? (
              <p>No {contentType === 'all' ? 'content' : contentType === 'movie' ? 'movies' : 'TV shows'} found matching "{query}" with the applied filters.</p>
            ) : query ? (
              <p>No {contentType === 'all' ? 'content' : contentType === 'movie' ? 'movies' : 'TV shows'} found matching "{query}".</p>
            ) : (
              <p>No {contentType === 'all' ? 'content' : contentType === 'movie' ? 'movies' : 'TV shows'} found with the applied filters.</p>
            )}
          </div>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Try adjusting your search terms or filters:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spelling</li>
              <li>Use different keywords</li>
              <li>Remove some filters</li>
              <li>Try broader search terms</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Search results
  return (
    <div className={className}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-600">
            {query && hasActiveFilters ? (
              <>Found {totalResults.toLocaleString()} results for "{query}" with filters</>
            ) : query ? (
              <>Found {totalResults.toLocaleString()} results for "{query}"</>
            ) : hasActiveFilters ? (
              <>Found {totalResults.toLocaleString()} results with filters</>
            ) : (
              <>Showing {totalResults.toLocaleString()} results</>
            )}
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
          
          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.minRating && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <Star size={12} />
                  Min: {filters.minRating}
                </span>
              )}
              {filters.maxRating && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <Star size={12} />
                  Max: {filters.maxRating}
                </span>
              )}
              {filters.yearFrom && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  <Calendar size={12} />
                  From: {filters.yearFrom}
                </span>
              )}
              {filters.yearTo && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  <Calendar size={12} />
                  To: {filters.yearTo}
                </span>
              )}
              {filters.sortBy && filters.sortBy !== 'popularity' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Sort: {filters.sortBy} ({filters.sortOrder === 'asc' ? '↑' : '↓'})
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-brand-accent text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-brand-accent text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Results Grid/List */}
      {viewMode === 'grid' ? (
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
            <LoadingSkeleton count={10} variant="shimmer" showDetails={true} />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onContentClick?.(item, item.type)}
            >
              {/* Poster */}
              <div className="w-20 h-28 flex-shrink-0">
                <img
                  src={`${IMAGE_BASE_URL}${item.poster_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              {/* Content Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <span className="ml-2 px-2 py-1 bg-brand-accent text-white text-xs rounded-full flex-shrink-0">
                    {item.type === 'movie' ? 'Movie' : 'TV Show'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                  {item.vote_average && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  {(item.release_date || item.first_air_date) && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(item.release_date || item.first_air_date).getFullYear()}
                      </span>
                    </div>
                  )}
                  {item.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{item.runtime} min</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 text-sm line-clamp-2">
                  {item.overview}
                </p>
              </div>
            </div>
          ))}

          {/* Loading skeleton for additional results */}
          {isLoadingMore && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-20 h-28 bg-gray-300 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-1/2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded" />
                      <div className="h-3 bg-gray-300 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Load More Button */}
      <LoadMoreButton
        onLoadMore={onLoadMore}
        isLoading={isLoadingMore}
        hasNextPage={hasNextPage}
        error={error}
        onRetry={onRetry}
        loadedCount={results.length}
        totalCount={totalResults}
        variant="detailed"
        className="mt-8"
      />

      {/* End of Search Results */}
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

export default EnhancedSearchResults;