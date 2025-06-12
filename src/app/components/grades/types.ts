// 成績関連の型定義

// 成績データの型定義
export interface Grade extends Record<string, unknown> {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  professor: string;
  credits: number;
  semester: string;
  year: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' | '履修中';
  gpa: number;
  category: '必修' | '選択必修' | '選択' | '自由';
  department: string;
  examScore?: number;
  reportScore?: number;
  attendanceScore?: number;
  finalScore: number;
}

// 学期別GPAデータ
export interface SemesterGPA {
  semester: string;
  year: number;
  gpa: number;
  credits: number;
}

// テーブルカラム定義
export interface TableColumn {
  key: string;
  label: string;
  hideOnMobile?: boolean;
  render?: (value: unknown, row: Grade) => React.ReactNode;
}

// フィルターオプション
export interface FilterOption {
  value: string;
  label: string;
}

// 統計情報
export interface GradeStatistics {
  overallGPA: number;
  totalCredits: number;
  completedSubjects: number;
  averageScore: number;
  gradeDistribution: Record<string, number>;
}

// ビューモード
export type ViewMode = 'table' | 'chart';