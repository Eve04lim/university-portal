import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StudySession,
  AcademicProgress,
  SubjectPerformance,
  LearningPattern,
  StudyEfficiencyMetrics,
  AnalyticsTimeframe,
  AnalyticsFilters,
  AnalyticsSummary,
  LearningRecommendation,
  LearningGoal
} from '../app/components/analytics/types';
import {
  calculateStudyHours,
  calculateGPA,
  calculateGPATrend,
  identifyStrongSubjects,
  identifyImprovementAreas,
  analyzeLearningPatterns,
  calculateEfficiencyMetrics,
  generateRecommendations,
  getTimeframeDates,
  formatTimeframeLabel
} from '../app/components/analytics/utils';
import { useAppStore } from '../store/useAppStore';
import { AnalyticsDataService } from '../services/analyticsDataService';

export interface UseAnalyticsReturn {
  // Data state
  studySessions: StudySession[];
  academicProgress: AcademicProgress[];
  subjectPerformances: SubjectPerformance[];
  learningGoals: LearningGoal[];
  
  // Computed analytics
  summary: AnalyticsSummary;
  learningPattern: LearningPattern;
  efficiencyMetrics: StudyEfficiencyMetrics;
  recommendations: LearningRecommendation[];
  
  // Filters and timeframe
  currentTimeframe: AnalyticsTimeframe;
  filters: AnalyticsFilters;
  
  // Actions
  setTimeframe: (timeframe: AnalyticsTimeframe['type']) => void;
  updateFilters: (newFilters: Partial<AnalyticsFilters>) => void;
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  addLearningGoal: (goal: Omit<LearningGoal, 'id' | 'createdAt'>) => void;
  updateLearningGoal: (id: string, updates: Partial<LearningGoal>) => void;
  deleteLearningGoal: (id: string) => void;
  
  // Data loading and refresh
  isLoading: boolean;
  refreshData: () => Promise<void>;
  exportData: (format: 'json' | 'csv') => void;
}

// Sample data for development
const generateSampleData = () => {
  const now = new Date();
  
  // Sample study sessions
  const studySessions: StudySession[] = [
    {
      id: '1',
      subjectId: 'db001',
      subjectName: 'データベース論',
      date: new Date(now.getTime() - 86400000), // Yesterday
      duration: 120, // 2 hours
      type: 'study',
      location: 'library',
      efficiency: 4,
      notes: '正規化について復習'
    },
    {
      id: '2',
      subjectId: 'stat001',
      subjectName: '統計学',
      date: new Date(now.getTime() - 172800000), // 2 days ago
      duration: 90,
      type: 'assignment',
      location: 'home',
      efficiency: 3,
      notes: '課題2を完了'
    },
    {
      id: '3',
      subjectId: 'prog001',
      subjectName: 'プログラミング演習',
      date: new Date(now.getTime() - 259200000), // 3 days ago
      duration: 180,
      type: 'lecture',
      location: 'classroom',
      efficiency: 5,
      notes: 'React hooksについて学習'
    }
  ];

  // Sample academic progress
  const academicProgress: AcademicProgress[] = [
    {
      semester: '前期',
      year: 2024,
      gpa: 3.2,
      credits: 16,
      totalSubjects: 8,
      passedSubjects: 7,
      failedSubjects: 1,
      averageGrade: 82
    },
    {
      semester: '後期',
      year: 2023,
      gpa: 3.0,
      credits: 18,
      totalSubjects: 9,
      passedSubjects: 8,
      failedSubjects: 1,
      averageGrade: 78
    }
  ];

  // Sample subject performances
  const subjectPerformances: SubjectPerformance[] = [
    {
      subjectId: 'db001',
      subjectName: 'データベース論',
      category: '専門必修',
      semester: '前期',
      year: 2024,
      currentGrade: 'B+',
      midtermScore: 85,
      finalScore: 88,
      assignmentScores: [90, 85, 92],
      attendanceRate: 95,
      studyHours: 45,
      difficulty: 4,
      satisfaction: 4
    },
    {
      subjectId: 'stat001',
      subjectName: '統計学',
      category: '基礎科目',
      semester: '前期',
      year: 2024,
      currentGrade: 'A-',
      midtermScore: 92,
      assignmentScores: [88, 94, 90],
      attendanceRate: 100,
      studyHours: 38,
      difficulty: 3,
      satisfaction: 5
    }
  ];

  // Sample learning goals
  const learningGoals: LearningGoal[] = [
    {
      id: 'goal1',
      title: '今学期のGPA 3.5達成',
      description: '全科目で良好な成績を維持し、学期GPA 3.5を目指す',
      targetValue: 3.5,
      currentValue: 3.2,
      unit: 'GPA',
      deadline: new Date(2024, 6, 31),
      category: 'gpa',
      status: 'active',
      createdAt: new Date(2024, 3, 1)
    },
    {
      id: 'goal2',
      title: '週40時間の学習時間確保',
      description: '効率的な学習スケジュールで週40時間の学習を継続する',
      targetValue: 40,
      currentValue: 32,
      unit: '時間/週',
      deadline: new Date(2024, 6, 31),
      category: 'study_hours',
      status: 'active',
      createdAt: new Date(2024, 3, 1)
    }
  ];

  return {
    studySessions,
    academicProgress,
    subjectPerformances,
    learningGoals
  };
};

