// 学生情報
export interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
  year: number;
}

// 科目情報
export interface Subject {
  id: string;
  name: string;
  code: string;
  professor: string;
  credits: number;
  semester: 'spring' | 'fall' | 'intensive';
}

// 授業スケジュール
export interface Schedule {
  id: string;
  subjectId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: 日曜日, 1: 月曜日...
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  room: string;
}

// お知らせ
export interface Notification {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  urgent: boolean;
  read: boolean;
}

// 成績
export interface Grade {
  id: string;
  subjectId: string;
  grade: string; // "A+", "A", "B+", "B", "C+", "C", "D", "F"
  gpa: number;
  semester: string;
  year: number;
}