'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

interface OnboardingNavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  className?: string;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  showBack = true,
  showNext = true,
  nextDisabled = false,
  nextLoading = false,
  className = '',
}) => {
  const { state, nextStep, previousStep } = useOnboarding();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      previousStep();
    }
  };

  return (
    <div className={cn("flex justify-between items-center pt-8", className)}>
      {/* Back Button */}
      {showBack && state.currentStep > 0 && (
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>
      )}

      {/* Spacer for center alignment when back button is hidden */}
      {!showBack && <div />}

      {/* Next Button */}
      {showNext && (
        <Button
          onClick={handleNext}
          disabled={nextDisabled || nextLoading}
          className="flex items-center gap-2 px-8 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white"
        >
          {nextLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Setting up...
            </>
          ) : (
            <>
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default OnboardingNavigation;
