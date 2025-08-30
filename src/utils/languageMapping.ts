import { LanguageMapping } from '@/types/content';

// Language mapping for TMDB API parameters
export const LANGUAGE_MAPPINGS: Record<string, LanguageMapping> = {
  'German': { 
    code: 'de-DE', 
    originalCode: 'de',
    name: 'German'
  },
  'French': { 
    code: 'fr-FR', 
    originalCode: 'fr',
    name: 'French'
  },
  'Spanish': { 
    code: 'es-ES', 
    originalCode: 'es',
    name: 'Spanish'
  },
  'English': { 
    code: 'en-US', 
    originalCode: 'en',
    name: 'English'
  },
  'Italian': { 
    code: 'it-IT', 
    originalCode: 'it',
    name: 'Italian'
  },
  'Portuguese': { 
    code: 'pt-PT', 
    originalCode: 'pt',
    name: 'Portuguese'
  },
  'Dutch': { 
    code: 'nl-NL', 
    originalCode: 'nl',
    name: 'Dutch'
  },
  'Russian': { 
    code: 'ru-RU', 
    originalCode: 'ru',
    name: 'Russian'
  },
  'Japanese': { 
    code: 'ja-JP', 
    originalCode: 'ja',
    name: 'Japanese'
  },
  'Korean': { 
    code: 'ko-KR', 
    originalCode: 'ko',
    name: 'Korean'
  },
  'Chinese': { 
    code: 'zh-CN', 
    originalCode: 'zh',
    name: 'Chinese'
  }
};

/**
 * Get language mapping for TMDB API based on user's target language
 * @param language - User's target language (e.g., 'German', 'French')
 * @returns LanguageMapping object with API codes
 */
export function getLanguageMapping(language: string): LanguageMapping {
  const mapping = LANGUAGE_MAPPINGS[language];
  
  if (!mapping) {
    console.warn(`Language mapping not found for: ${language}. Defaulting to German.`);
    return LANGUAGE_MAPPINGS['German'];
  }
  
  return mapping;
}

/**
 * Get prioritized language mapping with fallback logic
 * Prioritizes user's selected language over system defaults
 * @param userLanguage - User's preferred language
 * @param fallbackLanguage - Fallback language if user language not supported
 * @returns LanguageMapping object with API codes
 */
export function getPrioritizedLanguageMapping(
  userLanguage: string, 
  fallbackLanguage: string = 'German'
): LanguageMapping {
  // First try user's preferred language
  if (isLanguageSupported(userLanguage)) {
    return getLanguageMapping(userLanguage);
  }
  
  // Try fallback language
  if (isLanguageSupported(fallbackLanguage)) {
    console.warn(`User language '${userLanguage}' not supported. Using fallback: ${fallbackLanguage}`);
    return getLanguageMapping(fallbackLanguage);
  }
  
  // Ultimate fallback to German
  console.warn(`Neither user language '${userLanguage}' nor fallback '${fallbackLanguage}' supported. Using German.`);
  return LANGUAGE_MAPPINGS['German'];
}

/**
 * Get all available language mappings
 * @returns Array of all supported language mappings
 */
export function getAllLanguageMappings(): LanguageMapping[] {
  return Object.values(LANGUAGE_MAPPINGS);
}

/**
 * Check if a language is supported
 * @param language - Language to check
 * @returns boolean indicating if language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return language in LANGUAGE_MAPPINGS;
}

/**
 * Get language name from language code
 * @param code - Language code (e.g., 'de', 'fr')
 * @returns Language name or null if not found
 */
export function getLanguageNameFromCode(code: string): string | null {
  const mapping = Object.values(LANGUAGE_MAPPINGS).find(
    lang => lang.originalCode === code || lang.code === code
  );
  
  return mapping ? mapping.name : null;
}