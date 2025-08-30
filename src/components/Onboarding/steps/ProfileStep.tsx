'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import OnboardingNavigation from '../OnboardingNavigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { User, Globe, Star } from 'lucide-react';
import { getAllLanguageMappings } from '@/utils/languageMapping';

interface ProfileStepProps {
  onComplete: () => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ onComplete }) => {
  const { state, updateData } = useOnboarding();
  const [displayName, setDisplayName] = useState(state.data.displayName || '');
  const [nativeLanguage, setNativeLanguage] = useState(state.data.nativeLanguage || 'English');
  const [experienceLevel, setExperienceLevel] = useState(state.data.experienceLevel || 'beginner');

  const availableLanguages = getAllLanguageMappings();
  const nativeLanguageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Other', label: 'Other' },
  ];

  const experienceLevels = [
    {
      id: 'beginner',
      label: 'Beginner',
      description: 'New to language learning or starting from scratch',
      icon: Star,
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      description: 'Some experience, can hold basic conversations',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'Experienced learner, comfortable with complex topics',
      icon: Star,
      color: 'bg-red-100 text-red-800 border-red-200',
    },
  ];

  const handleDisplayNameChange = (name: string) => {
    setDisplayName(name);
    updateData({ displayName: name });
  };

  const handleNativeLanguageChange = (language: string) => {
    setNativeLanguage(language);
    updateData({ nativeLanguage: language });
  };

  const handleExperienceLevelChange = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setExperienceLevel(level);
    updateData({ experienceLevel: level });
  };

  const isNextDisabled = !displayName.trim() || !nativeLanguage || !experienceLevel;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-brand-accent" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          Complete Your Profile
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us a bit about yourself to personalize your learning experience.
        </p>
      </div>

      {/* Display Name */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          What should we call you?
        </h2>

        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter your display name..."
            value={displayName}
            onChange={(e) => handleDisplayNameChange(e.target.value)}
            className="text-center text-lg border-2 border-border focus:border-brand-accent focus:ring-brand-accent/20 py-3"
          />
        </div>
      </div>

      {/* Native Language */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          What's your native language?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {nativeLanguageOptions.map((language) => (
            <Card
              key={language.value}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${nativeLanguage === language.value
                  ? 'border-2 border-brand-accent bg-brand-accent/5'
                  : 'border-2 border-border hover:border-brand-accent/30'
                }`}
              onClick={() => handleNativeLanguageChange(language.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-5 h-5 text-brand-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {language.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground text-center">
          What's your experience with language learning?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {experienceLevels.map((level) => (
            <Card
              key={level.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${experienceLevel === level.id
                  ? 'border-2 border-brand-accent bg-brand-accent/5'
                  : 'border-2 border-border hover:border-brand-accent/30'
                }`}
              onClick={() => handleExperienceLevelChange(level.id as 'beginner' | 'intermediate' | 'advanced')}
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

      {/* Profile Summary */}
      {(displayName || nativeLanguage || experienceLevel) && (
        <div className="p-4 bg-brand-accent/5 rounded-lg border border-brand-accent/20">
          <h3 className="text-sm font-medium text-brand-accent mb-2">Profile Summary:</h3>
          <div className="space-y-2">
            {displayName && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Display Name:</span>
                <span className="font-medium text-foreground">{displayName}</span>
              </div>
            )}
            {nativeLanguage && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Native Language:</span>
                <span className="font-medium text-foreground">{nativeLanguage}</span>
              </div>
            )}
            {experienceLevel && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Experience Level:</span>
                <span className="font-medium text-foreground capitalize">{experienceLevel}</span>
              </div>
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

export default ProfileStep;
