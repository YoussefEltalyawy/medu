import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollProgressIndicatorProps {
  totalItems?: number;
  loadedItems?: number;
  showBackToTop?: boolean;
  className?: string;
}

const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({
  totalItems = 0,
  loadedItems = 0,
  showBackToTop = true,
  className = ""
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      setScrollProgress(progress);
      setIsVisible(scrollTop > 300); // Show after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const loadingProgress = totalItems > 0 ? (loadedItems / totalItems) * 100 : 0;

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Progress Circle */}
      <div className="relative">
        {/* Background circle */}
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          {/* Scroll progress */}
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
            className="text-brand-accent transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
          {/* Loading progress (inner circle) */}
          {totalItems > 0 && (
            <circle
              cx="28"
              cy="28"
              r="18"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - loadingProgress / 100)}`}
              className="text-blue-400 transition-all duration-500 ease-out"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Back to top button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
            aria-label="Back to top"
          >
            <ChevronUp 
              size={20} 
              className="text-gray-600 group-hover:text-brand-accent transition-colors" 
            />
          </button>
        )}
      </div>

      {/* Progress text */}
      {totalItems > 0 && (
        <div className="mt-2 text-center">
          <div className="bg-white px-2 py-1 rounded-full shadow-sm text-xs text-gray-600">
            {loadedItems} / {totalItems}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollProgressIndicator;