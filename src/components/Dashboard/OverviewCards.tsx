'use client';
import React, { useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';
import { useUserStats } from '@/hooks/useUserStats';
import { useVocabulary } from '@/hooks/useVocabulary';

const OverviewCards: React.FC = () => {
  const { stats, loading: statsLoading, fetchStats } = useUserStats();
  const { words, loading: wordsLoading, fetchWords } = useVocabulary();
  const [learnedWords, setLearnedWords] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchWords();
  }, [fetchStats, fetchWords]);

  useEffect(() => {
    if (words) {
      // Count words with 'mastered' status
      const masteredCount = words.filter(word => word.status === 'mastered').length;
      setLearnedWords(masteredCount);
    }
  }, [words]);

  if (statsLoading || wordsLoading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <DashboardCard title="Learned Words" value="Loading..." />
        <DashboardCard title="Streak" value="Loading..." />
        <DashboardCard title="Current Level" value="Loading..." />
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <DashboardCard
        title="Learned Words"
        value={`${learnedWords} Words`}
      />
      <DashboardCard
        title="Streak"
        value={`${stats?.current_streak || 0} Days`}
      />
      <DashboardCard
        title="Current Level"
        value={stats?.current_level || 'A1'}
      />
    </div>
  );
};

export default OverviewCards; 