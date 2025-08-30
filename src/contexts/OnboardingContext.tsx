'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingData, OnboardingState } from '@/types/onboarding';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase';

interface OnboardingContextType {
  state: OnboardingState;
  updateData: (data: Partial<OnboardingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

const INITIAL_DATA: Partial<OnboardingData> = {
  targetLanguage: '',
  contentType: 'both',
  difficultyLevel: 'beginner',
  learningIntensity: 'regular',
  selectedGoals: [],
  weeklyStudyTime: 30,
  displayName: '',
  nativeLanguage: 'English',
  experienceLevel: 'beginner',
  favoriteGenres: [],
  contentLength: 'mixed',
  subtitlePreference: 'both',
};

const TOTAL_STEPS = 6;

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    totalSteps: TOTAL_STEPS,
    data: INITIAL_DATA,
    isCompleted: false,
    isLoading: false,
  });

  // Load onboarding data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('medu-onboarding-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setState(prev => ({
          ...prev,
          data: { ...INITIAL_DATA, ...parsedData },
        }));
      } catch (error) {
        console.error('Error parsing saved onboarding data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medu-onboarding-data', JSON.stringify(state.data));
  }, [state.data]);

  const updateData = (data: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
    }));
  };

  const nextStep = () => {
    if (state.currentStep < state.totalSteps - 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }));
    }
  };

  const previousStep = () => {
    if (state.currentStep > 0) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < state.totalSteps) {
      setState(prev => ({
        ...prev,
        currentStep: step,
      }));
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const supabase = createClient();

      // Update user profile with onboarding data
      const { error: profileError } = await supabase
        .from('users')
        .update({
          target_language: state.data.targetLanguage,
          display_name: state.data.displayName,
          native_language: state.data.nativeLanguage,
          experience_level: state.data.experienceLevel,
          content_preferences: {
            contentType: state.data.contentType,
            difficultyLevel: state.data.difficultyLevel,
            learningIntensity: state.data.learningIntensity,
            favoriteGenres: state.data.favoriteGenres,
            contentLength: state.data.contentLength,
            subtitlePreference: state.data.subtitlePreference,
          },
          learning_goals: state.data.selectedGoals,
          weekly_study_time: state.data.weeklyStudyTime,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Create initial learning goals if any were selected
      if (state.data.selectedGoals && state.data.selectedGoals.length > 0) {
        const goalInserts = state.data.selectedGoals.map(goalId => ({
          user_id: user.id,
          title: goalId,
          target: 1,
          unit: 'sessions',
          description: `Learning goal: ${goalId}`,
          status: 'active',
        }));

        const { error: goalsError } = await supabase
          .from('goals')
          .insert(goalInserts);

        if (goalsError) {
          console.warn('Error creating initial goals:', goalsError);
        }
      }

      // Mark onboarding as completed
      setState(prev => ({
        ...prev,
        isCompleted: true,
        isLoading: false,
      }));

      // Clear localStorage
      localStorage.removeItem('medu-onboarding-data');

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const resetOnboarding = () => {
    setState({
      currentStep: 0,
      totalSteps: TOTAL_STEPS,
      data: INITIAL_DATA,
      isCompleted: false,
      isLoading: false,
    });
    localStorage.removeItem('medu-onboarding-data');
  };

  const value: OnboardingContextType = {
    state,
    updateData,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
