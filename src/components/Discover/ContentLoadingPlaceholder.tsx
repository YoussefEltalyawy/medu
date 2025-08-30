import React from 'react';
import { Squircle } from 'corner-smoothing';
import { Film, Tv, Star, Clock } from 'lucide-react';

interface ContentLoadingPlaceholderProps {
  count?: number;
  showMetadata?: boolean;
  variant?: 'grid' | 'list' | 'featured';
  className?: string;
}

const ContentLoadingPlaceholder: React.FC<ContentLoadingPlaceholderProps> = ({
  count = 6,
  showMetadata = false,
  variant = 'grid',
  className = ""
}) => {
  const renderGridPlaceholder = (index: number) => (
    <Squircle
      key={index}
      borderWidth={2}
      cornerRadius={25}
      className="relative h-[200px] overflow-hidden bg-gray-100 before:bg-gray-200"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Top section - Type indicator */}
        <div className="flex justify-between items-start">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse flex items-center justify-center">
            {index % 2 === 0 ? (
              <Film size={16} className="text-gray-400" />
            ) : (
              <Tv size={16} className="text-gray-400" />
            )}
          </div>
          <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
        </div>
        
        {/* Bottom section - Title and metadata */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse" style={{ width: '80%' }} />
            <div className="h-3 bg-gray-300 rounded animate-pulse" style={{ width: '60%' }} />
          </div>
          
          {showMetadata && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-gray-400" />
                <div className="h-3 w-8 bg-gray-300 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-gray-300 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
      
      {/* Shimmer animation styles */}
      <style jsx>{`
        .animate-shimmer {
          animation: shimmer 2s infinite;
          animation-delay: ${index * 0.1}s;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </Squircle>
  );

  const renderListPlaceholder = (index: number) => (
    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
      {/* Thumbnail */}
      <div className="w-20 h-28 bg-gray-300 rounded flex-shrink-0 flex items-center justify-center">
        {index % 2 === 0 ? (
          <Film size={20} className="text-gray-400" />
        ) : (
          <Tv size={20} className="text-gray-400" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 rounded" style={{ width: '70%' }} />
          <div className="h-4 bg-gray-300 rounded" style={{ width: '50%' }} />
        </div>
        
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded" style={{ width: '90%' }} />
          <div className="h-3 bg-gray-300 rounded" style={{ width: '80%' }} />
          <div className="h-3 bg-gray-300 rounded" style={{ width: '60%' }} />
        </div>
        
        {showMetadata && (
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-gray-400" />
              <div className="h-3 w-10 bg-gray-300 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-gray-400" />
              <div className="h-3 w-12 bg-gray-300 rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeaturedPlaceholder = (index: number) => (
    <div key={index} className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
        <div className="space-y-3">
          <div className="h-6 bg-gray-300 rounded animate-pulse" style={{ width: '60%' }} />
          <div className="h-4 bg-gray-300 rounded animate-pulse" style={{ width: '40%' }} />
          
          {showMetadata && (
            <div className="flex gap-4">
              <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .animate-shimmer {
          animation: shimmer 2s infinite;
          animation-delay: ${index * 0.2}s;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );

  const renderPlaceholder = (index: number) => {
    switch (variant) {
      case 'list':
        return renderListPlaceholder(index);
      case 'featured':
        return renderFeaturedPlaceholder(index);
      default:
        return renderGridPlaceholder(index);
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'list':
        return `space-y-4 ${className}`;
      case 'featured':
        return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`;
      default:
        return `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`;
    }
  };

  return (
    <div className={getContainerClasses()}>
      {Array.from({ length: count }).map((_, i) => renderPlaceholder(i))}
    </div>
  );
};

export default ContentLoadingPlaceholder;