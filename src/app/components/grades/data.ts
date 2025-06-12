import { Grade, SemesterGPA } from './types';

// サンプル成績データ
export const gradesData: Grade[] = [
  {
    id: '1',
    subjectId: 'cs301',
    subjectName: 'データベース論',
    subjectCode: 'CS301',
    professor: '田中教授',
    credits: 2,
    semester: '前期',
    year: 2024,
    grade: 'A',
    gpa: 4.0,
    category: '必修',
    department: '情報科学科',
    examScore: 85,
    reportScore: 90,
    attendanceScore: 95,
    finalScore: 88
  },
  {
    id: '2',
    subjectId: 'math201',
    subjectName: '統計学',
    subjectCode: 'MATH201',
    professor: '佐藤教授',
    credits: 2,
    semester: '前期',
    year: 2024,
    grade: 'B+',
    gpa: 3.5,
    category: '選択必修',
    department: '数学科',
    examScore: 80,
    reportScore: 85,
    attendanceScore: 90,
    finalScore: 82
  },
  {
    id: '3',
    subjectId: 'eng101',
    subjectName: '英語コミュニケーション',
    subjectCode: 'ENG101',
    professor: 'Johnson教授',
    credits: 1,
    semester: '通年',
    year: 2024,
    grade: 'A+',
    gpa: 4.5,
    category: '必修',
    department: '語学センター',
    examScore: 95,
    reportScore: 98,
    attendanceScore: 100,
    finalScore: 96
  },
  {
    id: '4',
    subjectId: 'cs302',
    subjectName: 'ソフトウェア工学',
    subjectCode: 'CS302',
    professor: '山田教授',
    credits: 3,
    semester: '後期',
    year: 2024,
    grade: '履修中',
    gpa: 0,
    category: '必修',
    department: '情報科学科',
    finalScore: 0
  },
  {
    id: '5',
    subjectId: 'phy201',
    subjectName: '物理学基礎',
    subjectCode: 'PHY201',
    professor: '鈴木教授',
    credits: 2,
    semester: '前期',
    year: 2023,
    grade: 'B',
    gpa: 3.0,
    category: '選択',
    department: '物理学科',
    examScore: 75,
    reportScore: 80,
    attendanceScore: 85,
    finalScore: 78
  },
  {
    id: '6',
    subjectId: 'hist101',
    subjectName: '日本史概論',
    subjectCode: 'HIST101',
    professor: '高橋教授',
    credits: 2,
    semester: '後期',
    year: 2023,
    grade: 'C+',
    gpa: 2.5,
    category: '自由',
    department: '歴史学科',
    examScore: 70,
    reportScore: 75,
    attendanceScore: 80,
    finalScore: 72
  }
];

// サンプル学期別GPAデータ
export const semesterGPAData: SemesterGPA[] = [
  { semester: '前期', year: 2023, gpa: 3.2, credits: 8 },
  { semester: '後期', year: 2023, gpa: 2.8, credits: 6 },
  { semester: '前期', year: 2024, gpa: 3.8, credits: 5 },
  { semester: '後期', year: 2024, gpa: 0, credits: 3 } // 履修中
];