import React from 'react';
import { Squircle } from 'corner-smoothing';

interface ContentCardProps {
  id: number;
  title: string;
  imageUrl: string;
  type: 'movie' | 'tv';
  onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ id, title, imageUrl, type, onClick }) => {
  return (
    <Squircle
      borderWidth={2}
      cornerRadius={25}
      className="relative overflow-hidden h-[200px] before:bg-black cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
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
        <div className="absolute bottom-4 right-4 text-xs text-white bg-[#082408] px-3 py-1 rounded-full">
          {type === 'movie' ? 'Movie' : 'TV Show'}
        </div>
      </div>
    </Squircle>
  );
};

export default ContentCard;