export const useAnalytics = (): UseAnalyticsReturn => {
  // Get data from app store
  const { grades, timetable, subjects } = useAppStore();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [additionalStudySessions, setAdditionalStudySessions] = useState<StudySession[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  
  // Timeframe and filters
  const [currentTimeframeType, setCurrentTimeframeType] = useState<AnalyticsTimeframe['type']>('month');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeframe: {
      type: 'month',
      startDate: new Date(),
      endDate: new Date(),
      label: ''
    },
    subjects: [],
    categories: [],
    locations: [],
    studyTypes: []
  });

  // Transform existing data to analytics format
  const integratedData = useMemo(() => {
    if (grades.length === 0 && timetable.length === 0) {
      // Fallback to sample data if no real data exists
      return generateSampleData();
    }
    
    return AnalyticsDataService.integrateWithExistingData(grades, timetable, subjects);
  }, [grades, timetable, subjects]);

  // Combine integrated data with additional manual entries
  const studySessions = useMemo(() => {
    return [...integratedData.studySessions, ...additionalStudySessions];
  }, [integratedData.studySessions, additionalStudySessions]);

  const academicProgress = integratedData.academicProgress;
  const subjectPerformances = integratedData.subjectPerformances;

  // Initialize sample learning goals on mount
  useEffect(() => {
    if (learningGoals.length === 0) {
      const sampleGoals = generateSampleData().learningGoals;
      setLearningGoals(sampleGoals);
    }
  }, [learningGoals.length]);

  // Current timeframe calculation
  const currentTimeframe: AnalyticsTimeframe = useMemo(() => {
    const { startDate, endDate } = getTimeframeDates(currentTimeframeType);
    return {
      type: currentTimeframeType,
      startDate,
      endDate,
      label: formatTimeframeLabel(currentTimeframeType)
    };
  }, [currentTimeframeType]);

  // Update filters when timeframe changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      timeframe: currentTimeframe
    }));
  }, [currentTimeframe]);

  // Filtered data based on current filters
  const filteredStudySessions = useMemo(() => {
    return studySessions.filter(session => {
      // Time filter
      if (session.date < currentTimeframe.startDate || session.date > currentTimeframe.endDate) {
        return false;
      }
      
      // Subject filter
      if (filters.subjects.length > 0 && !filters.subjects.includes(session.subjectId)) {
        return false;
      }
      
      // Location filter
      if (filters.locations.length > 0 && !filters.locations.includes(session.location)) {
        return false;
      }
      
      // Study type filter
      if (filters.studyTypes.length > 0 && !filters.studyTypes.includes(session.type)) {
        return false;
      }
      
      return true;
    });
  }, [studySessions, currentTimeframe, filters]);

  // Analytics computations
  const summary: AnalyticsSummary = useMemo(() => {
    const currentGpa = calculateGPA(subjectPerformances);
    const gpaChange = calculateGPATrend(academicProgress);
    const totalStudyHours = calculateStudyHours(filteredStudySessions, currentTimeframe);
    
    // Calculate changes (simplified - would need historical data)
    const studyHoursChange = 5.2; // Placeholder
    const averageAttendance = subjectPerformances.length > 0
      ? subjectPerformances.reduce((sum, p) => sum + p.attendanceRate, 0) / subjectPerformances.length
      : 0;
    const attendanceChange = 2.1; // Placeholder
    
    const completedCredits = academicProgress.reduce((sum, p) => sum + p.credits, 0);
    const creditsChange = 16; // Placeholder
    
    const strongestSubjects = identifyStrongSubjects(subjectPerformances);
    const improvementAreas = identifyImprovementAreas(subjectPerformances);
    
    return {
      currentGpa,
      gpaChange,
      totalStudyHours,
      studyHoursChange,
      averageAttendance,
      attendanceChange,
      completedCredits,
      creditsChange,
      strongestSubjects,
      improvementAreas,
      achievements: [
        {
          title: '学習継続賞',
          description: '7日連続で学習を継続しました',
          achievedAt: new Date(),
          type: 'study_habit'
        }
      ]
    };
  }, [subjectPerformances, academicProgress, filteredStudySessions, currentTimeframe]);

  // Learning pattern analysis
  const learningPattern: LearningPattern = useMemo(() => {
    return analyzeLearningPatterns(filteredStudySessions);
  }, [filteredStudySessions]);

  // Efficiency metrics
  const efficiencyMetrics: StudyEfficiencyMetrics = useMemo(() => {
    return calculateEfficiencyMetrics(filteredStudySessions);
  }, [filteredStudySessions]);

  // Recommendations
  const recommendations: LearningRecommendation[] = useMemo(() => {
    return generateRecommendations(filteredStudySessions, subjectPerformances, learningPattern);
  }, [filteredStudySessions, subjectPerformances, learningPattern]);

  // Actions
  const setTimeframe = useCallback((timeframe: AnalyticsTimeframe['type']) => {
    setCurrentTimeframeType(timeframe);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addStudySession = useCallback((sessionData: Omit<StudySession, 'id'>) => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: StudySession = { ...sessionData, id };
    setAdditionalStudySessions(prev => [...prev, newSession]);
  }, []);

  const updateStudySession = useCallback((id: string, updates: Partial<StudySession>) => {
    // Update additional sessions (manual entries)
    setAdditionalStudySessions(prev => prev.map(session =>
      session.id === id ? { ...session, ...updates } : session
    ));
  }, []);

  const deleteStudySession = useCallback((id: string) => {
    // Only allow deletion of additional sessions (manual entries)
    setAdditionalStudySessions(prev => prev.filter(session => session.id !== id));
  }, []);

  const addLearningGoal = useCallback((goalData: Omit<LearningGoal, 'id' | 'createdAt'>) => {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newGoal: LearningGoal = {
      ...goalData,
      id,
      createdAt: new Date()
    };
    setLearningGoals(prev => [...prev, newGoal]);
  }, []);

  const updateLearningGoal = useCallback((id: string, updates: Partial<LearningGoal>) => {
    setLearningGoals(prev => prev.map(goal =>
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  }, []);

  const deleteLearningGoal = useCallback((id: string) => {
    setLearningGoals(prev => prev.filter(goal => goal.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, would fetch data from API
      console.log('Data refreshed');
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportData = useCallback((format: 'json' | 'csv') => {
    const data = {
      studySessions: filteredStudySessions,
      academicProgress,
      subjectPerformances,
      learningGoals,
      summary,
      analyticsMetrics: {
        learningPattern,
        efficiencyMetrics,
        recommendations
      },
      exportedAt: new Date().toISOString(),
      dataSource: 'integrated' // indicates this includes real app data
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `learning-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // CSV export for study sessions
      const headers = ['Date', 'Subject', 'Duration (min)', 'Type', 'Location', 'Efficiency'];
      const csvRows = [
        headers.join(','),
        ...filteredStudySessions.map(session => [
          session.date.toISOString().split('T')[0],
          session.subjectName,
          session.duration.toString(),
          session.type,
          session.location,
          session.efficiency.toString()
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study-sessions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [filteredStudySessions, academicProgress, subjectPerformances, learningGoals, summary, learningPattern, efficiencyMetrics, recommendations]);

  return {
    // Data state
    studySessions: filteredStudySessions,
    academicProgress,
    subjectPerformances,
    learningGoals,
    
    // Computed analytics
    summary,
    learningPattern,
    efficiencyMetrics,
    recommendations,
    
    // Filters and timeframe
    currentTimeframe,
    filters,
    
    // Actions
    setTimeframe,
    updateFilters,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    addLearningGoal,
    updateLearningGoal,
    deleteLearningGoal,
    
    // Data loading and refresh
    isLoading,
    refreshData,
    exportData
  };
};