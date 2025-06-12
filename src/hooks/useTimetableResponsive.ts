import { useState, useMemo, useCallback, useEffect } from 'react';
import { TimetableItem } from './useTimetableView';

export interface DaySchedule {
  period: { number: number; time: string };
  class: TimetableItem | undefined;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface LayoutConfig {
  showTimeColumn: boolean;
  compactMode: boolean;
  stackedLayout: boolean;
  cardView: boolean;
  maxVisibleDays: number;
  maxVisiblePeriods: number;
}

export interface TimetableModal {
  selectedClass: TimetableItem | null;
  isModalOpen: boolean;
}

export interface UseTimetableResponsiveReturn {
  // Screen information
  screenSize: ScreenSize;
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  
  // Layout configuration
  layoutConfig: LayoutConfig;
  
  // Modal state
  modal: TimetableModal;
  
  // Responsive data processing
  getVisibleDays: (allDays: string[]) => string[];
  getVisiblePeriods: (allPeriods: { number: number; time: string }[]) => { number: number; time: string }[];
  getDayClasses: (dayIndex: number, timetableData: TimetableItem[]) => DaySchedule[];
  getOptimalLayout: () => 'grid' | 'list' | 'card';
  
  // Touch and gesture handlers
  handleClassClick: (classItem: TimetableItem) => void;
  handleSwipeLeft: () => void;
  handleSwipeRight: () => void;
  handlePinchZoom: (scale: number) => void;
  
  // Modal management
  openModal: (classItem: TimetableItem) => void;
  closeModal: () => void;
  
  // Layout utilities
  getGridColumns: () => number;
  getGridRows: () => number;
  calculateClassCardHeight: (classItem: TimetableItem) => string;
  getResponsiveClassName: (baseClass: string) => string;
  
  // Responsive helpers
  shouldShowElement: (element: 'timeColumn' | 'dayHeader' | 'emptySlots' | 'classDetails') => boolean;
  getClassDisplayStyle: (classItem: TimetableItem) => 'full' | 'compact' | 'minimal';
  getTouchTargetSize: () => number;
  
  // Navigation for mobile
  currentDayIndex: number;
  navigateToDay: (dayIndex: number) => void;
  navigateToPreviousDay: () => void;
  navigateToNextDay: () => void;
}

const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  showTimeColumn: true,
  compactMode: false,
  stackedLayout: false,
  cardView: false,
  maxVisibleDays: 5,
  maxVisiblePeriods: 7
};

