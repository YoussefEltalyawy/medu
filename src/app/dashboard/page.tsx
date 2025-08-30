'use client';
import React, { useState } from "react";
import { Squircle } from 'corner-smoothing';
import { createClient } from '@/lib/supabase';
import { Check } from 'lucide-react';
import { useWatchedContent } from '@/contexts/WatchedContentContext';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
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
  const { isOnboardingCompleted, isChecking } = useOnboardingStatus();
  const { profile, loading: profileLoading } = useUserProfile();

  // Generate personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    const displayName = profile?.display_name || 'there';
    return `${timeGreeting}, ${displayName}!`;
  };

  const handleContentClick = (content: any, type: 'movie' | 'tv') => {
    setSelectedContent({ content, type });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  // Show loading while checking onboarding status or profile
  if (isChecking || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if not completed
  if (!isOnboardingCompleted) {
    return null; // Will redirect via the hook
  }

  return (
    <main className="min-h-screen py-8 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {getGreeting()}
        </h1>
        <h4 className="ml-2 text-black/40 mb-2">Overview</h4>
        <OverviewCards />
        <div className="mt-4">
          <h4 className="ml-2 text-black/40 mb-2">Progress</h4>
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
