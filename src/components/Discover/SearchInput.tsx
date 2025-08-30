import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  onClear,
  isSearching = false,
  placeholder = "Search movies and TV shows...",
  className = "",
  disabled = false
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
  };

  const handleClear = () => {
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
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
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full pl-10 pr-12 py-3 
          border border-gray-300 rounded-full 
          focus:outline-none focus:ring-2 focus:ring-[#082408] focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
          ${isSearching ? 'bg-gray-50' : 'bg-white'}
        `}
      />

      {/* Clear Button */}
      {query && (
        <button
          onClick={handleClear}
          disabled={disabled}
          className="
            absolute right-3 top-1/2 transform -translate-y-1/2 
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
  );
};

export default SearchInput;