'use client';
import React, { useState } from "react";
import { Squircle } from 'corner-smoothing';
import { createClient } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { useWatchedContent } from '@/contexts/WatchedContentContext';
import OverviewCards from "../../components/Dashboard/OverviewCards";
import ProgressSection from "../../components/Dashboard/ProgressSection";
import TodaysPick from "../../components/Shared/TodaysPick";
import ContentDetailModal from "../../components/Discover/ContentDetailModal";
import { toast } from 'sonner';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  vote_count?: number;
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date?: string;
  episode_run_time?: number[];
  vote_average?: number;
  vote_count?: number;
}

const DashboardPage: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<{
    content: any;
    type: 'movie' | 'tv';
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isContentWatched } = useWatchedContent();

  const handleContentClick = (content: any, type: 'movie' | 'tv') => {
    setSelectedContent({ content, type });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  return (
    <main className="min-h-screen py-8 px-4 md:px-12">
      {/* <NavBar /> */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#082408]">
          Good morning, Talyawy!
        </h1>
        <h4 className="ml-2 text-black/40">Overview</h4>
        <OverviewCards />
        <div className="mt-8">
          <h4 className="ml-2 text-black/40">Progress</h4>
          <ProgressSection />
        </div>
        {/* Today's Pick section */}
        <TodaysPick onContentClick={handleContentClick} />
        {/* TODO: Add ActivityFeed, ReviewWords */}
      </div>

      {/* Content Detail Modal */}
      <ContentDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        content={selectedContent ? {
          ...selectedContent.content,
          type: selectedContent.type
        } : null}
      />
    </main>
  );
};

export default DashboardPage;
