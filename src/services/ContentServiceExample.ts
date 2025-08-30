// Example usage of ContentService
// This file demonstrates how to use the ContentService class

import { contentService } from './ContentService';
import { DiscoverParams, SearchParams } from '@/types/content';

/**
 * Example: Discover German movies and TV shows
 */
export async function discoverGermanContent() {
  try {
    // Get language mapping for German
    const languageMapping = contentService.getLanguageMapping('German');
    
    // Set up discover parameters
    const params: DiscoverParams = {
      language: languageMapping.code,        // 'de-DE'
      originalLanguage: languageMapping.originalCode, // 'de'
      page: 1,
      contentType: 'all' // Get both movies and TV shows
    };

    // Discover content
    const result = await contentService.discoverContent(params);
    
    console.log(`Found ${result.totalResults} items across ${result.totalPages} pages`);
    console.log(`Page ${result.page} contains ${result.results.length} items`);
    
    // Log first few items
    result.results.slice(0, 3).forEach(item => {
      console.log(`${item.type.toUpperCase()}: ${item.title} (${item.original_language})`);
    });

    return result;
  } catch (error) {
    console.error('Error discovering German content:', error);
    throw error;
  }
}

/**
 * Example: Search for specific content in French
 */
export async function searchFrenchContent(query: string) {
  try {
    // Get language mapping for French
    const languageMapping = contentService.getLanguageMapping('French');
    
    // Set up search parameters
    const params: SearchParams = {
      query,
      language: languageMapping.code,        // 'fr-FR'
      page: 1,
      contentType: 'all' // Search both movies and TV shows
    };

    // Search content
    const result = await contentService.searchContent(params);
    
    console.log(`Search for "${query}" found ${result.totalResults} results`);
    
    // Log search results
    result.results.forEach(item => {
      console.log(`${item.type.toUpperCase()}: ${item.title} (Rating: ${item.vote_average})`);
    });

    return result;
  } catch (error) {
    console.error('Error searching French content:', error);
    throw error;
  }
}

/**
 * Example: Discover only movies in Spanish
 */
export async function discoverSpanishMovies() {
  try {
    const languageMapping = contentService.getLanguageMapping('Spanish');
    
    const params: DiscoverParams = {
      language: languageMapping.code,
      originalLanguage: languageMapping.originalCode,
      page: 1,
      contentType: 'movie' // Only movies
    };

    const result = await contentService.discoverContent(params);
    
    console.log(`Found ${result.totalResults} Spanish movies`);
    
    return result;
  } catch (error) {
    console.error('Error discovering Spanish movies:', error);
    throw error;
  }
}

/**
 * Example: Get trending content
 */
export async function getTrendingContent() {
  try {
    const languageMapping = contentService.getLanguageMapping('English');
    
    const result = await contentService.getTrendingContent(languageMapping.code, 'all');
    
    console.log(`Found ${result.results.length} trending items`);
    
    return result;
  } catch (error) {
    console.error('Error getting trending content:', error);
    throw error;
  }
}

/**
 * Example: Paginated content discovery
 */
export async function paginatedDiscovery(userLanguage: string, maxPages: number = 3) {
  try {
    const languageMapping = contentService.getLanguageMapping(userLanguage);
    const allResults = [];
    
    for (let page = 1; page <= maxPages; page++) {
      const params: DiscoverParams = {
        language: languageMapping.code,
        originalLanguage: languageMapping.originalCode,
        page,
        contentType: 'all'
      };

      const result = await contentService.discoverContent(params);
      allResults.push(...result.results);
      
      console.log(`Page ${page}: ${result.results.length} items`);
      
      // Break if we've reached the last page
      if (page >= result.totalPages) {
        break;
      }
    }
    
    console.log(`Total collected: ${allResults.length} items`);
    return allResults;
  } catch (error) {
    console.error('Error in paginated discovery:', error);
    throw error;
  }
}