import React from 'react';
import { Squircle } from 'corner-smoothing';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave';
  showDetails?: boolean;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 10, 
  className = "",
  variant = 'default',
  showDetails = false
}) => {
  const getAnimationClass = () => {
    switch (variant) {
      case 'shimmer':
        return 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
      case 'pulse':
        return 'animate-pulse bg-gray-200';
      case 'wave':
        return 'animate-wave bg-gray-200';
      default:
        return 'animate-pulse bg-gray-200';
    }
  };

  const renderSkeletonCard = (index: number) => (
    <Squircle
      key={index}
      borderWidth={2}
      cornerRadius={25}
      className={`relative h-[200px] overflow-hidden before:bg-gray-300 ${className}`}
    >
      {/* Main skeleton background */}
      <div className={`absolute inset-0 ${getAnimationClass()}`} />
      
      {/* Content details skeleton */}
      {showDetails && (
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          {/* Title skeleton */}
          <div className="mb-2">
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-1" style={{ width: '70%' }} />
            <div className="h-3 bg-gray-300 rounded animate-pulse" style={{ width: '50%' }} />
          </div>
          
          {/* Type badge skeleton */}
          <div className="flex justify-between items-end">
            <div className="h-3 bg-gray-300 rounded animate-pulse" style={{ width: '30%' }} />
            <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse" />
          </div>
        </div>
      )}
      
      {/* Staggered animation delay */}
      <style jsx>{`
        .animate-shimmer {
          animation: shimmer 2s infinite;
          animation-delay: ${index * 0.1}s;
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
          animation-delay: ${index * 0.1}s;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes wave {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </Squircle>
  );

  return (
    <>
      {Array.from({ length: count }).map((_, i) => renderSkeletonCard(i))}
    </>
  );
};

export default LoadingSkeleton;