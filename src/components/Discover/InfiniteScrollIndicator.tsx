import React from 'react';
import { Loader2, ChevronDown, Wifi, WifiOff } from 'lucide-react';

interface InfiniteScrollIndicatorProps {
  isLoading?: boolean;
  hasNextPage?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'floating';
}

const InfiniteScrollIndicator: React.FC<InfiniteScrollIndicatorProps> = ({
  isLoading = false,
  hasNextPage = true,
  error = null,
  onRetry,
  className = "",
  variant = 'minimal'
}) => {
  // Don't render if there's no next page and no error
  if (!hasNextPage && !error && !isLoading) {
    return null;
  }

  const getIndicatorContent = () => {
    if (error) {
      return (
        <div className="flex items-center gap-3">
          <WifiOff size={20} className="text-red-500" />
          <div className="flex-1">
            <p className="text-red-600 font-medium">Failed to load more content</p>
            {variant === 'detailed' && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-brand-accent" />
          <div className="flex-1">
            <p className="text-gray-600 font-medium">Loading more content...</p>
            {variant === 'detailed' && (
              <p className="text-gray-500 text-sm">Discovering new movies and TV shows</p>
            )}
          </div>
        </div>
      );
    }

    if (hasNextPage) {
      return (
        <div className="flex items-center gap-3">
          <ChevronDown size={20} className="text-gray-400 animate-bounce" />
          <div className="flex-1">
            <p className="text-gray-500">Scroll down for more content</p>
            {variant === 'detailed' && (
              <p className="text-gray-400 text-sm">More movies and TV shows await</p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const getContainerClasses = () => {
    const baseClasses = "flex items-center justify-center p-4 transition-all duration-300";
    
    switch (variant) {
      case 'floating':
        return `${baseClasses} fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full border z-50 ${className}`;
      case 'detailed':
        return `${baseClasses} bg-gray-50 border border-gray-200 rounded-lg mx-4 ${className}`;
      default:
        return `${baseClasses} ${className}`;
    }
  };

  return (
    <div className={getContainerClasses()}>
      {getIndicatorContent()}
    </div>
  );
};

export default InfiniteScrollIndicator;