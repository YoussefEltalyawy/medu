import React from "react";
import OverviewCards from "../../components/Dashboard/OverviewCards";
import ProgressSection from "../../components/Dashboard/ProgressSection";
import TodaysPick from "../../components/Shared/TodaysPick";

const DashboardPage: React.FC = () => {
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
        <TodaysPick />
        {/* TODO: Add ActivityFeed, ReviewWords */}
      </div>
    </main>
  );
};

export default DashboardPage;
