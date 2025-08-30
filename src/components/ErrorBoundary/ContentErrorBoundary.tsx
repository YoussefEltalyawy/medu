'use client';
import React from 'react';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { AppError, getUserFriendlyMessage } from '@/utils/errorHandling';

interface ContentErrorBoundaryProps {
  error: Error | AppError | null;
  onRetry?: () => void;
  onReset?: () => void;
  context?: 'search' | 'browse' | 'content' | 'episodes';
  className?: string;
}

const ContentErrorBoundary: React.FC<ContentErrorBoundaryProps> = ({
  error,
  onRetry,
  onReset,
  context = 'content',
  className = ""
}) => {
  if (!error) return null;

  const userMessage = getUserFriendlyMessage(error);
  
  const getContextualMessage = () => {
    switch (context) {
      case 'search':
        return 'We couldn\'t complete your search. Please try different keywords or check your connection.';
      case 'browse':
        return 'We couldn\'t load the content for browsing. Please try again.';
      case 'episodes':
        return 'We couldn\'t load the episode information. Please try again.';
      default:
        return userMessage;
    }
  };

  const getIcon = () => {
    switch (context) {
      case 'search':
        return <Search size={48} className="text-red-400" />;
      default:
        return <AlertCircle size={48} className="text-red-400" />;
    }
  };

  const getSuggestions = () => {
    switch (context) {
      case 'search':
        return [
          'Check your spelling',
          'Try different keywords',
          'Use broader search terms',
          'Check your internet connection'
        ];
      case 'browse':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Try again in a few moments'
        ];
      case 'episodes':
        return [
          'Check your internet connection',
          'Try selecting a different season',
          'Try again in a few moments'
        ];
      default:
        return [
          'Check your internet connection',
          'Try refreshing the page'
        ];
    }
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {context === 'search' ? 'Search Failed' : 
           context === 'episodes' ? 'Episodes Unavailable' : 
           'Content Unavailable'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {getContextualMessage()}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors font-medium"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
          )}
          
          {onReset && (
            <button
              onClick={onReset}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {context === 'search' ? 'Clear Search' : 'Reset'}
            </button>
          )}
        </div>

        {/* Suggestions */}
        <div className="text-sm text-gray-500">
          <p className="mb-2">Try these suggestions:</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            {getSuggestions().map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>

        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-600">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-32">
              <div className="mb-1">
                <strong>Message:</strong> {error.message}
              </div>
              {error instanceof AppError && (
                <>
                  <div className="mb-1">
                    <strong>Code:</strong> {error.code}
                  </div>
                  <div className="mb-1">
                    <strong>Context:</strong> {error.context}
                  </div>
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default ContentErrorBoundary;