import React from 'react';
import { Film, Tv } from 'lucide-react';

interface EndOfContentProps {
  totalResults: number;
  contentType?: 'movie' | 'tv' | 'all';
  className?: string;
}

const EndOfContent: React.FC<EndOfContentProps> = ({
  totalResults,
  contentType = 'all',
  className = ""
}) => {
  const getIcon = () => {
    switch (contentType) {
      case 'movie':
        return <Film size={24} className="text-gray-400" />;
      case 'tv':
        return <Tv size={24} className="text-gray-400" />;
      default:
        return (
          <div className="flex gap-2">
            <Film size={24} className="text-gray-400" />
            <Tv size={24} className="text-gray-400" />
          </div>
        );
    }
  };

  const getContentTypeText = () => {
    switch (contentType) {
      case 'movie':
        return 'movies';
      case 'tv':
        return 'TV shows';
      default:
        return 'content';
    }
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          That's all for now!
        </h3>
        
        <p className="text-gray-500 mb-4">
          You've seen all {totalResults.toLocaleString()} {getContentTypeText()} available.
        </p>
        
        <div className="text-sm text-gray-400">
          🎬 Check back later for new releases!
        </div>
      </div>
    </div>
  );
};

export default EndOfContent;