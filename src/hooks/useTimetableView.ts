import { useState, useMemo, useCallback } from 'react';

// Timetable types (shared across timetable hooks)
export interface TimetableItem {
  id: string;
  subject: string;
  professor: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 0: 日, 1: 月, 2: 火, 3: 水, 4: 木, 5: 金, 6: 土
  period: number; // 1-7時限
  color: string;
}

export interface Period {
  number: number;
  time: string;
}

export interface ViewMode {
  type: 'week' | 'day';
  label: string;
}

export interface ViewSettings {
  currentView: ViewMode;
  showEmptySlots: boolean;
  showWeekends: boolean;
  compactMode: boolean;
}

export interface UseTimetableViewReturn {
  // View settings
  viewSettings: ViewSettings;
  availableViews: ViewMode[];
  
  // View data
  periods: Period[];
  daysOfWeek: string[];
  currentWeekDays: string[];
  
  // View actions
  setViewMode: (viewMode: ViewMode) => void;
  toggleEmptySlots: () => void;
  toggleWeekends: () => void;
  toggleCompactMode: () => void;
  resetViewSettings: () => void;
  
  // Layout helpers
  getDisplayDays: () => string[];
  getDisplayPeriods: () => Period[];
  shouldShowSlot: (dayIndex: number, period: number) => boolean;
  getGridColumns: () => number;
  
  // Responsive helpers
  isMobileView: () => boolean;
  getOptimalLayout: () => 'grid' | 'list';
}

const DEFAULT_PERIODS: Period[] = [
  { number: 1, time: '09:00-10:30' },
  { number: 2, time: '10:40-12:10' },
  { number: 3, time: '13:00-14:30' },
  { number: 4, time: '14:40-16:10' },
  { number: 5, time: '16:20-17:50' },
  { number: 6, time: '18:00-19:30' },
  { number: 7, time: '19:40-21:10' }
];

const DEFAULT_DAYS_OF_WEEK = ['月', '火', '水', '木', '金'];
const WEEKEND_DAYS = ['土', '日'];

const AVAILABLE_VIEWS: ViewMode[] = [
  { type: 'week', label: '週表示' },
  { type: 'day', label: '日表示' }
];

const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  currentView: { type: 'week', label: '週表示' },
  showEmptySlots: true,
  showWeekends: false,
  compactMode: false
};

export const useTimetableView = (): UseTimetableViewReturn => {
  // View state
  const [currentView, setCurrentView] = useState<ViewMode>(DEFAULT_VIEW_SETTINGS.currentView);
  const [showEmptySlots, setShowEmptySlots] = useState<boolean>(DEFAULT_VIEW_SETTINGS.showEmptySlots);
  const [showWeekends, setShowWeekends] = useState<boolean>(DEFAULT_VIEW_SETTINGS.showWeekends);
  const [compactMode, setCompactMode] = useState<boolean>(DEFAULT_VIEW_SETTINGS.compactMode);
  
  // Constants
  const periods = DEFAULT_PERIODS;
  const daysOfWeek = DEFAULT_DAYS_OF_WEEK;
  const availableViews = AVAILABLE_VIEWS;
  
  // View actions
  const setViewMode = useCallback((viewMode: ViewMode) => {
    setCurrentView(viewMode);
  }, []);
  
  const toggleEmptySlots = useCallback(() => {
    setShowEmptySlots(prev => !prev);
  }, []);
  
  const toggleWeekends = useCallback(() => {
    setShowWeekends(prev => !prev);
  }, []);
  
  const toggleCompactMode = useCallback(() => {
    setCompactMode(prev => !prev);
  }, []);
  
  const resetViewSettings = useCallback(() => {
    setCurrentView(DEFAULT_VIEW_SETTINGS.currentView);
    setShowEmptySlots(DEFAULT_VIEW_SETTINGS.showEmptySlots);
    setShowWeekends(DEFAULT_VIEW_SETTINGS.showWeekends);
    setCompactMode(DEFAULT_VIEW_SETTINGS.compactMode);
  }, []);
  
  // Layout helpers
  const getDisplayDays = useCallback((): string[] => {
    const baseDays = [...daysOfWeek];
    if (showWeekends) {
      return [...baseDays, ...WEEKEND_DAYS];
    }
    return baseDays;
  }, [daysOfWeek, showWeekends]);
  
  const getDisplayPeriods = useCallback((): Period[] => {
    if (compactMode) {
      // In compact mode, show only periods 1-5
      return periods.slice(0, 5);
    }
    return periods;
  }, [periods, compactMode]);
  
  const shouldShowSlot = useCallback((): boolean => {
    if (!showEmptySlots) {
      // Logic would need timetable data to determine if slot is empty
      // For now, always show slots when showEmptySlots is true
      return true;
    }
    return true;
  }, [showEmptySlots]);
  
  const getGridColumns = useCallback((): number => {
    const displayDays = getDisplayDays();
    return displayDays.length + 1; // +1 for time column
  }, [getDisplayDays]);
  
  // Responsive helpers
  const isMobileView = useCallback((): boolean => {
    // This would typically use a media query hook
    // For now, return false as placeholder
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, []);
  
  const getOptimalLayout = useCallback((): 'grid' | 'list' => {
    if (isMobileView() || currentView.type === 'day') {
      return 'list';
    }
    return 'grid';
  }, [isMobileView, currentView]);
  
  // Computed view settings
  const viewSettings: ViewSettings = useMemo(() => ({
    currentView,
    showEmptySlots,
    showWeekends,
    compactMode
  }), [currentView, showEmptySlots, showWeekends, compactMode]);
  
  const currentWeekDays = useMemo(() => getDisplayDays(), [getDisplayDays]);
  
  return {
    // View settings
    viewSettings,
    availableViews,
    
    // View data
    periods,
    daysOfWeek,
    currentWeekDays,
    
    // View actions
    setViewMode,
    toggleEmptySlots,
    toggleWeekends,
    toggleCompactMode,
    resetViewSettings,
    
    // Layout helpers
    getDisplayDays,
    getDisplayPeriods,
    shouldShowSlot,
    getGridColumns,
    
    // Responsive helpers
    isMobileView,
    getOptimalLayout
  };
};