export const useTimetableResponsive = (
  timetableData: TimetableItem[],
  periods: { number: number; time: string }[],
  daysOfWeek: string[]
): UseTimetableResponsiveReturn => {
  // Screen size state
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });
  
  // Modal state
  const [selectedClass, setSelectedClass] = useState<TimetableItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Navigation state for mobile
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  
  // Screen size detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < DEFAULT_BREAKPOINTS.mobile,
        isTablet: width >= DEFAULT_BREAKPOINTS.mobile && width < DEFAULT_BREAKPOINTS.desktop,
        isDesktop: width >= DEFAULT_BREAKPOINTS.desktop
      });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);
  
  // Current breakpoint
  const currentBreakpoint = useMemo((): 'mobile' | 'tablet' | 'desktop' => {
    if (screenSize.isMobile) return 'mobile';
    if (screenSize.isTablet) return 'tablet';
    return 'desktop';
  }, [screenSize]);
  
  // Layout configuration based on screen size
  const layoutConfig = useMemo((): LayoutConfig => {
    const config = { ...DEFAULT_LAYOUT_CONFIG };
    
    if (screenSize.isMobile) {
      config.showTimeColumn = false;
      config.compactMode = true;
      config.stackedLayout = true;
      config.cardView = true;
      config.maxVisibleDays = 1;
      config.maxVisiblePeriods = 5;
    } else if (screenSize.isTablet) {
      config.showTimeColumn = true;
      config.compactMode = true;
      config.stackedLayout = false;
      config.cardView = false;
      config.maxVisibleDays = 3;
      config.maxVisiblePeriods = 6;
    }
    
    return config;
  }, [screenSize]);
  
  // Modal management
  const modal: TimetableModal = useMemo(() => ({
    selectedClass,
    isModalOpen
  }), [selectedClass, isModalOpen]);
  
  // Responsive data processing
  const getVisibleDays = useCallback((allDays: string[]): string[] => {
    if (layoutConfig.stackedLayout && layoutConfig.maxVisibleDays === 1) {
      return [allDays[currentDayIndex] || allDays[0]];
    }
    return allDays.slice(0, layoutConfig.maxVisibleDays);
  }, [layoutConfig, currentDayIndex]);
  
  const getVisiblePeriods = useCallback((allPeriods: { number: number; time: string }[]): { number: number; time: string }[] => {
    return allPeriods.slice(0, layoutConfig.maxVisiblePeriods);
  }, [layoutConfig.maxVisiblePeriods]);
  
  const getDayClasses = useCallback((dayIndex: number, data: TimetableItem[]): DaySchedule[] => {
    return periods
      .map(period => ({ 
        period, 
        class: data.find(item => 
          item.dayOfWeek === dayIndex + 1 && item.period === period.number
        )
      }))
      .filter(item => item.class || !layoutConfig.compactMode);
  }, [periods, layoutConfig.compactMode]);
  
  const getOptimalLayout = useCallback((): 'grid' | 'list' | 'card' => {
    if (layoutConfig.cardView) return 'card';
    if (layoutConfig.stackedLayout) return 'list';
    return 'grid';
  }, [layoutConfig]);
  
  // Touch and gesture handlers
  const handleClassClick = useCallback((classItem: TimetableItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  }, []);
  
  const handleSwipeLeft = useCallback(() => {
    if (currentDayIndex < daysOfWeek.length - 1) {
      setCurrentDayIndex(prev => prev + 1);
    }
  }, [currentDayIndex, daysOfWeek.length]);
  
  const handleSwipeRight = useCallback(() => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(prev => prev - 1);
    }
  }, [currentDayIndex]);
  
  const handlePinchZoom = useCallback((scale: number) => {
    // Could implement zoom functionality for timetable
    console.log('Pinch zoom:', scale);
  }, []);
  
  // Modal management
  const openModal = useCallback((classItem: TimetableItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedClass(null);
  }, []);
  
  // Layout utilities
  const getGridColumns = useCallback((): number => {
    const visibleDays = getVisibleDays(daysOfWeek);
    return visibleDays.length + (layoutConfig.showTimeColumn ? 1 : 0);
  }, [getVisibleDays, daysOfWeek, layoutConfig.showTimeColumn]);
  
  const getGridRows = useCallback((): number => {
    const visiblePeriods = getVisiblePeriods(periods);
    return visiblePeriods.length + 1; // +1 for header
  }, [getVisiblePeriods, periods]);
  
  const calculateClassCardHeight = useCallback((): string => {
    if (layoutConfig.compactMode) {
      return '4rem'; // 64px
    }
    return '6rem'; // 96px
  }, [layoutConfig.compactMode]);
  
  const getResponsiveClassName = useCallback((baseClass: string): string => {
    const breakpointPrefix = currentBreakpoint;
    return `${baseClass} ${baseClass}--${breakpointPrefix}`;
  }, [currentBreakpoint]);
  
  // Responsive helpers
  const shouldShowElement = useCallback((element: 'timeColumn' | 'dayHeader' | 'emptySlots' | 'classDetails'): boolean => {
    switch (element) {
      case 'timeColumn':
        return layoutConfig.showTimeColumn;
      case 'dayHeader':
        return !layoutConfig.stackedLayout || layoutConfig.maxVisibleDays > 1;
      case 'emptySlots':
        return !layoutConfig.compactMode;
      case 'classDetails':
        return !layoutConfig.compactMode;
      default:
        return true;
    }
  }, [layoutConfig]);
  
  const getClassDisplayStyle = useCallback((): 'full' | 'compact' | 'minimal' => {
    if (screenSize.isMobile) return 'minimal';
    if (layoutConfig.compactMode) return 'compact';
    return 'full';
  }, [screenSize.isMobile, layoutConfig.compactMode]);
  
  const getTouchTargetSize = useCallback((): number => {
    // Return touch target size in pixels
    return screenSize.isMobile ? 44 : 32;
  }, [screenSize.isMobile]);
  
  // Navigation for mobile
  const navigateToDay = useCallback((dayIndex: number) => {
    if (dayIndex >= 0 && dayIndex < daysOfWeek.length) {
      setCurrentDayIndex(dayIndex);
    }
  }, [daysOfWeek.length]);
  
  const navigateToPreviousDay = useCallback(() => {
    handleSwipeRight();
  }, [handleSwipeRight]);
  
  const navigateToNextDay = useCallback(() => {
    handleSwipeLeft();
  }, [handleSwipeLeft]);
  
  return {
    // Screen information
    screenSize,
    currentBreakpoint,
    
    // Layout configuration
    layoutConfig,
    
    // Modal state
    modal,
    
    // Responsive data processing
    getVisibleDays,
    getVisiblePeriods,
    getDayClasses,
    getOptimalLayout,
    
    // Touch and gesture handlers
    handleClassClick,
    handleSwipeLeft,
    handleSwipeRight,
    handlePinchZoom,
    
    // Modal management
    openModal,
    closeModal,
    
    // Layout utilities
    getGridColumns,
    getGridRows,
    calculateClassCardHeight,
    getResponsiveClassName,
    
    // Responsive helpers
    shouldShowElement,
    getClassDisplayStyle,
    getTouchTargetSize,
    
    // Navigation for mobile
    currentDayIndex,
    navigateToDay,
    navigateToPreviousDay,
    navigateToNextDay
  };
};