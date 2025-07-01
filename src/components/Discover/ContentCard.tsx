import React from 'react';
import { Squircle } from 'corner-smoothing';
import { Check } from 'lucide-react';
import { useWatchedContent } from '@/contexts/WatchedContentContext';

interface ContentCardProps {
  id: number;
  title: string;
  imageUrl: string;
  type: 'movie' | 'tv';
  content: any; // Full content object from TMDB
  onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  imageUrl,
  type,
  content,
  onClick
}) => {
  const { isContentWatched } = useWatchedContent();
  const isWatched = isContentWatched(id, type);

  return (
    <Squircle
      borderWidth={2}
      cornerRadius={25}
      className="relative overflow-hidden h-[200px] before:bg-black cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 p-4">
        {/* Title at bottom-left */}
        <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">
          {title}
        </h3>

        {/* Type at bottom-right */}
        <div className="absolute bottom-4 right-4 text-xs text-white bg-brand-accent px-3 py-1 rounded-full">
          {type === 'movie' ? 'Movie' : 'TV Show'}
        </div>

        {/* Watched indicator */}
        {isWatched && (
          <div className="absolute top-4 right-4 bg-green-600 text-white p-1 rounded-full transition-all duration-200">
            <Check size={16} />
          </div>
        )}
      </div>
    </Squircle>
  );
};

export default ContentCard;