import { Grade, Notification, Subject, TimetableItem } from '@/lib/types';

// サンプルデータ
const sampleSubjects: Subject[] = [
  {
    id: '1',
    name: 'データベース論',
    code: 'CS301',
    professor: '田中教授',
    credits: 2,
    semester: 'spring',
    category: '必修',
    department: '情報科学科',
    grade: 3,
    dayOfWeek: 1,
    period: 1,
    room: 'A302',
    maxStudents: 100,
    currentStudents: 85,
    description: 'データベースの基本概念から設計、実装まで幅広く学習します。',
    status: 'enrolled',
    rating: 4.2
  },
  // 他のサンプルデータ...
];

const sampleTimetable: TimetableItem[] = [
  {
    id: '1',
    subjectId: '1',
    subject: 'データベース論',
    professor: '田中教授',
    room: 'A302',
    startTime: '09:00',
    endTime: '10:30',
    dayOfWeek: 1,
    period: 1,
    color: 'bg-blue-500'
  },
  // 他のサンプルデータ...
];

const sampleGrades: Grade[] = [
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
  // 他のサンプルデータ...
];

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'レポート提出期限のお知らせ',
    content: 'データベース論のレポート提出期限が近づいています...',
    summary: 'データベース論のレポート提出期限は6月15日23:59までです',
    category: 'レポート',
    priority: 'urgent',
    author: '田中教授',
    department: '情報科学科',
    createdAt: new Date('2024-06-10T10:00:00'),
    expiresAt: new Date('2024-06-15T23:59:59'),
    read: false,
    starred: true,
    attachments: ['レポート要件.pdf', '参考資料.docx'],
    tags: ['データベース論', 'レポート', '期限'],
    targetAudience: ['3年生', '情報科学科']
  },
  // 他のサンプルデータ...
];

// データサービス
export class DataService {
  // 履修科目
  static async getSubjects(): Promise<Subject[]> {
    // 実際のAPIコールをシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));
    return sampleSubjects;
  }

  static async enrollSubject(_subjectId: string): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
    await new Promise(resolve => setTimeout(resolve, 300));
    // API実装時はここでサーバーにリクエスト
  }

  static async unenrollSubject(_subjectId: string): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
    await new Promise(resolve => setTimeout(resolve, 300));
    // API実装時はここでサーバーにリクエスト
  }

  // 時間割
  static async getTimetable(): Promise<TimetableItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return sampleTimetable;
  }

  // 成績
  static async getGrades(): Promise<Grade[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return sampleGrades;
  }

  // お知らせ
  static async getNotifications(): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return sampleNotifications;
  }

  static async markNotificationAsRead(_notificationId: string): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
    await new Promise(resolve => setTimeout(resolve, 100));
    // API実装時はここでサーバーにリクエスト
  }
}