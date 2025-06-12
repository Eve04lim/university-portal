import { 
  StudySession, 
  AcademicProgress, 
  SubjectPerformance, 
  LearningPattern,
  StudyEfficiencyMetrics,
  AnalyticsTimeframe,
  ChartSeries,
  ComparisonMetrics,
  LearningRecommendation
} from './types';

// Time and Date Utilities
export const getTimeframeDates = (timeframe: AnalyticsTimeframe['type']): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);

  switch (timeframe) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'semester':
      // Assume semester is about 4 months
      startDate.setMonth(now.getMonth() - 4);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date(2020, 0, 1); // Start from 2020
      break;
  }

  return { startDate, endDate };
};

export const formatTimeframeLabel = (timeframe: AnalyticsTimeframe['type']): string => {
  const labels = {
    week: '過去1週間',
    month: '過去1ヶ月',
    semester: '今学期',
    year: '過去1年',
    all: '全期間'
  };
  return labels[timeframe];
};

// Study Session Analytics
export const calculateStudyHours = (sessions: StudySession[], timeframe?: AnalyticsTimeframe): number => {
  let filteredSessions = sessions;
  
  if (timeframe) {
    filteredSessions = sessions.filter(session => 
      session.date >= timeframe.startDate && session.date <= timeframe.endDate
    );
  }
  
  return filteredSessions.reduce((total, session) => total + session.duration, 0) / 60; // Convert to hours
};

export const calculateAverageStudySession = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;
  const totalMinutes = sessions.reduce((total, session) => total + session.duration, 0);
  return totalMinutes / sessions.length;
};

export const getStudyStreak = (sessions: StudySession[]): { current: number; longest: number } => {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // Calculate current streak (from today backwards)
  for (let i = 0; i < sortedSessions.length; i++) {
    const daysDiff = Math.floor((today.getTime() - sortedSessions[i].date.getTime()) / msPerDay);
    if (daysDiff === i) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  const studyDates = sessions.map(s => s.date.toDateString());
  const uniqueDates = Array.from(new Set(studyDates)).sort();
  
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / msPerDay);
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { current: currentStreak, longest: longestStreak };
};

// GPA and Grade Analytics
export const calculateGPA = (performances: SubjectPerformance[]): number => {
  if (performances.length === 0) return 0;
  
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  const validGrades = performances.filter(p => p.currentGrade && gradePoints[p.currentGrade] !== undefined);
  if (validGrades.length === 0) return 0;
  
  const totalPoints = validGrades.reduce((sum, p) => sum + gradePoints[p.currentGrade!], 0);
  return Math.round((totalPoints / validGrades.length) * 100) / 100;
};

export const calculateGPATrend = (progressHistory: AcademicProgress[]): number => {
  if (progressHistory.length < 2) return 0;
  
  const sorted = [...progressHistory].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.semester.localeCompare(b.semester);
  });
  
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  
  return Math.round((latest.gpa - previous.gpa) * 100) / 100;
};

// Subject Performance Analytics
export const identifyStrongSubjects = (performances: SubjectPerformance[], limit: number = 3): string[] => {
  return performances
    .filter(p => p.currentGrade)
    .sort((a, b) => {
      const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
      const aIndex = gradeOrder.indexOf(a.currentGrade!);
      const bIndex = gradeOrder.indexOf(b.currentGrade!);
      return aIndex - bIndex;
    })
    .slice(0, limit)
    .map(p => p.subjectName);
};

