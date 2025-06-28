"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useUserStats } from "@/hooks/useUserStats";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useReflections } from "@/hooks/useReflections";
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { StatusCard } from "@/components/vocabulary/StatusCard";
import { Clock, CheckCircle, BookOpen } from "lucide-react";

const brandColors = {
  learning: "#240808", // red
  familiar: "#4E4211", // yellow
  mastered: "#082408", // green
};

const AnalyticsSection: React.FC = () => {
  const { stats, fetchStats, loading: statsLoading } = useUserStats();
  const { words, loading: vocabLoading, fetchWords } = useVocabulary();
  const { reflections, loading: reflLoading, fetchReflections } = useReflections();
  const [wordsChartData, setWordsChartData] = useState<any[]>([]);
  const [studyTimeData, setStudyTimeData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchWords();
    fetchReflections();
  }, [fetchStats, fetchWords, fetchReflections]);

  useEffect(() => {
    // Words status chart data
    const statusCounts = { learning: 0, familiar: 0, mastered: 0 };
    words.forEach(w => {
      if (w.status === "learning") statusCounts.learning++;
      if (w.status === "familiar") statusCounts.familiar++;
      if (w.status === "mastered") statusCounts.mastered++;
    });
    setWordsChartData([
      { status: "Learning", key: "learning", count: statusCounts.learning },
      { status: "Familiar", key: "familiar", count: statusCounts.familiar },
      { status: "Mastered", key: "mastered", count: statusCounts.mastered },
    ]);
    // Study time per day (last 7 days)
    const byDate: Record<string, number> = {};
    reflections.forEach(r => {
      const date = r.date || r.created_at?.slice(0, 10) || "";
      if (!date) return;
      byDate[date] = (byDate[date] || 0) + (r.study_time || 0);
    });
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: key, minutes: byDate[key] || 0 };
    });
    setStudyTimeData(last7);
  }, [words, reflections]);

  if (statsLoading || vocabLoading || reflLoading) return <div className="text-center py-8">Loading analytics...</div>;

  // Calculate real, useful data for the 4 main cards
  const currentStreak = stats?.current_streak || 0;
  const longestStreak = stats?.longest_streak || 0;
  const totalStudyMinutes = stats?.total_study_time ? Math.round(Number(stats.total_study_time) / 60) : 0;
  const wordsLearned = stats?.words_learned || 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard
          title="Current Streak"
          count={currentStreak}
          icon={Clock}
          bgColor="bg-[#082408]"
          textColor="text-[#e6f2e6]"
        />
        <StatusCard
          title="Longest Streak"
          count={longestStreak}
          icon={CheckCircle}
          bgColor="bg-[#082408]"
          textColor="text-[#e6f2e6]"
        />
        <StatusCard
          title="Total Study Time"
          count={totalStudyMinutes}
          suffix="min"
          icon={Clock}
          bgColor="bg-[#082408]"
          textColor="text-[#e6f2e6]"
        />
        <StatusCard
          title="Words Learned"
          count={wordsLearned}
          icon={BookOpen}
          bgColor="bg-[#082408]"
          textColor="text-[#e6f2e6]"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="text-lg font-semibold mb-2">Vocabulary Progress</div>
          <ChartContainer config={{
            learning: { label: "Learning", color: brandColors.learning },
            familiar: { label: "Familiar", color: brandColors.familiar },
            mastered: { label: "Mastered", color: brandColors.mastered },
          }} className="min-h-[200px] w-full">
            <BarChart data={wordsChartData} height={200} width={400} barCategoryGap={40}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count">
                {wordsChartData.map((entry, idx) => (
                  <Cell key={entry.key} fill={brandColors[entry.key as keyof typeof brandColors]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-semibold mb-2">Study Time (Last 7 Days)</div>
          <ChartContainer config={{
            minutes: { label: "Minutes", color: brandColors.mastered },
          }} className="min-h-[200px] w-full">
            <BarChart data={studyTimeData} height={200} width={400} barCategoryGap={40}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="minutes" fill={brandColors.mastered} radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
      <Card className="p-6">
        <div className="text-lg font-semibold mb-2">Level Progress</div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-[#082408]">{stats?.current_level || "A1"}</span>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#082408] h-3 rounded-full"
              style={{ width: `${stats?.level_progress || 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{stats?.level_progress || 0}%</span>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsSection; 