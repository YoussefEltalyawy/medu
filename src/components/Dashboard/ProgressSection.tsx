"use client";
import React, { useEffect, useState } from "react";
import { Squircle } from "corner-smoothing";
import ProgressBar from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/hooks/useGoals";
import { useActivities } from "@/hooks/useActivities";
import { useReflections } from "@/hooks/useReflections";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

const ProgressSection: React.FC = () => {
  const router = useRouter();
  const { goals, loading: goalsLoading, fetchGoals } = useGoals();
  const { filteredActivities, loading: activitiesLoading, fetchThisWeeksActivities } = useActivities();
  const { createReflection, loading: reflectionLoading, getTodaysReflection } = useReflections();
  const { reviewWords, getReviewWordsCount } = useFlashcards();

  const [journalContent, setJournalContent] = useState("");
  const [studyTime, setStudyTime] = useState(30);

  useEffect(() => {
    fetchGoals();
    fetchThisWeeksActivities();
    loadTodaysReflection();
  }, [fetchGoals, fetchThisWeeksActivities]);

  const loadTodaysReflection = async () => {
    const todaysReflection = await getTodaysReflection();
    if (todaysReflection) {
      setJournalContent(todaysReflection.content);
      setStudyTime(todaysReflection.study_time);
    }
  };

  const handleSaveJournal = async () => {
    if (!journalContent.trim()) {
      return;
    }

    const success = await createReflection({
      content: journalContent,
      study_time: studyTime,
      date: new Date().toISOString().split('T')[0]
    });

    if (success) {
      setJournalContent("");
      setStudyTime(30);
      // Refresh activities to show the new journal entry
      fetchThisWeeksActivities();
    }
  };

  const handleStartReview = () => {
    router.push('/learn?tab=flashcards');
  };

  const formatActivityContent = (activity: any) => {
    let content = activity.content;

    // Truncate long content
    if (content.length > 50) {
      content = content.substring(0, 50) + "...";
    }

    // Don't add count - just show the activity once
    return content;
  };

  // Get the count of words to review
  const wordsToReviewCount = getReviewWordsCount();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Weekly Goals */}
      <Squircle
        borderWidth={2}
        cornerRadius={25}
        className="bg-[#5E7850]/20 dark:bg-[#1d1d1d] px-5 py-6 flex flex-col gap-4 before:bg-card"
      >
        <h2 className="text-lg font-semibold dark:text-white">Weekly Goals</h2>
        <div className="flex flex-col gap-4">
          {goalsLoading ? (
            <div className="text-center py-4">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No goals set yet</div>
          ) : (
            goals.map((goal) => (
              <ProgressBar
                key={goal.id}
                value={goal.current || 0}
                max={goal.target}
                label={goal.title}
              />
            ))
          )}
        </div>
      </Squircle>

      {/* Recent Activity */}
      <Squircle
        borderWidth={2}
        cornerRadius={25}
        className="bg-[#5E7850]/20 dark:bg-[#1d1d1d] px-5 py-6 flex flex-col gap-4 before:bg-card"
      >
        <h2 className="text-lg font-semibold">
          Recent Activity
        </h2>
        {activitiesLoading ? (
          <div className="text-center py-4">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No recent activity</div>
        ) : (
          <ul className="list-disc list-inside  custom-bullet">
            {filteredActivities.slice(0, 5).map((activity) => (
              <li key={activity.id} className="text-sm">
                {formatActivityContent(activity)}
              </li>
            ))}
          </ul>
        )}
      </Squircle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full md:col-span-2">
        {/* What did you learn today? */}
        <Squircle
          borderWidth={2}
          cornerRadius={25}
          className="bg-[#5E7850]/20 dark:bg-[#1d1d1d] px-5 py-6 flex flex-col gap-4 before:bg-card md:col-span-3"
        >
          <h2 className="text-lg font-semibold">
            What did you learn today?
          </h2>
          <textarea
            className="w-full h-24 p-2 rounded-md bg-white/50 dark:bg-[#111111] placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            placeholder="Today I learned ......"
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
          ></textarea>
          <div className="flex justify-between items-center">
            {/* Study Time Input */}
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <input
                type="number"
                min="1"
                max="480"
                value={studyTime}
                onChange={(e) => setStudyTime(parseInt(e.target.value) || 30)}
                className="w-16 p-1 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
              <span className="text-sm">minutes</span>
            </div>

            {/* Save Button */}
            <Button
              className="bg-brand-accent text-white px-4 py-2 rounded-md text-sm"
              onClick={handleSaveJournal}
              disabled={reflectionLoading || !journalContent.trim()}
            >
              {reflectionLoading ? "Saving..." : "Save Journal Entry"}
            </Button>
          </div>
        </Squircle>

        {/* Review Cards */}
        <Squircle
          borderWidth={2}
          cornerRadius={25}
          className="bg-[#5E7850]/20 dark:bg-[#1d1d1d] px-5 py-6 flex flex-col gap-4 before:bg-card md:col-span-1"
        >
          <h2 className="text-lg font-semibold">
            Review Cards
          </h2>
          <p className="text-base">
            You have {wordsToReviewCount} words to review.
            <br />
            Keep your vocab sharp!
          </p>
          <div className="flex justify-center mt-auto">
            <Button
              className="w-full bg-brand-accent text-white px-4 py-2 rounded-md text-sm"
              onClick={handleStartReview}
            >
              Start Review
            </Button>
          </div>
        </Squircle>
      </div>
    </div>
  );
};

export default ProgressSection;