export const identifyImprovementAreas = (performances: SubjectPerformance[], limit: number = 3): string[] => {
  return performances
    .filter(p => p.currentGrade && ['C', 'C-', 'D+', 'D', 'F'].includes(p.currentGrade))
    .sort((a, b) => {
      const gradeOrder = ['F', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
      const aIndex = gradeOrder.indexOf(a.currentGrade!);
      const bIndex = gradeOrder.indexOf(b.currentGrade!);
      return aIndex - bIndex;
    })
    .slice(0, limit)
    .map(p => p.subjectName);
};

// Learning Pattern Analysis
export const analyzeLearningPatterns = (sessions: StudySession[]): LearningPattern => {
  // Preferred time slots
  const hourEfficiency: { [hour: number]: { total: number; count: number; efficiency: number } } = {};
  
  sessions.forEach(session => {
    const hour = session.date.getHours();
    if (!hourEfficiency[hour]) {
      hourEfficiency[hour] = { total: 0, count: 0, efficiency: 0 };
    }
    hourEfficiency[hour].total += session.efficiency;
    hourEfficiency[hour].count += 1;
    hourEfficiency[hour].efficiency = hourEfficiency[hour].total / hourEfficiency[hour].count;
  });
  
  const preferredTimeSlots = Object.entries(hourEfficiency)
    .map(([hour, data]) => ({ hour: parseInt(hour), efficiency: data.efficiency }))
    .sort((a, b) => b.efficiency - a.efficiency);
  
  // Preferred locations
  const locationStats: { [location: string]: { frequency: number; efficiency: number } } = {};
  
  sessions.forEach(session => {
    if (!locationStats[session.location]) {
      locationStats[session.location] = { frequency: 0, efficiency: 0 };
    }
    locationStats[session.location].frequency += 1;
    locationStats[session.location].efficiency += session.efficiency;
  });
  
  const preferredLocations = Object.entries(locationStats)
    .map(([location, stats]) => ({
      location,
      frequency: stats.frequency,
      efficiency: stats.efficiency / stats.frequency
    }))
    .sort((a, b) => b.efficiency - a.efficiency);
  
  // Weekly pattern
  const weeklyPattern = Array.from({ length: 7 }, (_, day) => {
    const daySessions = sessions.filter(s => s.date.getDay() === day);
    const studyHours = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
    const efficiency = daySessions.length > 0 
      ? daySessions.reduce((sum, s) => sum + s.efficiency, 0) / daySessions.length 
      : 0;
    
    return { dayOfWeek: day, studyHours, efficiency };
  });
  
  return {
    preferredTimeSlots,
    preferredLocations,
    subjectDifficulty: [], // Would be calculated from SubjectPerformance data
    weeklyPattern
  };
};

// Chart Data Preparation
export const prepareGradeProgressChart = (progressHistory: AcademicProgress[]): ChartSeries[] => {
  if (!progressHistory || progressHistory.length === 0) {
    return [{
      name: 'GPA推移',
      data: [],
      color: '#3B82F6',
      type: 'line'
    }];
  }
  
  const sorted = [...progressHistory].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.semester.localeCompare(b.semester);
  });

  const chartData = sorted.map(p => ({
    x: `${p.year}年${p.semester}`,
    y: p.gpa || 0,
    label: `GPA: ${(p.gpa || 0).toFixed(2)}`
  }));

  return [{
    name: 'GPA推移',
    data: chartData,
    color: '#3B82F6',
    type: 'line'
  }];
};

export const prepareStudyHoursChart = (sessions: StudySession[], timeframe: AnalyticsTimeframe['type']): ChartSeries[] => {
  if (!sessions || sessions.length === 0) {
    return [{
      name: '学習時間',
      data: [],
      color: '#10B981',
      type: 'bar'
    }];
  }
  
  const { startDate, endDate } = getTimeframeDates(timeframe);
  const filteredSessions = sessions.filter(s => s.date && s.date >= startDate && s.date <= endDate);
  
  const dailyHours: { [date: string]: number } = {};
  
  filteredSessions.forEach(session => {
    const dateKey = session.date.toISOString().split('T')[0];
    if (!dailyHours[dateKey]) {
      dailyHours[dateKey] = 0;
    }
    dailyHours[dateKey] += (session.duration || 0) / 60;
  });

  const chartData = Object.entries(dailyHours)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, hours]) => ({
      x: new Date(date),
      y: Math.round(hours * 10) / 10,
      label: `${Math.round(hours * 10) / 10}時間`
    }));

  return [{
    name: '学習時間',
    data: chartData,
    color: '#10B981',
    type: 'bar'
  }];
};

export const prepareSubjectDistributionChart = (performances: SubjectPerformance[]): ChartSeries[] => {
  if (!performances || performances.length === 0) {
    return [{
      name: '科目別学習時間',
      data: [],
      color: '#F59E0B',
      type: 'bar'
    }];
  }
  
  const categoryHours: { [category: string]: number } = {};
  
  performances.forEach(p => {
    if (!categoryHours[p.category]) {
      categoryHours[p.category] = 0;
    }
    categoryHours[p.category] += p.studyHours || 0;
  });

  const chartData = Object.entries(categoryHours).map(([category, hours]) => ({
    x: category,
    y: hours,
    label: `${hours}時間`
  }));

  return [{
    name: '科目別学習時間',
    data: chartData,
    color: '#F59E0B',
    type: 'bar'
  }];
};

