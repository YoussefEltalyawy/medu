import React from 'react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import AdvancedSearchInput from './AdvancedSearchInput';
import EnhancedSearchResults from './EnhancedSearchResults';

interface ComprehensiveSearchProps {
  language: string;
  contentType?: 'movie' | 'tv' | 'all';
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
  className?: string;
}

const ComprehensiveSearch: React.FC<ComprehensiveSearchProps> = ({
  language,
  contentType = 'all',
  onContentClick,
  className = ""
}) => {
  // Use advanced search hook
  const {
    query,
    results,
    totalResults,
    totalPages,
    currentPage,
    filters,
    isSearching,
    isLoadingMore,
    hasNextPage,
    error,
    setQuery,
    setFilters,
    clearSearch,
    clearFilters,
    loadMoreResults,
    retry,
    hasSearched,
    isEmptyQuery,
    hasActiveFilters,
    suggestions,
    isLoadingSuggestions
  } = useAdvancedSearch({
    language,
    contentType,
    debounceMs: 300,
    minQueryLength: 2,
    enabled: true
  });

  return (
    <div className={className}>
      {/* Advanced Search Input */}
      <div className="mb-8">
        <AdvancedSearchInput
          query={query}
          onQueryChange={setQuery}
          onClear={clearSearch}
          isSearching={isSearching}
          placeholder={`Search ${contentType === 'all' ? 'movies and TV shows' : contentType === 'movie' ? 'movies' : 'TV shows'}...`}
          suggestions={suggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Enhanced Search Results */}
      <EnhancedSearchResults
        query={query}
        results={results}
        totalResults={totalResults}
        totalPages={totalPages}
        currentPage={currentPage}
        isSearching={isSearching}
        isLoadingMore={isLoadingMore}
        hasNextPage={hasNextPage}
        error={error}
        hasSearched={hasSearched}
        isEmptyQuery={isEmptyQuery}
        hasActiveFilters={hasActiveFilters}
        filters={filters}
        onLoadMore={loadMoreResults}
        onRetry={retry}
        onContentClick={onContentClick}
        contentType={contentType}
      />
    </div>
  );
};

export default ComprehensiveSearch;