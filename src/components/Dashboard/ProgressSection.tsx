"use client";
import React from "react";
import { Squircle } from "corner-smoothing";
import ProgressBar from "./ProgressBar";

const weeklyGoals = [
  { label: "Complete 15 podcast episodes", value: 10, max: 15 },
  { label: "Learn 30 new words", value: 25, max: 30 },
  { label: "Watch 2 movies", value: 1, max: 2 },
];

const todayGoals = [
  { label: "Complete 15 podcast episodes", value: 10, max: 15 },
  { label: "Learn 30 new words", value: 25, max: 30 },
  { label: "Watch 2 movies", value: 1, max: 2 },
];

const ProgressSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Weekly Goals */}
      <Squircle
        borderWidth={2}
        cornerRadius={25}
        className="bg-[#5E7850]/20 text-brand-light-green px-5 py-6 flex flex-col gap-4 before:bg-white"
      >
        <h2 className="text-lg font-semibold text-brand-green">Weekly Goals</h2>
        <div className="flex flex-col gap-4">
          {weeklyGoals.map((goal, i) => (
            <ProgressBar
              key={i}
              value={goal.value}
              max={goal.max}
              label={goal.label}
            />
          ))}
        </div>
      </Squircle>
      {/* Recent Activity */}
      <Squircle
        borderWidth={2}
        cornerRadius={25}
        className="bg-[#5E7850]/20 text-brand-light-green px-5 py-6 flex flex-col gap-4 before:bg-white"
      >
        <h2 className="text-lg font-semibold text-brand-green">Recent Activity</h2>
        <ul className="list-disc list-inside text-brand-green">
          <li>Watched Dark S1E3</li>
          <li>How to sell drugs online S1E2</li>
          <li>Hotel Matze - Mathias Döpfner</li>
        </ul>
      </Squircle>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full md:col-span-2">
        {/* What did you learn today? */}
        <Squircle
          borderWidth={2}
          cornerRadius={25}
          className="bg-[#5E7850]/20 text-brand-light-green px-5 py-6 flex flex-col gap-4 before:bg-white md:col-span-3"
        >
          <h2 className="text-lg font-semibold text-brand-green">What did you learn today?</h2>
          <textarea
            className="w-full h-24 p-2 rounded-md bg-white/50 text-brand-green placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-brand-green"
            placeholder="Today I learned ......"
          ></textarea>
          <div className="flex justify-end">
            <button className="bg-brand-green text-white px-4 py-2 rounded-md text-sm">
              Save Journal Entry
            </button>
          </div>
        </Squircle>

        {/* Review Words */}
        <Squircle
          borderWidth={2}
          cornerRadius={25}
          className="bg-[#5E7850]/20 text-brand-light-green px-5 py-6 flex flex-col gap-4 before:bg-white md:col-span-1"
        >
          <h2 className="text-lg font-semibold text-brand-green">Review Words</h2>
          <p className="text-brand-green text-base">
            You have 2 words to review.
            <br />
            Keep your vocab sharp!
          </p>
          <div className="flex justify-center mt-auto">
            <button className="w-full bg-brand-green text-white px-4 py-2 rounded-md text-sm">
              Go To Flashcards
            </button>
          </div>
        </Squircle>
      </div>
    </div>
  );
};

export default ProgressSection;