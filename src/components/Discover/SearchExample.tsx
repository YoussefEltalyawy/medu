import React from 'react';
import { useSearch } from '@/hooks/useSearch';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';

interface SearchExampleProps {
  language: string;
  contentType?: 'movie' | 'tv' | 'all';
  onContentClick?: (content: any, type: 'movie' | 'tv') => void;
  className?: string;
}

const SearchExample: React.FC<SearchExampleProps> = ({
  language,
  contentType = 'all',
  onContentClick,
  className = ""
}) => {
  // Initialize search hook
  const {
    query,
    results,
    totalResults,
    totalPages,
    currentPage,
    isSearching,
    isLoadingMore,
    hasNextPage,
    error,
    setQuery,
    clearSearch,
    loadMoreResults,
    retry,
    hasSearched,
    isEmptyQuery
  } = useSearch({
    language,
    contentType,
    debounceMs: 300,
    minQueryLength: 2,
    enabled: true
  });

  return (
    <div className={className}>
      {/* Search Input */}
      <div className="mb-8">
        <SearchInput
          query={query}
          onQueryChange={setQuery}
          onClear={clearSearch}
          isSearching={isSearching}
          placeholder={`Search ${contentType === 'all' ? 'movies and TV shows' : contentType === 'movie' ? 'movies' : 'TV shows'}...`}
        />
      </div>

      {/* Search Results */}
      <SearchResults
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
        onLoadMore={loadMoreResults}
        onRetry={retry}
        onContentClick={onContentClick}
        contentType={contentType}
      />
    </div>
  );
};

export default SearchExample;