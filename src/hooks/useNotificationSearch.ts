import { useState, useMemo, useCallback } from 'react';
import { Notification } from './useNotificationActions';

export interface SearchFilters {
  query: string;
  searchFields: ('title' | 'content' | 'author' | 'department' | 'tags')[];
  caseSensitive: boolean;
  wholeWords: boolean;
}

export interface SearchResult {
  notification: Notification;
  matches: {
    field: string;
    excerpt: string;
    highlightedExcerpt: string;
  }[];
  score: number;
}

export interface UseNotificationSearchReturn {
  // Search state
  searchQuery: string;
  searchFilters: SearchFilters;
  isSearching: boolean;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchFields: (fields: ('title' | 'content' | 'author' | 'department' | 'tags')[]) => void;
  setCaseSensitive: (sensitive: boolean) => void;
  setWholeWords: (wholeWords: boolean) => void;
  clearSearch: () => void;
  
  // Search functions
  search: (notifications: Notification[]) => SearchResult[];
  quickSearch: (notifications: Notification[], query: string) => Notification[];
  
  // Search utilities
  highlightMatches: (text: string, query: string) => string;
  getSearchStats: (notifications: Notification[]) => {
    totalNotifications: number;
    matchedNotifications: number;
    totalMatches: number;
  };
  
  // Recent searches
  recentSearches: string[];
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
}

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: '',
  searchFields: ['title', 'content', 'author'],
  caseSensitive: false,
  wholeWords: false
};

const MAX_RECENT_SEARCHES = 10;

export const useNotificationSearch = (): UseNotificationSearchReturn => {
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFields, setSearchFields] = useState<('title' | 'content' | 'author' | 'department' | 'tags')[]>(
    DEFAULT_SEARCH_FILTERS.searchFields
  );
  const [caseSensitive, setCaseSensitive] = useState<boolean>(DEFAULT_SEARCH_FILTERS.caseSensitive);
  const [wholeWords, setWholeWords] = useState<boolean>(DEFAULT_SEARCH_FILTERS.wholeWords);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Search actions
  const setSearchQueryValue = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(search => search !== query);
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // Utility functions
  const highlightMatches = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    let regex: RegExp;
    if (wholeWords) {
      regex = new RegExp(`\\b${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
    } else {
      regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
    }
    
    return text.replace(regex, '<mark>$&</mark>');
  }, [caseSensitive, wholeWords]);

  // Search functions
  const search = useCallback((notifications: Notification[]): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    
    const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    
    notifications.forEach(notification => {
      const matches: SearchResult['matches'] = [];
      let totalScore = 0;
      
      // Search in different fields
      searchFields.forEach(field => {
        let fieldText = '';
        let fieldWeight = 1;
        
        switch (field) {
          case 'title':
            fieldText = notification.title;
            fieldWeight = 3; // Title matches are more important
            break;
          case 'content':
            fieldText = notification.content;
            fieldWeight = 2;
            break;
          case 'author':
            fieldText = notification.author;
            fieldWeight = 1.5;
            break;
          case 'department':
            fieldText = notification.department;
            fieldWeight = 1;
            break;
          case 'tags':
            fieldText = notification.tags.join(' ');
            fieldWeight = 1.2;
            break;
        }
        
        const searchText = caseSensitive ? fieldText : fieldText.toLowerCase();
        
        let regex: RegExp;
        if (wholeWords) {
          regex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
        } else {
          regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
        }
        
        const matchResults = [...searchText.matchAll(regex)];
        
        if (matchResults.length > 0) {
          // Create excerpt around the first match
          const firstMatch = matchResults[0];
          const matchIndex = firstMatch.index || 0;
          const excerptStart = Math.max(0, matchIndex - 50);
          const excerptEnd = Math.min(fieldText.length, matchIndex + 100);
          const excerpt = fieldText.slice(excerptStart, excerptEnd);
          
          matches.push({
            field,
            excerpt: excerpt,
            highlightedExcerpt: highlightMatches(excerpt, query)
          });
          
          // Calculate score based on number of matches and field weight
          totalScore += matchResults.length * fieldWeight;
        }
      });
      
      if (matches.length > 0) {
        results.push({
          notification,
          matches,
          score: totalScore
        });
      }
    });
    
    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }, [searchQuery, searchFields, caseSensitive, wholeWords, highlightMatches]);

  const quickSearch = useCallback((notifications: Notification[], query: string): Notification[] => {
    if (!query.trim()) return notifications;
    
    const searchText = caseSensitive ? query : query.toLowerCase();
    
    return notifications.filter(notification => {
      const fields = [
        notification.title,
        notification.content,
        notification.author,
        notification.department,
        ...notification.tags
      ];
      
      return fields.some(field => {
        const fieldText = caseSensitive ? field : field.toLowerCase();
        return fieldText.includes(searchText);
      });
    });
  }, [caseSensitive]);

  const getSearchStats = useCallback((notifications: Notification[]) => {
    const searchResults = search(notifications);
    const totalMatches = searchResults.reduce((sum, result) => 
      sum + result.matches.reduce((matchSum) => matchSum + 1, 0), 0
    );
    
    return {
      totalNotifications: notifications.length,
      matchedNotifications: searchResults.length,
      totalMatches
    };
  }, [search]);

  // Computed values
  const searchFilters: SearchFilters = useMemo(() => ({
    query: searchQuery,
    searchFields,
    caseSensitive,
    wholeWords
  }), [searchQuery, searchFields, caseSensitive, wholeWords]);

  return {
    // Search state
    searchQuery,
    searchFilters,
    isSearching,
    
    // Search actions
    setSearchQuery: setSearchQueryValue,
    setSearchFields,
    setCaseSensitive,
    setWholeWords,
    clearSearch,
    
    // Search functions
    search,
    quickSearch,
    
    // Search utilities
    highlightMatches,
    getSearchStats,
    
    // Recent searches
    recentSearches,
    addToRecentSearches,
    clearRecentSearches
  };
};