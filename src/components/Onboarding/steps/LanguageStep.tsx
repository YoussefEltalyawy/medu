'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import OnboardingNavigation from '../OnboardingNavigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Search, Globe } from 'lucide-react';
import { getAllLanguageMappings } from '@/utils/languageMapping';

interface LanguageStepProps {
  onComplete: () => void;
}

const LanguageStep: React.FC<LanguageStepProps> = ({ onComplete }) => {
  const { state, updateData } = useOnboarding();
  const [searchTerm, setSearchTerm] = useState('');

  const availableLanguages = getAllLanguageMappings();
  const filteredLanguages = availableLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageSelect = (languageName: string) => {
    updateData({ targetLanguage: languageName });
  };

  const isNextDisabled = !state.data.targetLanguage;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-brand-accent" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          Choose Your Target Language
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the language you want to learn. We'll curate content and learning materials specifically for you.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 text-base border-2 border-border focus:border-brand-accent focus:ring-brand-accent/20"
        />
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLanguages.map((language) => (
          <Card
            key={language.code}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${state.data.targetLanguage === language.name
                ? 'border-2 border-brand-accent bg-brand-accent/5'
                : 'border-2 border-border hover:border-brand-accent/30'
              }`}
            onClick={() => handleLanguageSelect(language.name)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-brand-accent">
                  {language.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {language.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language.code}
              </p>

              {/* Selection Indicator */}
              {state.data.targetLanguage === language.name && (
                <div className="mt-3">
                  <div className="w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Language Display */}
      {state.data.targetLanguage && (
        <div className="text-center p-4 bg-brand-accent/5 rounded-lg border border-brand-accent/20">
          <p className="text-sm text-muted-foreground mb-1">Selected Language:</p>
          <p className="text-lg font-semibold text-brand-accent">
            {state.data.targetLanguage}
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

export default LanguageStep;
