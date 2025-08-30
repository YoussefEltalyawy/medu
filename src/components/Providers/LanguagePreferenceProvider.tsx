'use client';
import React from 'react';
import { LanguagePreferenceProvider } from '@/contexts/LanguagePreferenceContext';

interface ClientLanguageProviderProps {
  children: React.ReactNode;
}

/**
 * Client-side wrapper for LanguagePreferenceProvider
 * This ensures the provider only runs on the client side
 */
export const ClientLanguageProvider: React.FC<ClientLanguageProviderProps> = ({ children }) => {
  return (
    <LanguagePreferenceProvider>
      {children}
    </LanguagePreferenceProvider>
  );
};