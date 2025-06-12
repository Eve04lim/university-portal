import { useState, useMemo, useCallback } from 'react';
import { TimetableItem } from './useTimetableView';

export interface TimetableStatistics {
  totalCredits: number;
  subjectCount: number;
  emptySlots: number;
  busyDays: number;
  averageClassesPerDay: number;
}

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingClasses: TimetableItem[];
  conflictType: 'time' | 'room' | 'professor';
}

export interface UseTimetableEventsReturn {
  // Event data
  timetableData: TimetableItem[];
  statistics: TimetableStatistics;
  
  // Event queries
  getClassForSlot: (dayOfWeek: number, period: number) => TimetableItem | undefined;
  getClassesForDay: (dayOfWeek: number) => TimetableItem[];
  getClassesForPeriod: (period: number) => TimetableItem[];
  getTodaysClasses: () => TimetableItem[];
  getUpcomingClasses: () => TimetableItem[];
  getClassesByProfessor: (professor: string) => TimetableItem[];
  getClassesByRoom: (room: string) => TimetableItem[];
  
  // Event management
  addClass: (classItem: Omit<TimetableItem, 'id'>) => string;
  updateClass: (id: string, updates: Partial<TimetableItem>) => void;
  removeClass: (id: string) => void;
  duplicateClass: (id: string) => string;
  
  // Event validation
  validateClassTime: (dayOfWeek: number, period: number, excludeId?: string) => ConflictInfo;
  isSlotEmpty: (dayOfWeek: number, period: number) => boolean;
  canAddClass: (dayOfWeek: number, period: number) => boolean;
  getTimeConflicts: (classItem: TimetableItem) => TimetableItem[];
  
  // Event utilities
  getClassDuration: (classItem: TimetableItem) => number;
  getWeeklyCredits: () => number;
  getEmptySlots: () => Array<{ dayOfWeek: number; period: number }>;
  searchClasses: (query: string) => TimetableItem[];
  
  // Event sorting and filtering
  sortClassesByTime: (classes: TimetableItem[]) => TimetableItem[];
  sortClassesBySubject: (classes: TimetableItem[]) => TimetableItem[];
  filterClassesByDay: (dayOfWeek: number) => TimetableItem[];
  filterClassesByPeriod: (period: number) => TimetableItem[];
}

const DEFAULT_PERIODS = [
  { number: 1, time: '09:00-10:30' },
  { number: 2, time: '10:40-12:10' },
  { number: 3, time: '13:00-14:30' },
  { number: 4, time: '14:40-16:10' },
  { number: 5, time: '16:20-17:50' },
  { number: 6, time: '18:00-19:30' },
  { number: 7, time: '19:40-21:10' }
];

const DEFAULT_DAYS_OF_WEEK = ['月', '火', '水', '木', '金'];

