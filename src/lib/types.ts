// 既存の型定義に加えて以下を追加

// 学生情報
export interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
  year: number;
  avatar?: string;
}

// 履修科目
export interface Subject {
  id: string;
  name: string;
  code: string;
  professor: string;
  credits: number;
  semester: 'spring' | 'fall' | 'intensive';
  category: '必修' | '選択必修' | '選択' | '自由';
  department: string;
  grade: number;
  dayOfWeek: number;
  period: number;
  room: string;
  maxStudents: number;
  currentStudents: number;
  description: string;
  status: 'enrolled' | 'available' | 'waitlist' | 'completed';
  rating: number;
}

// 時間割項目
export interface TimetableItem {
  id: string;
  subjectId: string;
  subject: string;
  professor: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  period: number;
  color: string;
}

// 成績
export interface Grade {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  professor: string;
  credits: number;
  semester: string;
  year: number;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F' | '履修中';
  gpa: number;
  category: '必修' | '選択必修' | '選択' | '自由';
  department: string;
  examScore?: number;
  reportScore?: number;
  attendanceScore?: number;
  finalScore: number;
}

// お知らせ
export interface Notification {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: '重要' | '一般' | 'イベント' | 'システム' | '休講' | 'レポート';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  author: string;
  department: string;
  createdAt: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  read: boolean;
  starred: boolean;
  attachments?: string[];
  tags: string[];
  targetAudience: string[];
}

// アプリケーション設定
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ja' | 'en';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    shareGrades: boolean;
    shareSchedule: boolean;
  };
}

// ストアの状態
export interface AppState {
  // 認証状態
  isAuthenticated: boolean;
  student: Student | null;
  
  // データ
  subjects: Subject[];
  timetable: TimetableItem[];
  grades: Grade[];
  notifications: Notification[];
  
  // 学務管理データ
  courses: Course[];
  registrations: CourseRegistration[];
  academicRecord: AcademicRecord | null;
  coursePlans: CoursePlan[];
  currentSemester: AcademicSemester | null;
  
  // UI状態
  loading: {
    subjects: boolean;
    timetable: boolean;
    grades: boolean;
    notifications: boolean;
    courses: boolean;
    registrations: boolean;
    academicRecord: boolean;
    coursePlans: boolean;
  };
  
  // 設定
  settings: AppSettings;
  
  // フィルター状態
  filters: {
    subjects: {
      category: string;
      status: string;
      search: string;
    };
    notifications: {
      category: string;
      priority: string;
      unreadOnly: boolean;
      search: string;
    };
    grades: {
      year: string;
      semester: string;
      category: string;
    };
    courses: CourseFilters;
    registrations: RegistrationFilters;
    academicRecords: AcademicRecordFilters;
  };
}

// ========================================
// 学務管理システム型定義
// ========================================

// 詳細なコース情報
export interface Course {
  id: string;
  code: string; // 科目コード (e.g., "CS101", "MATH201")
  name: string;
  nameEn?: string;
  credits: number;
  
  // 開講情報
  semester: 'spring' | 'fall' | 'intensive' | 'year-long';
  academicYear: number;
  department: string;
  faculty: string;
  
  // 時間・教室情報
  schedule: CourseSchedule[];
  
  // 教員情報
  instructors: Instructor[];
  
  // 履修情報
  category: '必修' | '選択必修' | '選択' | '自由' | '教職' | '資格';
  targetGrades: number[]; // 対象学年
  maxStudents: number;
  currentStudents: number;
  
  // 前提条件
  prerequisites: string[]; // 前提科目のID
  corequisites: string[]; // 同時履修科目のID
  restrictions: CourseRestriction[];
  
  // シラバス情報
  syllabus: Syllabus;
  
  // 評価・その他
  rating: number;
  difficulty: number; // 1-5
  workload: number; // 1-5 (週あたりの学習時間目安)
  
