'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OnboardingNavigation from '../OnboardingNavigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Film, Tv, BookOpen, Target, Zap, Coffee, Clock } from 'lucide-react';

interface PreferencesStepProps {
  onComplete: () => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ onComplete }) => {
  const { state, updateData } = useOnboarding();

  const contentTypes = [
    {
      id: 'movies',
      label: 'Movies',
      description: 'Feature films and documentaries',
      icon: Film,
    },
    {
      id: 'tv',
      label: 'TV Shows',
      description: 'Series and episodes',
      icon: Tv,
    },
    {
      id: 'both',
      label: 'Both',
      description: 'Mix of movies and TV shows',
      icon: BookOpen,
    },
  ];

  const difficultyLevels = [
    {
      id: 'beginner',
      label: 'Beginner',
      description: 'A1-C1 level content',
      icon: Target,
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      description: 'B1-C2 level content',
      icon: Target,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'C1-C2 level content',
      icon: Target,
      color: 'bg-red-100 text-red-800 border-red-200',
    },
  ];

  const learningIntensities = [
    {
      id: 'casual',
      label: 'Casual',
      description: '15-30 minutes per day',
      icon: Coffee,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'regular',
      label: 'Regular',
      description: '30-60 minutes per day',
      icon: Clock,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'intensive',
      label: 'Intensive',
      description: '1-2 hours per day',
      icon: Zap,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
    },
  ];

  const handleContentTypeSelect = (type: 'movies' | 'tv' | 'both') => {
    updateData({ contentType: type });
  };

  const handleDifficultySelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    updateData({ difficultyLevel: level });
  };

  const handleIntensitySelect = (intensity: 'casual' | 'regular' | 'intensive') => {
    updateData({ learningIntensity: intensity });
  };

  const isNextDisabled = !state.data.contentType || !state.data.difficultyLevel || !state.data.learningIntensity;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-brand-accent" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          Learning Preferences
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Customize your learning experience by selecting your preferences for content and study intensity.
        </p>
      </div>

      {/* Content Type Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          What type of content do you prefer?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contentTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.data.contentType === type.id
                  ? 'border-2 border-brand-accent bg-brand-accent/5'
                  : 'border-2 border-border hover:border-brand-accent/30'
                }`}
              onClick={() => handleContentTypeSelect(type.id as 'movies' | 'tv' | 'both')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <type.icon className="w-6 h-6 text-brand-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {type.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Difficulty Level Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          What's your current proficiency level?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficultyLevels.map((level) => (
            <Card
              key={level.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.data.difficultyLevel === level.id
                  ? 'border-2 border-brand-accent bg-brand-accent/5'
                  : 'border-2 border-border hover:border-brand-accent/30'
                }`}
              onClick={() => handleDifficultySelect(level.id as 'beginner' | 'intermediate' | 'advanced')}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${level.color}`}>
                  <level.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {level.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {level.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Learning Intensity Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          How much time can you dedicate to learning?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningIntensities.map((intensity) => (
            <Card
              key={intensity.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.data.learningIntensity === intensity.id
                  ? 'border-2 border-brand-accent bg-brand-accent/5'
                  : 'border-2 border-border hover:border-brand-accent/30'
                }`}
              onClick={() => handleIntensitySelect(intensity.id as 'casual' | 'regular' | 'intensive')}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${intensity.color}`}>
                  <intensity.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {intensity.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {intensity.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Preferences Summary */}
      {(state.data.contentType || state.data.difficultyLevel || state.data.learningIntensity) && (
        <div className="p-4 bg-brand-accent/5 rounded-lg border border-brand-accent/20">
          <h3 className="text-sm font-medium text-brand-accent mb-2">Selected Preferences:</h3>
          <div className="flex flex-wrap gap-2">
            {state.data.contentType && (
              <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-sm">
                {contentTypes.find(t => t.id === state.data.contentType)?.label}
              </span>
            )}
            {state.data.difficultyLevel && (
              <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-sm">
                {difficultyLevels.find(d => d.id === state.data.difficultyLevel)?.label}
              </span>
            )}
            {state.data.learningIntensity && (
              <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-sm">
                {learningIntensities.find(i => i.id === state.data.learningIntensity)?.label}
              </span>
            )}
          </div>
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

export default PreferencesStep;