export const useTimetableEvents = (
  initialTimetableData: TimetableItem[]
): UseTimetableEventsReturn => {
  // Event state
  const [timetableData, setTimetableData] = useState<TimetableItem[]>(initialTimetableData);

  // Event queries
  const getClassForSlot = useCallback((dayOfWeek: number, period: number): TimetableItem | undefined => {
    // dayOfWeek parameter is 0-based (0=Monday), data.dayOfWeek is 1-based (1=Monday)
    return timetableData.find(item => 
      item.dayOfWeek === dayOfWeek + 1 && item.period === period
    );
  }, [timetableData]);

  const getClassesForDay = useCallback((dayOfWeek: number): TimetableItem[] => {
    // dayOfWeek parameter is 0-based (0=Monday), data.dayOfWeek is 1-based (1=Monday)
    return timetableData.filter(item => item.dayOfWeek === dayOfWeek + 1)
      .sort((a, b) => a.period - b.period);
  }, [timetableData]);

  const getClassesForPeriod = useCallback((period: number): TimetableItem[] => {
    return timetableData.filter(item => item.period === period)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }, [timetableData]);

  const getTodaysClasses = useCallback((): TimetableItem[] => {
    const today = new Date().getDay(); // 0: 日, 1: 月, 2: 火, 3: 水, 4: 木, 5: 金, 6: 土
    // Convert JS day (0=Sunday) to our weekday index (0=Monday)
    const weekdayIndex = today === 0 ? 6 : today - 1; // Sunday becomes 6, Mon-Sat becomes 0-5
    return getClassesForDay(weekdayIndex);
  }, [getClassesForDay]);

  const getUpcomingClasses = useCallback((): TimetableItem[] => {
    const now = new Date();
    const today = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
    
    return timetableData.filter(item => {
      const classDay = item.dayOfWeek;
      const classTime = parseInt(item.startTime.replace(':', ''));
      
      // Same day but later time, or future days this week
      return (classDay === today && classTime > currentTime) || 
             (classDay > today && classDay <= 5); // Week days only
    }).sort((a, b) => {
      // Sort by day first, then by time
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.period - b.period;
    });
  }, [timetableData]);

  const getClassesByProfessor = useCallback((professor: string): TimetableItem[] => {
    return timetableData.filter(item => 
      item.professor.toLowerCase().includes(professor.toLowerCase())
    );
  }, [timetableData]);

  const getClassesByRoom = useCallback((room: string): TimetableItem[] => {
    return timetableData.filter(item => 
      item.room.toLowerCase().includes(room.toLowerCase())
    );
  }, [timetableData]);

  // Event management
  const addClass = useCallback((classData: Omit<TimetableItem, 'id'>): string => {
    const id = `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newClass: TimetableItem = {
      ...classData,
      id
    };
    setTimetableData(prev => [...prev, newClass]);
    return id;
  }, []);

  const updateClass = useCallback((id: string, updates: Partial<TimetableItem>) => {
    setTimetableData(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const removeClass = useCallback((id: string) => {
    setTimetableData(prev => prev.filter(item => item.id !== id));
  }, []);

  const duplicateClass = useCallback((id: string): string => {
    const classToClone = timetableData.find(item => item.id === id);
    if (!classToClone) {
      console.warn(`Class with id ${id} not found for duplication`);
      return '';
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...classData } = classToClone;
    return addClass(classData);
  }, [timetableData, addClass]);

  // Event validation
  const validateClassTime = useCallback((
    dayOfWeek: number, 
    period: number, 
    excludeId?: string
  ): ConflictInfo => {
    // dayOfWeek parameter is 0-based (0=Monday), data.dayOfWeek is 1-based (1=Monday)
    const conflictingClasses = timetableData.filter(item => 
      item.dayOfWeek === dayOfWeek + 1 && 
      item.period === period &&
      (!excludeId || item.id !== excludeId)
    );

    return {
      hasConflict: conflictingClasses.length > 0,
      conflictingClasses,
      conflictType: 'time'
    };
  }, [timetableData]);

  const isSlotEmpty = useCallback((dayOfWeek: number, period: number): boolean => {
    return !getClassForSlot(dayOfWeek, period);
  }, [getClassForSlot]);

  const canAddClass = useCallback((dayOfWeek: number, period: number): boolean => {
    const conflict = validateClassTime(dayOfWeek, period);
    return !conflict.hasConflict;
  }, [validateClassTime]);

  const getTimeConflicts = useCallback((classItem: TimetableItem): TimetableItem[] => {
    return timetableData.filter(item =>
      item.id !== classItem.id &&
      item.dayOfWeek === classItem.dayOfWeek &&
      item.period === classItem.period
    );
  }, [timetableData]);

  // Event utilities
  const getClassDuration = useCallback((classItem: TimetableItem): number => {
    // Calculate duration in minutes
    const start = classItem.startTime.split(':').map(Number);
    const end = classItem.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes - startMinutes;
  }, []);

  const getWeeklyCredits = useCallback((): number => {
    // Assume each class is worth 2 credits on average
    return timetableData.length * 2;
  }, [timetableData]);

  const getEmptySlots = useCallback((): Array<{ dayOfWeek: number; period: number }> => {
    const emptySlots: Array<{ dayOfWeek: number; period: number }> = [];
    
    for (let day = 0; day < DEFAULT_DAYS_OF_WEEK.length; day++) {
      for (let period = 1; period <= DEFAULT_PERIODS.length; period++) {
        if (isSlotEmpty(day, period)) {
          emptySlots.push({ dayOfWeek: day, period });
        }
      }
    }
    
    return emptySlots;
  }, [isSlotEmpty]);

  const searchClasses = useCallback((query: string): TimetableItem[] => {
    const searchTerm = query.toLowerCase();
    return timetableData.filter(item =>
      item.subject.toLowerCase().includes(searchTerm) ||
      item.professor.toLowerCase().includes(searchTerm) ||
      item.room.toLowerCase().includes(searchTerm)
    );
  }, [timetableData]);

  // Event sorting and filtering
  const sortClassesByTime = useCallback((classes: TimetableItem[]): TimetableItem[] => {
    return [...classes].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.period - b.period;
    });
  }, []);

  const sortClassesBySubject = useCallback((classes: TimetableItem[]): TimetableItem[] => {
    return [...classes].sort((a, b) => a.subject.localeCompare(b.subject));
  }, []);

  const filterClassesByDay = useCallback((dayOfWeek: number): TimetableItem[] => {
    return getClassesForDay(dayOfWeek);
  }, [getClassesForDay]);

  const filterClassesByPeriod = useCallback((period: number): TimetableItem[] => {
    return getClassesForPeriod(period);
  }, [getClassesForPeriod]);

  // Computed statistics
  const statistics: TimetableStatistics = useMemo(() => {
    const totalSlots = DEFAULT_DAYS_OF_WEEK.length * DEFAULT_PERIODS.length;
    const occupiedSlots = timetableData.length;
    const emptySlots = totalSlots - occupiedSlots;
    
    // Count busy days (days with at least one class)
    const busyDays = DEFAULT_DAYS_OF_WEEK.reduce((count, _, dayIndex) => {
      const dayClasses = getClassesForDay(dayIndex);
      return count + (dayClasses.length > 0 ? 1 : 0);
    }, 0);
    
    // Calculate average classes per day
    const averageClassesPerDay = busyDays > 0 ? occupiedSlots / busyDays : 0;
    
    // Estimate total credits
    const totalCredits = getWeeklyCredits();
    
    return {
      totalCredits,
      subjectCount: timetableData.length,
      emptySlots,
      busyDays,
      averageClassesPerDay: Math.round(averageClassesPerDay * 10) / 10
    };
  }, [timetableData, getClassesForDay, getWeeklyCredits]);

  return {
    // Event data
    timetableData,
    statistics,
    
    // Event queries
    getClassForSlot,
    getClassesForDay,
    getClassesForPeriod,
    getTodaysClasses,
    getUpcomingClasses,
    getClassesByProfessor,
    getClassesByRoom,
    
    // Event management
    addClass,
    updateClass,
    removeClass,
    duplicateClass,
    
    // Event validation
    validateClassTime,
    isSlotEmpty,
    canAddClass,
    getTimeConflicts,
    
    // Event utilities
    getClassDuration,
    getWeeklyCredits,
    getEmptySlots,
    searchClasses,
    
    // Event sorting and filtering
    sortClassesByTime,
    sortClassesBySubject,
    filterClassesByDay,
    filterClassesByPeriod
  };
};