import React, { useEffect, useState } from 'react';
import { Squircle } from 'corner-smoothing';
import { createClient } from '@/lib/supabase';
import { X, Play, Check, Star, Calendar, Clock, Users } from 'lucide-react';
import { useWatchedContent } from '@/contexts/WatchedContentContext';
import { toast } from 'sonner';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: number;
    title: string;
    name?: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date?: string;
    first_air_date?: string;
    runtime?: number;
    episode_run_time?: number[];
    vote_average?: number;
    vote_count?: number;
    type: 'movie' | 'tv';
  } | null;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  episode_number: number;
  season_number: number;
}

interface EpisodeWithWatchedStatus extends Episode {
  isWatched: boolean;
}

const ContentDetailModal: React.FC<ContentDetailModalProps> = ({
  isOpen,
  onClose,
  content
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [episodes, setEpisodes] = useState<EpisodeWithWatchedStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);
  const [seasons, setSeasons] = useState<number[]>([]);
  const [showEpisodes, setShowEpisodes] = useState(false);

  const {
    isContentWatched,
    isEpisodeWatched,
    toggleContentWatched,
    toggleEpisodeWatched
  } = useWatchedContent();

  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

  useEffect(() => {
    if (content && isOpen) {
      loadContentDetails();
      if (content.type === 'tv') {
        fetchSeasons();
      }
    }
  }, [content, isOpen]);

  const loadContentDetails = async () => {
    if (!content) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('watched_content')
        .select('rating, notes')
        .eq('user_id', user.id)
        .eq('content_id', content.id)
        .eq('content_type', content.type)
        .single();

      if (data) {
        setRating(data.rating);
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error loading content details:', error);
    }
  };

  const fetchSeasons = async () => {
    if (!content || content.type !== 'tv' || !TMDB_API_KEY) return;

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${content.id}?api_key=${TMDB_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const seasonNumbers = Array.from(
          { length: data.number_of_seasons },
          (_, i) => i + 1
        );
        setSeasons(seasonNumbers);
        if (seasonNumbers.length > 0) {
          fetchEpisodes(seasonNumbers[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchEpisodes = async (seasonNumber: number) => {
    if (!content || content.type !== 'tv' || !TMDB_API_KEY) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${content.id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        const episodesWithStatus = (data.episodes || []).map((episode: Episode) => ({
          ...episode,
          isWatched: isEpisodeWatched(content.id, episode.season_number, episode.episode_number)
        }));
        setEpisodes(episodesWithStatus);
        setActiveSeason(seasonNumber);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!content) return;

    const result = await toggleContentWatched(content);

    if (result.success) {
      // Show success toast
      if (result.isWatched) {
        toast.success('Added to watched list!', {
          description: result.message,
          duration: 3000,
        });
      } else {
        toast.info('Removed from watched list', {
          description: result.message,
          duration: 3000,
        });
      }

      // Refresh episodes if they're shown
      if (showEpisodes && content.type === 'tv') {
        fetchEpisodes(activeSeason);
      }
    } else {
      // Show error toast
      toast.error('Failed to update watched status', {
        description: result.message,
        duration: 4000,
      });
    }
  };

  const handleEpisodeToggle = async (episode: Episode) => {
    if (!content) return;

    const result = await toggleEpisodeWatched(episode, content.id, content.title || content.name || '');

    if (result.success) {
      // Show success toast
      if (result.isWatched) {
        toast.success('Episode marked as watched!', {
          description: result.message,
          duration: 3000,
        });
      } else {
        toast.info('Episode removed from watched list', {
          description: result.message,
          duration: 3000,
        });
      }

      // Update local state optimistically
      setEpisodes(prevEpisodes =>
        prevEpisodes.map(ep =>
          ep.id === episode.id
            ? { ...ep, isWatched: result.isWatched }
            : ep
        )
      );
    } else {
      // Show error toast
      toast.error('Failed to update episode status', {
        description: result.message,
        duration: 4000,
      });
    }
  };

  if (!isOpen || !content) return null;

  const title = content.title || content.name || '';
  const releaseDate = content.release_date || content.first_air_date;
  const runtime = content.runtime || (content.episode_run_time && content.episode_run_time[0]);
  const isWatched = isContentWatched(content.id, content.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative h-64">
          <img
            src={`${BACKDROP_BASE_URL}${content.backdrop_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <div className="flex gap-6 mb-6">
            {/* Poster */}
            <img
              src={`${IMAGE_BASE_URL}${content.poster_path}`}
              alt={title}
              className="w-32 h-48 object-cover rounded-lg"
            />

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#082408] mb-2">{title}</h2>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                {releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(releaseDate).getFullYear()}
                  </div>
                )}
                {runtime && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {runtime} min
                  </div>
                )}
                {content.vote_average && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    {content.vote_average.toFixed(1)}
                  </div>
                )}
                {content.vote_count && (
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    {content.vote_count.toLocaleString()}
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4">{content.overview}</p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleMarkAsWatched}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isWatched
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-brand-accent text-white hover:bg-[#0a2a0a]'
                    }`}
                >
                  {isWatched ? <Check size={16} /> : <Play size={16} />}
                  {isWatched ? 'Watched' : 'Mark as Watched'}
                </button>

                {content.type === 'tv' && (
                  <button
                    onClick={() => setShowEpisodes(!showEpisodes)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Episodes
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Episodes Section for TV Shows */}
          {content.type === 'tv' && showEpisodes && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-[#082408] mb-4">Episodes</h3>

              {/* Season Selector */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => fetchEpisodes(season)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeSeason === season
                      ? 'bg-brand-accent text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Season {season}
                  </button>
                ))}
              </div>

              {/* Episodes List */}
              {loading ? (
                <div className="text-center py-8">Loading episodes...</div>
              ) : (
                <div className="space-y-3">
                  {episodes.map((episode) => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                      onToggleWatched={() => handleEpisodeToggle(episode)}
                      isWatched={episode.isWatched}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Episode Card Component
const EpisodeCard: React.FC<{
  episode: EpisodeWithWatchedStatus;
  onToggleWatched: () => void;
  isWatched: boolean;
}> = ({ episode, onToggleWatched, isWatched }) => {
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

  return (
    <Squircle
      borderWidth={1}
      cornerRadius={12}
      className={`p-3 flex gap-3 transition-colors ${isWatched ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
    >
      <img
        src={`${IMAGE_BASE_URL}${episode.still_path}`}
        alt={episode.name}
        className="w-20 h-12 object-cover rounded"
      />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">
            {episode.episode_number}. {episode.name}
          </h4>
          <button
            onClick={onToggleWatched}
            className={`p-1 rounded transition-colors ${isWatched ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <Check size={16} />
          </button>
        </div>
        {episode.overview && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {episode.overview}
          </p>
        )}
      </div>
    </Squircle>
  );
};

export default ContentDetailModal; 