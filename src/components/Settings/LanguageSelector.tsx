import React, { useState } from 'react';
import { useLanguagePreference } from '@/contexts/LanguagePreferenceContext';
import { getAllLanguageMappings } from '@/utils/languageMapping';
import { Check, Globe, Loader2 } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = "",
  showLabel = true 
}) => {
  const { 
    userLanguage, 
    updateUserLanguage, 
    isLoading,
    error 
  } = useLanguagePreference();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const availableLanguages = getAllLanguageMappings();

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === userLanguage || isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      await updateUserLanguage(newLanguage);
      
      // Show success feedback briefly
      setTimeout(() => {
        setUpdateError(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update language';
      setUpdateError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 size={20} className="animate-spin text-gray-400" />
        <span className="text-gray-500">Loading language preferences...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe size={16} className="inline mr-2" />
          Target Language for Content Discovery
        </label>
      )}
      
      <div className="space-y-2">
        {availableLanguages.map((language) => (
          <button
            key={language.originalCode}
            onClick={() => handleLanguageChange(language.name)}
            disabled={isUpdating}
            className={`
              w-full flex items-center justify-between p-3 rounded-lg border transition-all
              ${userLanguage === language.name
                ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{language.name}</span>
              <span className="text-sm text-gray-500">({language.originalCode.toUpperCase()})</span>
            </div>
            
            {userLanguage === language.name && (
              <Check size={16} className="text-brand-accent" />
            )}
            
            {isUpdating && userLanguage === language.name && (
              <Loader2 size={16} className="animate-spin" />
            )}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {(error || updateError) && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            {updateError || error}
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-3 text-sm text-gray-500">
        <p>
          This determines the language of movies and TV shows you'll discover. 
          Content will be shown in your selected language when available.
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;