  // ステータス
  status: 'active' | 'inactive' | 'cancelled' | 'full';
  registrationPeriod: {
    start: Date;
    end: Date;
  };
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// 授業スケジュール
export interface CourseSchedule {
  id: string;
  dayOfWeek: number; // 0=日曜日
  period: number; // 時限
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  type: 'lecture' | 'seminar' | 'lab' | 'exam' | 'fieldwork';
}

// 教員情報
export interface Instructor {
  id: string;
  name: string;
  nameEn?: string;
  title: string; // 教授、准教授等
  department: string;
  email?: string;
  office?: string;
  officeHours?: string;
  researchAreas?: string[];
}

// 履修制限
export interface CourseRestriction {
  type: 'department' | 'grade' | 'gpa' | 'credits' | 'other';
  condition: string;
  value: string | number;
}

// シラバス
export interface Syllabus {
  description: string; // 授業概要
  objectives: string[]; // 到達目標
  plan: SyllabusWeek[]; // 授業計画
  evaluation: EvaluationCriteria[]; // 評価基準
  textbooks: TextbookInfo[];
  references: string[];
  notes: string; // 備考
  lastUpdated: Date;
}

// 授業計画（週別）
export interface SyllabusWeek {
  week: number;
  topic: string;
  content: string;
  assignment?: string;
}

// 評価基準
export interface EvaluationCriteria {
  type: 'exam' | 'report' | 'presentation' | 'attendance' | 'quiz' | 'participation' | 'assignment';
  name: string;
  weight: number; // パーセンテージ
  description?: string;
}

// 教科書情報
export interface TextbookInfo {
  title: string;
  author: string;
  publisher: string;
  isbn?: string;
  price?: number;
  required: boolean;
}

// 履修登録
export interface CourseRegistration {
  id: string;
  studentId: string;
  courseId: string;
  academicYear: number;
  semester: string;
  
  // 登録情報
  registrationDate: Date;
  status: 'registered' | 'waitlisted' | 'dropped' | 'cancelled' | 'completed';
  registrationType: 'regular' | 'audit' | 'pass-fail';
  
  // コース情報
  courseName: string;
  courseCode: string;
  credits: number;
  category?: string;
  
  // 成績情報（履修中は未設定）
  finalGrade?: string;
  grade?: string;
  gpa?: number;
  earnedCredits?: number;
  
  // 日程情報
  dropDate?: Date;
  completionDate?: Date;
  
  // 中間成績
  midtermGrades?: GradeComponent[];
  
  // メタデータ
  lastModified: Date;
  notes?: string;
}

// 成績構成要素
export interface GradeComponent {
  type: 'midterm' | 'final' | 'quiz' | 'assignment' | 'attendance' | 'participation';
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  date: Date;
}

// 学期情報
export interface AcademicSemester {
  id: string;
  academicYear: number;
  semester: 'spring' | 'fall' | 'intensive';
  name: string; // "2024年度前期"
  
  // 期間
  startDate: Date;
  endDate: Date;
  
  // 重要な日程
  registrationStart: Date;
  registrationEnd: Date;
  addDropDeadline: Date;
  withdrawalDeadline: Date;
  finalExamStart: Date;
  finalExamEnd: Date;
  
  // ステータス
  status: 'future' | 'registration' | 'active' | 'exams' | 'finished';
}

// 学術記録（成績簿）
export interface AcademicRecord {
  id: string;
  studentId: string;
  
  // 学期別成績
  semesterRecords: SemesterRecord[];
  
  // 累計情報
  totalCreditsEarned: number;
  totalCreditsAttempted: number;
  cumulativeGPA: number;
  overallGPA: number; // 追加
  
  // コース成績（フラット化された成績一覧）
  courseGrades: CourseGrade[];
  
  // 学期別GPA
  semesterGPAs: SemesterGPA[];
  
  // 卒業要件
  graduationRequirements: GraduationRequirements;
  
  // 学位要件進捗
  degreeProgress: DegreeProgress;
  
  // 特記事項
  honors: Honor[];
  probations: Probation[];
  
  // メタデータ
  lastUpdated: Date;
}

// 学期別成績
export interface SemesterRecord {
  semester: AcademicSemester;
  registrations: CourseRegistration[];
  semesterGPA: number;
  semesterCredits: number;
  classRank?: number;
  totalStudents?: number;
}

// 学位要件進捗
export interface DegreeProgress {
  program: string; // 学位プログラム名
  totalRequiredCredits: number;
  earnedCredits: number;
  
