import React, { useState } from 'react';
import { Loader2, RefreshCw, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  loadedCount?: number;
  totalCount?: number;
  variant?: 'default' | 'minimal' | 'detailed';
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onLoadMore,
  isLoading = false,
  hasNextPage = true,
  error = null,
  onRetry,
  className = "",
  loadedCount,
  totalCount,
  variant = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Don't render if there are no more pages and no error
  if (!hasNextPage && !error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <CheckCircle size={32} className="text-green-500" />
          <div>
            <p className="text-gray-700 font-medium text-lg">All content loaded!</p>
            {variant === 'detailed' && totalCount && (
              <p className="text-gray-500 text-sm mt-1">
                You've seen all {totalCount.toLocaleString()} items
              </p>
            )}
          </div>
          <div className="text-2xl">🎬</div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error && onRetry) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-red-700 font-medium">Failed to load more content</p>
              {variant === 'detailed' && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}
            </div>
          </div>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    const loadingContent = () => {
      switch (variant) {
        case 'minimal':
          return (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-gray-600 text-sm">Loading...</span>
            </div>
          );
        case 'detailed':
          return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <div>
                  <p className="text-blue-700 font-medium">Loading more content...</p>
                  <p className="text-blue-600 text-sm">Discovering new movies and TV shows</p>
                </div>
              </div>
              {loadedCount && totalCount && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(loadedCount / totalCount) * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        default:
          return (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-gray-600">Loading more content...</span>
            </div>
          );
      }
    };

    return (
      <div className={`text-center py-8 ${className}`}>
        {loadingContent()}
      </div>
    );
  }

  // Load more button
  const buttonContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <button
            onClick={onLoadMore}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-all duration-200 hover:scale-105"
          >
            <ChevronDown size={16} className={isHovered ? 'animate-bounce' : ''} />
            More
          </button>
        );
      case 'detailed':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-center mb-4">
              <p className="text-gray-700 font-medium">Ready for more content?</p>
              {loadedCount && totalCount && (
                <p className="text-gray-500 text-sm mt-1">
                  Loaded {loadedCount.toLocaleString()} of {totalCount.toLocaleString()} items
                </p>
              )}
            </div>
            <button
              onClick={onLoadMore}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-all duration-200 hover:scale-105 font-medium"
            >
              <ChevronDown size={20} className={isHovered ? 'animate-bounce' : ''} />
              Load More Content
            </button>
          </div>
        );
      default:
        return (
          <button
            onClick={onLoadMore}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-all duration-200 hover:scale-105 font-medium"
          >
            <ChevronDown size={20} className={isHovered ? 'animate-bounce' : ''} />
            Load More Content
          </button>
        );
    }
  };

  return (
    <div className={`text-center py-8 ${className}`}>
      {buttonContent()}
    </div>
  );
};

export default LoadMoreButton;