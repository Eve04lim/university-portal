// Learning Analytics Types

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  date: Date;
  duration: number; // minutes
  type: 'lecture' | 'study' | 'assignment' | 'exam' | 'review';
  location: 'classroom' | 'library' | 'home' | 'online';
  efficiency: number; // 1-5 rating
  notes?: string;
}

export interface AcademicProgress {
  semester: string;
  year: number;
  gpa: number;
  credits: number;
  totalSubjects: number;
  passedSubjects: number;
  failedSubjects: number;
  averageGrade: number;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  category: string;
  semester: string;
  year: number;
  currentGrade?: string;
  midtermScore?: number;
  finalScore?: number;
  assignmentScores: number[];
  attendanceRate: number;
  studyHours: number;
  difficulty: number; // 1-5 rating
  satisfaction: number; // 1-5 rating
}

export interface LearningPattern {
  preferredTimeSlots: Array<{
    hour: number;
    efficiency: number;
  }>;
  preferredLocations: Array<{
    location: string;
    frequency: number;
    efficiency: number;
  }>;
  subjectDifficulty: Array<{
    category: string;
    averageGrade: number;
    studyHoursNeeded: number;
  }>;
  weeklyPattern: Array<{
    dayOfWeek: number;
    studyHours: number;
    efficiency: number;
  }>;
}

export interface AnalyticsTimeframe {
  type: 'week' | 'month' | 'semester' | 'year' | 'all';
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  category: 'gpa' | 'study_hours' | 'attendance' | 'skills' | 'credits';
  status: 'active' | 'completed' | 'paused' | 'failed';
  createdAt: Date;
}

export interface StudyEfficiencyMetrics {
  totalStudyHours: number;
  effectiveStudyHours: number;
  averageSessionDuration: number;
  longestStreak: number;
  currentStreak: number;
  focusScore: number; // 1-100
  productivityTrend: 'increasing' | 'decreasing' | 'stable';
  burnoutRisk: 'low' | 'medium' | 'high';
}

export interface PredictiveInsights {
  semesterGpaPrediction: number;
  suggestedStudyHours: number;
  riskSubjects: string[];
  improvementOpportunities: Array<{
    area: string;
    impact: number;
    suggestion: string;
  }>;
  optimalSchedule: Array<{
    dayOfWeek: number;
    timeSlot: string;
    suggestedActivity: string;
    reason: string;
  }>;
}

export interface AnalyticsFilters {
  timeframe: AnalyticsTimeframe;
  subjects: string[];
  categories: string[];
  locations: string[];
  studyTypes: string[];
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  category?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter';
}

export interface AnalyticsSummary {
  currentGpa: number;
  gpaChange: number;
  totalStudyHours: number;
  studyHoursChange: number;
  averageAttendance: number;
  attendanceChange: number;
  completedCredits: number;
  creditsChange: number;
  strongestSubjects: string[];
  improvementAreas: string[];
  achievements: Array<{
    title: string;
    description: string;
    achievedAt: Date;
    type: 'academic' | 'study_habit' | 'milestone';
  }>;
}

export interface ComparisonMetrics {
  myScore: number;
  classAverage: number;
  classMedian: number;
  percentile: number;
  rank: number;
  totalStudents: number;
}

export interface LearningRecommendation {
  id: string;
  type: 'study_schedule' | 'subject_focus' | 'skill_development' | 'resource' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
  timeToComplete: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}