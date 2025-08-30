export interface OnboardingData {
  // Language preferences
  targetLanguage: string;

  // Content preferences
  contentType: 'movies' | 'tv' | 'both';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningIntensity: 'casual' | 'regular' | 'intensive';

  // Learning goals
  selectedGoals: string[];
  weeklyStudyTime: number; // in minutes

  // Profile information
  displayName: string;
  nativeLanguage: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';

  // Content discovery preferences
  favoriteGenres: string[];
  contentLength: 'short' | 'long' | 'mixed';
  subtitlePreference: 'native' | 'target' | 'both';
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isRequired: boolean;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  data: Partial<OnboardingData>;
  isCompleted: boolean;
  isLoading: boolean;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface ContentPreference {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface GenrePreference {
  id: string;
  name: string;
  icon: string;
  color: string;
}
