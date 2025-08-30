'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import StepProgress from './StepProgress';
import WelcomeStep from './steps/WelcomeStep';
import LanguageStep from './steps/LanguageStep';
import PreferencesStep from './steps/PreferencesStep';
import GoalsStep from './steps/GoalsStep';
import ProfileStep from './steps/ProfileStep';
import CompletionStep from './steps/CompletionStep';
import { toast } from 'sonner';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Welcome to Medu',
    component: WelcomeStep,
  },
  {
    id: 'language',
    title: 'Choose Language',
    description: 'Select your target language',
    component: LanguageStep,
  },
  {
    id: 'preferences',
    title: 'Learning Preferences',
    description: 'Customize your experience',
    component: PreferencesStep,
  },
  {
    id: 'goals',
    title: 'Learning Goals',
    description: 'Set your learning objectives',
    component: GoalsStep,
  },
  {
    id: 'profile',
    title: 'Profile Setup',
    description: 'Complete your profile',
    component: ProfileStep,
  },
  {
    id: 'completion',
    title: 'All Set!',
    description: 'You\'re ready to start learning',
    component: CompletionStep,
  },
];

const OnboardingContainer: React.FC = () => {
  const { state, completeOnboarding } = useOnboarding();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Redirect to dashboard if onboarding is already completed
  useEffect(() => {
    if (state.isCompleted) {
      router.push('/dashboard');
    }
  }, [state.isCompleted, router]);

  // Handle onboarding completion
  const handleComplete = async () => {
    try {
      await completeOnboarding();
      toast.success('Welcome to Medu! Your profile has been set up successfully.');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
      console.error('Onboarding completion error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const CurrentStepComponent = STEPS[state.currentStep]?.component;

  if (!CurrentStepComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
          <p className="text-muted-foreground">Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <StepProgress
        currentStep={state.currentStep}
        totalSteps={state.totalSteps}
        steps={STEPS}
      />

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CurrentStepComponent onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default OnboardingContainer;
