'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ id: string; title: string; description: string }>;
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-brand-accent">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-brand-accent h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center flex-1 relative",
                  index < steps.length - 1 && "after:content-[''] after:absolute after:top-4 after:left-1/2 after:w-full after:h-0.5 after:bg-muted after:-z-10",
                  index < currentStep && "after:bg-brand-accent"
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 mb-2",
                    isCompleted && "bg-brand-accent text-white",
                    isCurrent && "bg-brand-accent text-white ring-4 ring-brand-accent/20",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-20 leading-tight",
                    isCompleted && "text-brand-accent",
                    isCurrent && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepProgress;