  // カテゴリ別進捗
  categoryProgress: CategoryProgress[];
  
  // 卒業見込み
  expectedGraduation: Date;
  graduationEligible: boolean;
  remainingRequirements: string[];
}

// カテゴリ別進捗
export interface CategoryProgress {
  category: string;
  requiredCredits: number;
  earnedCredits: number;
  inProgressCredits: number;
  courses: string[]; // コースID
}

// 表彰
export interface Honor {
  type: 'dean-list' | 'honor-roll' | 'graduation-honors' | 'scholarship';
  name: string;
  semester: string;
  academicYear: number;
  gpa?: number;
}

// 学業警告
export interface Probation {
  type: 'academic-warning' | 'academic-probation' | 'suspension';
  semester: string;
  academicYear: number;
  reason: string;
  requirements: string[];
  resolved: boolean;
}

// コース成績
export interface CourseGrade {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  category: string;
  academicYear: number;
  semester: string;
  finalGrade: string;
  grade: string; // 追加：成績（A+, A, B+など）
  gpa: number;
  gradePoints: number; // 追加：成績ポイント
  instructors: string[];
}

// 学期別GPA
export interface SemesterGPA {
  academicYear: number;
  semester: string;
  gpa: number;
  credits: number;
}

// 卒業要件
export interface GraduationRequirement {
  id: string;
  category: string;
  name: string;
  requiredCredits: number;
  creditsRequired: number; // Alias for requiredCredits
  earnedCredits: number;
  inProgressCredits: number;
  completed: boolean;
  courses: string[];
  description?: string;
}

// 卒業要件リスト（ヘルパープロパティ付き）
export interface GraduationRequirements extends Array<GraduationRequirement> {
  totalCreditsRequired: number;
  categoryRequirements: GraduationRequirement[];
}

// 履修計画
export interface CoursePlan {
  id: string;
  studentId: string;
  name: string; // プラン名
  
  // 計画期間
  startYear: number;
  endYear: number;
  
  // 年度別計画
  yearlyPlans: YearlyPlan[];
  
  // 目標
  targetGraduation: Date;
  targetGPA?: number;
  specializations?: string[];
  
  // ステータス
  status: 'draft' | 'active' | 'completed' | 'archived';
  
  // メタデータ
  createdAt: Date;
  lastModified: Date;
  notes?: string;
}

// 年度別計画
export interface YearlyPlan {
  academicYear: number;
  semesterPlans: SemesterPlan[];
  yearGoals?: string[];
}

// 学期別計画
export interface SemesterPlan {
  semester: 'spring' | 'fall' | 'intensive';
  plannedCourses: PlannedCourse[];
  targetCredits: number;
  targetGPA?: number;
  goals?: string[];
}

// 計画科目
export interface PlannedCourse {
  courseId: string;
  courseName: string;
  credits: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'registered' | 'completed' | 'cancelled';
  alternatives?: string[]; // 代替科目ID
  notes?: string;
}

// 履修推奨システム用
export interface CourseRecommendation {
  courseId: string;
  score: number; // 推奨度スコア
  reasons: RecommendationReason[];
  warnings?: string[];
}

export interface RecommendationReason {
  type: 'degree-requirement' | 'prerequisite' | 'interest' | 'difficulty' | 'schedule' | 'gpa-boost';
  description: string;
  weight: number;
}

// 学務管理用フィルター
export interface CourseFilters {
  search: string;
  department: string[];
  category: string[];
  credits: string[];
  semester: string[];
  dayOfWeek: string[];
  period: string[];
  instructor: string[];
  availability: 'all' | 'available' | 'full' | 'waitlist';
  difficulty: string[];
  rating: number;
}

export interface RegistrationFilters {
  academicYear: string[];
  semester: string[];
  status: string[];
  category: string[];
}

export interface AcademicRecordFilters {
  academicYear: string[];
  semester: string[];
  category: string[];
  gradeRange: string[];
  gpaRange: [number, number];
}