// Efficiency Metrics
export const calculateEfficiencyMetrics = (sessions: StudySession[]): StudyEfficiencyMetrics => {
  const totalStudyHours = calculateStudyHours(sessions);
  const effectiveStudyHours = sessions
    .filter(s => s.efficiency >= 4)
    .reduce((sum, s) => sum + s.duration, 0) / 60;
  
  const averageSessionDuration = calculateAverageStudySession(sessions);
  const { current: currentStreak, longest: longestStreak } = getStudyStreak(sessions);
  
  const focusScore = sessions.length > 0 
    ? Math.round((sessions.reduce((sum, s) => sum + s.efficiency, 0) / sessions.length) * 20) 
    : 0;
  
  // Simple trend calculation based on recent vs older sessions
  const recentSessions = sessions.filter(s => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return s.date >= weekAgo;
  });
  
  const olderSessions = sessions.filter(s => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return s.date >= twoWeeksAgo && s.date < weekAgo;
  });
  
  const recentAvgEfficiency = recentSessions.length > 0 
    ? recentSessions.reduce((sum, s) => sum + s.efficiency, 0) / recentSessions.length 
    : 0;
  const olderAvgEfficiency = olderSessions.length > 0 
    ? olderSessions.reduce((sum, s) => sum + s.efficiency, 0) / olderSessions.length 
    : 0;
  
  let productivityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (recentAvgEfficiency > olderAvgEfficiency + 0.3) {
    productivityTrend = 'increasing';
  } else if (recentAvgEfficiency < olderAvgEfficiency - 0.3) {
    productivityTrend = 'decreasing';
  }
  
  // Burnout risk calculation
  const dailyHours = totalStudyHours / 7; // Average daily hours this week
  let burnoutRisk: 'low' | 'medium' | 'high' = 'low';
  if (dailyHours > 8 && focusScore < 60) {
    burnoutRisk = 'high';
  } else if (dailyHours > 6 && focusScore < 70) {
    burnoutRisk = 'medium';
  }
  
  return {
    totalStudyHours,
    effectiveStudyHours,
    averageSessionDuration,
    longestStreak,
    currentStreak,
    focusScore,
    productivityTrend,
    burnoutRisk
  };
};

// Generate Recommendations
export const generateRecommendations = (
  sessions: StudySession[],
  performances: SubjectPerformance[],
  patterns: LearningPattern
): LearningRecommendation[] => {
  const recommendations: LearningRecommendation[] = [];
  
  // Study schedule recommendations
  if (patterns.preferredTimeSlots.length > 0) {
    const bestHour = patterns.preferredTimeSlots[0];
    recommendations.push({
      id: 'schedule-optimization',
      type: 'study_schedule',
      priority: 'high',
      title: '最適な学習時間の活用',
      description: `あなたの最も効率的な学習時間は${bestHour.hour}時頃です。この時間帯により多くの重要な学習を配置することをお勧めします。`,
      actionItems: [
        `${bestHour.hour}時頃に難しい科目の学習を配置`,
        '集中力が必要なタスクをこの時間帯に実行',
        'この時間帯の学習環境を最適化'
      ],
      expectedImpact: '学習効率が15-25%向上する可能性があります',
      timeToComplete: '1週間',
      difficulty: 'easy',
      tags: ['時間管理', '効率化', '習慣化']
    });
  }
  
  // Subject-specific recommendations
  const improvementSubjects = identifyImprovementAreas(performances, 2);
  if (improvementSubjects.length > 0) {
    recommendations.push({
      id: 'subject-improvement',
      type: 'subject_focus',
      priority: 'high',
      title: '重点改善科目の学習強化',
      description: `${improvementSubjects.join('、')}の成績向上に重点を置いた学習計画を立てることをお勧めします。`,
      actionItems: [
        '週の学習時間の30%をこれらの科目に配分',
        '理解度チェックのための小テストを定期的に実施',
        '教授やTAとの面談時間を設ける'
      ],
      expectedImpact: 'これらの科目の成績が1段階向上する可能性があります',
      timeToComplete: '1学期',
      difficulty: 'medium',
      tags: ['成績向上', '重点学習', '計画的学習']
    });
  }
  
  return recommendations;
};

// Comparison and Benchmarking
export const calculateComparisonMetrics = (
  myValue: number,
  classValues: number[]
): ComparisonMetrics => {
  const sortedValues = [...classValues].sort((a, b) => b - a);
  const myRank = sortedValues.findIndex(v => v <= myValue) + 1;
  const classAverage = classValues.reduce((sum, v) => sum + v, 0) / classValues.length;
  const classMedian = sortedValues[Math.floor(sortedValues.length / 2)];
  const percentile = Math.round(((classValues.length - myRank + 1) / classValues.length) * 100);
  
  return {
    myScore: myValue,
    classAverage: Math.round(classAverage * 100) / 100,
    classMedian: Math.round(classMedian * 100) / 100,
    percentile,
    rank: myRank,
    totalStudents: classValues.length
  };
};

// Export utility function for generating sample data (for development)
export const generateSampleAnalyticsData = () => {
  // This would be used for development and testing
  // Implementation would generate realistic sample data
  return {
    studySessions: [] as StudySession[],
    academicProgress: [] as AcademicProgress[],
    subjectPerformances: [] as SubjectPerformance[]
  };
};