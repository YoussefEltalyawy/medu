'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import OnboardingNavigation from '../OnboardingNavigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Brain, Target, Globe, Users } from 'lucide-react';

interface WelcomeStepProps {
  onComplete: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  const { updateData, nextStep } = useOnboarding();

  const handleStart = () => {
    // Set initial data if needed
    updateData({
      targetLanguage: '',
      contentType: 'both',
      difficultyLevel: 'beginner',
      learningIntensity: 'regular',
    });

    // Move to the next step
    nextStep();
  };

  const features = [
    {
      icon: Brain,
      title: 'Smart Learning',
      description: 'Science-backed spaced repetition for optimal retention',
    },
    {
      icon: Target,
      title: 'Personalized Goals',
      description: 'Track your progress with customizable learning objectives',
    },
    {
      icon: Globe,
      title: 'Rich Content',
      description: 'Learn through movies, TV shows, and curated materials',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with fellow language learners',
    },
  ];

  return (
    <div className="text-center space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-center mb-6">
          <Image
            src="/medu-logo.svg"
            alt="Medu Logo"
            width={120}
            height={60}
            className="opacity-80"
          />
        </div>

        <h1 className="text-4xl font-bold text-foreground">
          Welcome to Medu
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your cozy language learning hub designed with empathy, immersion, and usability in mind.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 border-border hover:border-brand-accent/30 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="space-y-4">
        <p className="text-lg text-muted-foreground">
          Let's personalize your learning experience in just a few steps.
        </p>

        <OnboardingNavigation
          onNext={handleStart}
          nextLabel="Get Started"
          showBack={false}
        />

        {/* Debug button */}
        <button
          onClick={() => {
            console.log('Debug button clicked');
            console.log('Current onboarding state:', useOnboarding());
          }}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Debug Button
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
