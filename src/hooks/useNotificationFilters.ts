import { useState, useMemo, useCallback } from 'react';
import { Notification } from './useNotificationActions';

export interface NotificationFilters {
  selectedCategory: string;
  selectedPriority: string;
  showUnreadOnly: boolean;
  sortBy: 'date' | 'priority' | 'category';
  sortOrder: 'asc' | 'desc';
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface UseNotificationFiltersReturn {
  // Filter state
  filters: NotificationFilters;
  
  // Filter actions
  setCategory: (category: string) => void;
  setPriority: (priority: string) => void;
  setShowUnreadOnly: (show: boolean) => void;
  setSortBy: (sortBy: 'date' | 'priority' | 'category') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  resetFilters: () => void;
  
  // Filter options
  categoryOptions: FilterOption[];
  priorityOptions: FilterOption[];
  sortOptions: FilterOption[];
  
  // Filtering function
  applyFilters: (notifications: Notification[]) => Notification[];
  
  // Statistics
  getFilteredCount: (notifications: Notification[]) => number;
  getFilterStats: (notifications: Notification[]) => {
    totalCount: number;
    filteredCount: number;
    hiddenCount: number;
  };
}

const DEFAULT_FILTERS: NotificationFilters = {
  selectedCategory: 'all',
  selectedPriority: 'all',
  showUnreadOnly: false,
  sortBy: 'date',
  sortOrder: 'desc'
};

export const useNotificationFilters = (): UseNotificationFiltersReturn => {
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_FILTERS.selectedCategory);
  const [selectedPriority, setSelectedPriority] = useState<string>(DEFAULT_FILTERS.selectedPriority);
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(DEFAULT_FILTERS.showUnreadOnly);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'category'>(DEFAULT_FILTERS.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULT_FILTERS.sortOrder);

  // Filter actions
  const setCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const setPriority = useCallback((priority: string) => {
    setSelectedPriority(priority);
  }, []);

  const setShowUnreadOnlyValue = useCallback((show: boolean) => {
    setShowUnreadOnly(show);
  }, []);

  const setSortByValue = useCallback((sort: 'date' | 'priority' | 'category') => {
    setSortBy(sort);
  }, []);

  const setSortOrderValue = useCallback((order: 'asc' | 'desc') => {
    setSortOrder(order);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory(DEFAULT_FILTERS.selectedCategory);
    setSelectedPriority(DEFAULT_FILTERS.selectedPriority);
    setShowUnreadOnly(DEFAULT_FILTERS.showUnreadOnly);
    setSortBy(DEFAULT_FILTERS.sortBy);
    setSortOrder(DEFAULT_FILTERS.sortOrder);
  }, []);

  // Filter options
  const categoryOptions: FilterOption[] = useMemo(() => [
    { value: 'all', label: 'すべてのカテゴリ' },
    { value: '重要', label: '重要' },
    { value: '一般', label: '一般' },
    { value: 'イベント', label: 'イベント' },
    { value: 'システム', label: 'システム' },
    { value: '休講', label: '休講' },
    { value: 'レポート', label: 'レポート' }
  ], []);

  const priorityOptions: FilterOption[] = useMemo(() => [
    { value: 'all', label: 'すべての優先度' },
    { value: 'urgent', label: '緊急' },
    { value: 'high', label: '高' },
    { value: 'normal', label: '普通' },
    { value: 'low', label: '低' }
  ], []);

  const sortOptions: FilterOption[] = useMemo(() => [
    { value: 'date', label: '日付順' },
    { value: 'priority', label: '優先度順' },
    { value: 'category', label: 'カテゴリ順' }
  ], []);

  // Filtering and sorting function
  const applyFilters = useCallback((notifications: Notification[]): Notification[] => {
    const filtered = notifications.filter(notification => {
      // Category filter
      if (selectedCategory !== 'all' && notification.category !== selectedCategory) {
        return false;
      }
      
      // Priority filter
      if (selectedPriority !== 'all' && notification.priority !== selectedPriority) {
        return false;
      }
      
      // Unread filter
      if (showUnreadOnly && notification.read) {
        return false;
      }
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [selectedCategory, selectedPriority, showUnreadOnly, sortBy, sortOrder]);

  // Utility functions
  const getFilteredCount = useCallback((notifications: Notification[]): number => {
    return applyFilters(notifications).length;
  }, [applyFilters]);

  const getFilterStats = useCallback((notifications: Notification[]) => {
    const totalCount = notifications.length;
    const filteredCount = applyFilters(notifications).length;
    const hiddenCount = totalCount - filteredCount;
    
    return {
      totalCount,
      filteredCount,
      hiddenCount
    };
  }, [applyFilters]);

  return {
    // Filter state
    filters: {
      selectedCategory,
      selectedPriority,
      showUnreadOnly,
      sortBy,
      sortOrder
    },
    
    // Filter actions
    setCategory,
    setPriority,
    setShowUnreadOnly: setShowUnreadOnlyValue,
    setSortBy: setSortByValue,
    setSortOrder: setSortOrderValue,
    toggleSortOrder,
    resetFilters,
    
    // Filter options
    categoryOptions,
    priorityOptions,
    sortOptions,
    
    // Filtering function
    applyFilters,
    
    // Statistics
    getFilteredCount,
    getFilterStats
  };
};