'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useUserLanguage } from '@/hooks/useUserLanguage';
import { LanguageMapping } from '@/types/content';

interface LanguagePreferenceContextType {
  // Language state
  userLanguage: string;
  languageMapping: LanguageMapping;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateUserLanguage: (newLanguage: string) => Promise<void>;
  refreshUserLanguage: () => Promise<void>;
  
  // Computed values
  isLanguageSupported: boolean;
}

const LanguagePreferenceContext = createContext<LanguagePreferenceContextType | undefined>(undefined);

interface LanguagePreferenceProviderProps {
  children: ReactNode;
}

export const LanguagePreferenceProvider: React.FC<LanguagePreferenceProviderProps> = ({ children }) => {
  const languageData = useUserLanguage();

  return (
    <LanguagePreferenceContext.Provider value={languageData}>
      {children}
    </LanguagePreferenceContext.Provider>
  );
};

export const useLanguagePreference = (): LanguagePreferenceContextType => {
  const context = useContext(LanguagePreferenceContext);
  if (context === undefined) {
    throw new Error('useLanguagePreference must be used within a LanguagePreferenceProvider');
  }
  return context;
};

// Higher-order component for language-aware components
export function withLanguagePreference<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const languagePreference = useLanguagePreference();
    
    return (
      <Component 
        {...props} 
        languagePreference={languagePreference}
      />
    );
  };

  WrappedComponent.displayName = `withLanguagePreference(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}