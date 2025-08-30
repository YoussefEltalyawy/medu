import React from 'react';
import { Loader2, Film, Tv, Search } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible?: boolean;
  message?: string;
  submessage?: string;
  type?: 'discover' | 'search' | 'language' | 'generic';
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible = false,
  message,
  submessage,
  type = 'generic',
  className = ""
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'discover':
        return (
          <div className="flex gap-2 mb-4">
            <Film size={32} className="text-brand-accent animate-pulse" />
            <Tv size={32} className="text-brand-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        );
      case 'search':
        return <Search size={32} className="text-brand-accent mb-4 animate-pulse" />;
      case 'language':
        return (
          <div className="mb-4">
            <div className="w-8 h-8 bg-brand-accent rounded-full animate-pulse mx-auto" />
          </div>
        );
      default:
        return <Loader2 size={32} className="text-brand-accent mb-4 animate-spin" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'discover':
        return 'Discovering Content';
      case 'search':
        return 'Searching';
      case 'language':
        return 'Loading Language Preferences';
      default:
        return 'Loading';
    }
  };

  const getDefaultSubmessage = () => {
    switch (type) {
      case 'discover':
        return 'Finding movies and TV shows in your preferred language...';
      case 'search':
        return 'Looking for matching content...';
      case 'language':
        return 'Setting up your personalized experience...';
      default:
        return 'Please wait while we load your content...';
    }
  };

  return (
    <div className={`fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="text-center max-w-md mx-auto p-8">
        {/* Icon */}
        <div className="flex justify-center">
          {getIcon()}
        </div>
        
        {/* Main message */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {message || getDefaultMessage()}
        </h3>
        
        {/* Submessage */}
        <p className="text-gray-600">
          {submessage || getDefaultSubmessage()}
        </p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;