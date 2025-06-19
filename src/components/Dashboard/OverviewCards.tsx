import React from 'react';
import DashboardCard from './DashboardCard';

const OverviewCards: React.FC = () => {
  // Mock data
  const learnedWords = 1256;
  const streak = 365;
  const currentLevel = 'A1';

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <DashboardCard
        title="Learned Words"
        value={`${learnedWords} Words`}
      />
      <DashboardCard
        title="Streak"
        value={`${streak} Days`}
      />
      <DashboardCard
        title="Current Level"
        value={currentLevel}
      />
    </div>
  );
};

export default OverviewCards; 