# Content Discovery Hooks

This directory contains React hooks for managing content discovery functionality.

## usePagination Hook

A comprehensive React hook for managing paginated content with infinite scroll functionality.

### Features

- ✅ Automatic infinite scroll with intersection observer
- ✅ Fallback scroll-based loading
- ✅ Loading states management
- ✅ Error handling with retry functionality
- ✅ Content accumulation across pages
- ✅ Configurable scroll threshold
- ✅ Reset functionality for parameter changes

### Usage

```typescript
import { usePagination } from '@/hooks/usePagination';

const MyComponent = () => {
  const {
    items,
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
      language: 'de-DE',
      originalLanguage: 'de',
      page: 1,
      contentType: 'all'
    },
    enabled: true,
    threshold: 200
  });

  return (
    <div>
      {/* Render items */}
      {items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
      
      {/* Infinite scroll trigger */}
      <div ref={observerRef} />
      
      {/* Loading states */}
      {isLoading && <div>Loading...</div>}
      {isLoadingMore && <div>Loading more...</div>}
    </div>
  );
};
```

### API Reference

#### Parameters

- `initialParams`: DiscoverParams - Initial parameters for content discovery
- `enabled`: boolean - Whether pagination is enabled (default: true)
- `threshold`: number - Distance from bottom to trigger load in pixels (default: 200)

#### Return Values

- `items`: ContentItem[] - Accumulated content items
- `totalResults`: number - Total number of available items
- `totalPages`: number - Total number of pages
- `currentPage`: number - Current page number
- `isLoading`: boolean - Initial loading state
- `isLoadingMore`: boolean - Loading more content state
- `hasNextPage`: boolean - Whether more pages are available
- `error`: string | null - Error message if any
- `loadMore`: () => Promise<void> - Manually trigger loading more content
- `reset`: (newParams?) => void - Reset pagination with optional new parameters
- `retry`: () => Promise<void> - Retry failed requests
- `observerRef`: RefObject<HTMLDivElement> - Ref for intersection observer element

## useSearch Hook

A comprehensive React hook for managing search functionality with debouncing and pagination.

### Features

- ✅ Debounced search queries to prevent excessive API calls
- ✅ Request cancellation to prevent race conditions
- ✅ Search result pagination with infinite scroll support
- ✅ Loading states for search and load more operations
- ✅ Error handling with retry functionality
- ✅ Configurable debounce timing and minimum query length
- ✅ Clear search functionality

### Usage

```typescript
import { useSearch } from '@/hooks/useSearch';

const SearchComponent = () => {
  const {
    query,
    results,
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
    language: 'de-DE',
    contentType: 'all',
    debounceMs: 300,
    minQueryLength: 2,
    enabled: true
  });

  return (
    <div>
      {/* Search input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search content..."
      />
      
      {/* Search results */}
      {results.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
      
      {/* Loading states */}
      {isSearching && <div>Searching...</div>}
      {isLoadingMore && <div>Loading more...</div>}
    </div>
  );
};
```

### API Reference

#### Parameters

- `language`: string - Language code for search API
- `debounceMs`: number - Debounce delay in milliseconds (default: 300)
- `minQueryLength`: number - Minimum query length to trigger search (default: 2)
- `enabled`: boolean - Whether search is enabled (default: true)
- `contentType`: 'movie' | 'tv' | 'all' - Type of content to search (default: 'all')

#### Return Values

- `query`: string - Current search query
- `results`: ContentItem[] - Search results
- `totalResults`: number - Total number of search results
- `totalPages`: number - Total number of result pages
- `currentPage`: number - Current page number
- `isSearching`: boolean - Initial search loading state
- `isLoadingMore`: boolean - Loading more results state
- `hasNextPage`: boolean - Whether more result pages are available
- `error`: string | null - Error message if any
- `setQuery`: (query: string) => void - Update search query
- `clearSearch`: () => void - Clear search and reset state
- `loadMoreResults`: () => Promise<void> - Load more search results
- `retry`: () => Promise<void> - Retry failed search
- `hasSearched`: boolean - Whether a search has been performed
- `isEmptyQuery`: boolean - Whether the query is empty