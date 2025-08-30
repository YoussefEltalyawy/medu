'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { CheckCircle, Globe, Target, Clock, User, BookOpen } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ onComplete }) => {
  const { state } = useOnboarding();

  const summaryItems = [
    {
      icon: Globe,
      label: 'Target Language',
      value: state.data.targetLanguage,
      color: 'text-blue-600',
    },
    {
      icon: BookOpen,
      label: 'Content Preferences',
      value: `${state.data.contentType} • ${state.data.difficultyLevel} • ${state.data.learningIntensity}`,
      color: 'text-green-600',
    },
    {
      icon: Target,
      label: 'Learning Goals',
      value: state.data.selectedGoals?.length ? `${state.data.selectedGoals.length} goals selected` : 'No goals selected',
      color: 'text-purple-600',
    },
    {
      icon: Clock,
      label: 'Weekly Commitment',
      value: state.data.weeklyStudyTime ? `${state.data.weeklyStudyTime} minutes` : 'Not set',
      color: 'text-orange-600',
    },
    {
      icon: User,
      label: 'Profile',
      value: `${state.data.displayName} • ${state.data.nativeLanguage} • ${state.data.experienceLevel}`,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-4xl font-bold text-foreground">
          You're All Set! 🎉
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your personalized learning experience is ready. Here's what we've set up for you:
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {summaryItems.map((item, index) => (
          <Card key={index} className="border-2 border-border hover:border-brand-accent/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.label}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What's Next Section */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-foreground">
          What's Next?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Globe className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Discover Content</h3>
            <p className="text-sm text-muted-foreground">
              Browse curated movies and TV shows in your target language
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your learning goals and achievements
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Learn Smart</h3>
            <p className="text-sm text-muted-foreground">
              Use spaced repetition flashcards for optimal retention
            </p>
          </div>
        </div>
      </div>

      {/* Personalization Message */}
      <div className="text-center p-6 bg-brand-accent/5 rounded-lg border border-brand-accent/20 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-brand-accent mb-2">
          Your Learning Journey is Personalized
        </h3>
        <p className="text-muted-foreground">
          Based on your preferences, we'll recommend content that matches your level and interests.
          Your dashboard will show progress, goals, and daily recommendations tailored just for you.
        </p>
      </div>

      {/* Completion Button */}
      <div className="text-center">
        <Button
          onClick={onComplete}
          className="px-12 py-4 text-lg bg-brand-accent hover:bg-brand-accent/90 text-white"
        >
          Start Learning with Medu
        </Button>

        <p className="text-sm text-muted-foreground mt-3">
          You can always update your preferences in your profile settings
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;
