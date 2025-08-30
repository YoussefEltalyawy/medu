'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import OnboardingNavigation from '../OnboardingNavigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Target, BookOpen, MessageSquare, Headphones, Calendar, Clock } from 'lucide-react';

interface GoalsStepProps {
  onComplete: () => void;
}

const GoalsStep: React.FC<GoalsStepProps> = ({ onComplete }) => {
  const { state, updateData } = useOnboarding();
  const [customGoal, setCustomGoal] = useState('');

  const goalTemplates = [
    {
      id: 'vocabulary',
      title: 'Build Vocabulary',
      description: 'Learn new words and phrases daily',
      icon: BookOpen,
      category: 'Language Skills',
    },
    {
      id: 'speaking',
      title: 'Improve Speaking',
      description: 'Practice pronunciation and conversation',
      icon: MessageSquare,
      category: 'Communication',
    },
    {
      id: 'listening',
      title: 'Enhance Listening',
      description: 'Better understand native speakers',
      icon: Headphones,
      category: 'Comprehension',
    },
    {
      id: 'grammar',
      title: 'Master Grammar',
      description: 'Learn proper sentence structure',
      icon: Target,
      category: 'Language Skills',
    },
    {
      id: 'culture',
      title: 'Cultural Understanding',
      description: 'Learn about customs and traditions',
      icon: Target,
      category: 'Cultural',
    },
    {
      id: 'fluency',
      title: 'Achieve Fluency',
      description: 'Speak naturally and confidently',
      icon: Target,
      category: 'Advanced',
    },
  ];

  const weeklyStudyTimeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];

  const handleGoalToggle = (goalId: string) => {
    const currentGoals = state.data.selectedGoals || [];
    const updatedGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(id => id !== goalId)
      : [...currentGoals, goalId];

    updateData({ selectedGoals: updatedGoals });
  };

  const handleCustomGoalAdd = () => {
    if (customGoal.trim()) {
      const currentGoals = state.data.selectedGoals || [];
      const updatedGoals = [...currentGoals, customGoal.trim()];
      updateData({ selectedGoals: updatedGoals });
      setCustomGoal('');
    }
  };

  const handleCustomGoalRemove = (goalToRemove: string) => {
    const currentGoals = state.data.selectedGoals || [];
    const updatedGoals = currentGoals.filter(goal => goal !== goalToRemove);
    updateData({ selectedGoals: updatedGoals });
  };

  const handleWeeklyStudyTimeChange = (time: number) => {
    updateData({ weeklyStudyTime: time });
  };

  const isNextDisabled = !state.data.selectedGoals || state.data.selectedGoals.length === 0 || !state.data.weeklyStudyTime;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-brand-accent" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          Set Your Learning Goals
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose your learning objectives and set a realistic weekly study time commitment.
        </p>
      </div>

      {/* Learning Goals Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          What do you want to achieve? (Select all that apply)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goalTemplates.map((goal) => (
            <Card
              key={goal.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.data.selectedGoals?.includes(goal.id)
                  ? 'border-2 border-brand-accent bg-brand-accent/5'
                  : 'border-2 border-border hover:border-brand-accent/30'
                }`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <goal.icon className="w-6 h-6 text-brand-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {goal.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {goal.description}
                </p>
                <span className="text-xs text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full">
                  {goal.category}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Goal Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground text-center">
          Add a custom goal
        </h3>

        <div className="flex gap-2 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter your custom goal..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="flex-1 border-2 border-border focus:border-brand-accent focus:ring-brand-accent/20"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomGoalAdd()}
          />
          <button
            onClick={handleCustomGoalAdd}
            disabled={!customGoal.trim()}
            className="px-4 py-2 bg-brand-accent text-white rounded-md hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Weekly Study Time */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          How much time can you commit weekly?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {weeklyStudyTimeOptions.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.data.weeklyStudyTime === option.value
                  ? 'border-2 border-brand-accent bg-brand-accent/5'
                  : 'border-2 border-border hover:border-brand-accent/30'
                }`}
              onClick={() => handleWeeklyStudyTimeChange(option.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-brand-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Goals Summary */}
      {state.data.selectedGoals && state.data.selectedGoals.length > 0 && (
        <div className="p-4 bg-brand-accent/5 rounded-lg border border-brand-accent/20">
          <h3 className="text-sm font-medium text-brand-accent mb-2">Selected Goals:</h3>
          <div className="flex flex-wrap gap-2">
            {state.data.selectedGoals.map((goal, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-sm flex items-center gap-2"
              >
                {goal}
                <button
                  onClick={() => handleCustomGoalRemove(goal)}
                  className="w-4 h-4 rounded-full bg-brand-accent/20 hover:bg-brand-accent/30 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Study Time Display */}
      {state.data.weeklyStudyTime && (
        <div className="text-center p-4 bg-brand-accent/5 rounded-lg border border-brand-accent/20">
          <p className="text-sm text-muted-foreground mb-1">Weekly Study Commitment:</p>
          <p className="text-lg font-semibold text-brand-accent">
            {state.data.weeklyStudyTime} minutes per week
          </p>
        </div>
      )}

      {/* Navigation */}
      <OnboardingNavigation
        nextDisabled={isNextDisabled}
        nextLabel="Continue"
      />
    </div>
  );
};

export default GoalsStep;
