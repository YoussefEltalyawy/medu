import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, Filter, ChevronDown, Star, Calendar } from 'lucide-react';

interface SearchFilters {
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedSearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  suggestions?: string[];
  isLoadingSuggestions?: boolean;
  filters?: SearchFilters;
  onFiltersChange?: (filters: Partial<SearchFilters>) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

const AdvancedSearchInput: React.FC<AdvancedSearchInputProps> = ({
  query,
  onQueryChange,
  onClear,
  isSearching = false,
  placeholder = "Search movies and TV shows...",
  className = "",
  disabled = false,
  suggestions = [],
  isLoadingSuggestions = false,
  filters = {},
  onFiltersChange,
  onClearFilters,
  hasActiveFilters = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
    setShowSuggestions(true);
    setFocusedSuggestionIndex(-1);
  };

  const handleClear = () => {
    onClear();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      handleClear();
      return;
    }

    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[focusedSuggestionIndex]);
        }
        break;
    }
  };

  const handleFilterChange = (filterKey: keyof SearchFilters, value: any) => {
    if (onFiltersChange) {
      onFiltersChange({ [filterKey]: value });
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isSearching ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Search size={20} />
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-20 py-3 
            border border-gray-300 rounded-full 
            focus:outline-none focus:ring-2 focus:ring-[#082408] focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${isSearching ? 'bg-gray-50' : 'bg-white'}
          `}
        />

        {/* Right Side Controls */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={disabled}
            className={`
              p-1 rounded-full transition-colors duration-200
              ${hasActiveFilters 
                ? 'text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }
              disabled:cursor-not-allowed
            `}
            aria-label="Search filters"
          >
            <Filter size={16} />
          </button>

          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClear}
              disabled={disabled}
              className="
                text-gray-400 hover:text-gray-600 
                disabled:cursor-not-allowed
                transition-colors duration-200
                p-1 rounded-full hover:bg-gray-100
              "
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {isLoadingSuggestions ? (
            <div className="p-4 text-center">
              <Loader2 size={16} className="animate-spin mx-auto mb-2" />
              <span className="text-sm text-gray-500">Loading suggestions...</span>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                  ${index === focusedSuggestionIndex ? 'bg-gray-50' : ''}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <Search size={14} className="text-gray-400" />
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div
          ref={filtersRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Search Filters</h3>
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star size={16} className="inline mr-1" />
                Rating Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.minRating || ''}
                  onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Min"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.maxRating || ''}
                  onChange={(e) => handleFilterChange('maxRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Max"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Release Year
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.yearFrom || ''}
                  onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="From"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.yearTo || ''}
                  onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="To"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy || 'popularity'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="release_date">Release Date</option>
                  <option value="title">Title</option>
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchInput;