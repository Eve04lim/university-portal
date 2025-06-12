import { 
  AppSettings, 
  AppState, 
  Grade, 
  Notification, 
  Student, 
  Subject, 
  TimetableItem,
  Course,
  CourseRegistration,
  AcademicRecord,
  CoursePlan,
  AcademicSemester,
  CourseFilters,
  RegistrationFilters,
  AcademicRecordFilters
} from '@/lib/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppActions {
  // 認証
  login: (student: Student) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Student>) => void;

  // 履修科目
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  removeSubject: (id: string) => void;
  enrollSubject: (subjectId: string) => void;
  unenrollSubject: (subjectId: string) => void;

  // 時間割
  setTimetable: (timetable: TimetableItem[]) => void;
  addTimetableItem: (item: TimetableItem) => void;
  updateTimetableItem: (id: string, updates: Partial<TimetableItem>) => void;
  removeTimetableItem: (id: string) => void;

  // 成績
  setGrades: (grades: Grade[]) => void;
  addGrade: (grade: Grade) => void;
  updateGrade: (id: string, updates: Partial<Grade>) => void;

  // お知らせ
  setNotifications: (notifications: Notification[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  toggleNotificationStar: (id: string) => void;
  addNotification: (notification: Notification) => void;

  // 学務管理 - コース
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  removeCourse: (id: string) => void;

  // 学務管理 - 履修登録
  setRegistrations: (registrations: CourseRegistration[]) => void;
  addRegistration: (registration: CourseRegistration) => void;
  updateRegistration: (id: string, updates: Partial<CourseRegistration>) => void;
  removeRegistration: (id: string) => void;

  // 学務管理 - 学術記録
  setAcademicRecord: (record: AcademicRecord) => void;
  updateAcademicRecord: (updates: Partial<AcademicRecord>) => void;

  // 学務管理 - 履修計画
  setCoursePlans: (plans: CoursePlan[]) => void;
  addCoursePlan: (plan: CoursePlan) => void;
  updateCoursePlan: (id: string, updates: Partial<CoursePlan>) => void;
  removeCoursePlan: (id: string) => void;

  // 学務管理 - 学期情報
  setCurrentSemester: (semester: AcademicSemester) => void;

  // 設定
  updateSettings: (updates: Partial<AppSettings>) => void;

  // フィルター
  updateSubjectsFilter: (updates: Partial<AppState['filters']['subjects']>) => void;
  updateNotificationsFilter: (updates: Partial<AppState['filters']['notifications']>) => void;
  updateGradesFilter: (updates: Partial<AppState['filters']['grades']>) => void;
  updateCoursesFilter: (updates: Partial<CourseFilters>) => void;
  updateRegistrationsFilter: (updates: Partial<RegistrationFilters>) => void;
  updateAcademicRecordsFilter: (updates: Partial<AcademicRecordFilters>) => void;
  clearAllFilters: () => void;

  // ローディング状態
  setLoading: (key: keyof AppState['loading'], loading: boolean) => void;

  // データ初期化
  initializeData: () => void;
  resetStore: () => void;
}

const initialState: AppState = {
  isAuthenticated: false,
  student: null,
  subjects: [],
  timetable: [],
  grades: [],
  notifications: [],
  // 学務管理データ
  courses: [],
  registrations: [],
  academicRecord: null,
  coursePlans: [],
  currentSemester: null,
  loading: {
    subjects: false,
    timetable: false,
    grades: false,
    notifications: false,
    courses: false,
    registrations: false,
    academicRecord: false,
    coursePlans: false,
  },
  settings: {
    theme: 'system',
    language: 'ja',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    privacy: {
      shareGrades: false,
      shareSchedule: false,
    },
  },
  filters: {
    subjects: {
      category: 'all',
      status: 'enrolled',
      search: '',
    },
    notifications: {
      category: 'all',
      priority: 'all',
      unreadOnly: false,
      search: '',
    },
    grades: {
      year: '2024',
      semester: 'all',
      category: 'all',
    },
    courses: {
      search: '',
      department: [],
      category: [],
      credits: [],
      semester: [],
      dayOfWeek: [],
      period: [],
      instructor: [],
      availability: 'all',
      difficulty: [],
      rating: 0,
    },
    registrations: {
      academicYear: [],
      semester: [],
      status: [],
      category: [],
    },
    academicRecords: {
      academicYear: [],
      semester: [],
      category: [],
      gradeRange: [],
      gpaRange: [0, 4],
    },
  },
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // 認証
        login: (student) =>
          set((state) => {
            state.isAuthenticated = true;
            state.student = student;
          }),

        logout: () =>
          set((state) => {
            state.isAuthenticated = false;
            state.student = null;
            // 機密データをクリア
            state.grades = [];
            state.notifications = [];
          }),

        updateProfile: (updates) =>
          set((state) => {
            if (state.student) {
              Object.assign(state.student, updates);
            }
          }),

        // 履修科目
        setSubjects: (subjects) =>
          set((state) => {
            state.subjects = subjects;
          }),

        addSubject: (subject) =>
          set((state) => {
            state.subjects.push(subject);
          }),

        updateSubject: (id, updates) =>
          set((state) => {
            const index = state.subjects.findIndex((s) => s.id === id);
            if (index !== -1) {
              Object.assign(state.subjects[index], updates);
            }
          }),

        removeSubject: (id) =>
          set((state) => {
            state.subjects = state.subjects.filter((s) => s.id !== id);
          }),

        enrollSubject: (subjectId) =>
          set((state) => {
            const subject = state.subjects.find((s) => s.id === subjectId);
            if (subject && subject.status === 'available') {
              subject.status = 'enrolled';
              subject.currentStudents += 1;
            }
          }),

        unenrollSubject: (subjectId) =>
          set((state) => {
            const subject = state.subjects.find((s) => s.id === subjectId);
            if (subject && subject.status === 'enrolled') {
              subject.status = 'available';
              subject.currentStudents -= 1;
            }
          }),

        // 時間割
        setTimetable: (timetable) =>
          set((state) => {
            state.timetable = timetable;
          }),

        addTimetableItem: (item) =>
          set((state) => {
            state.timetable.push(item);
          }),

        updateTimetableItem: (id, updates) =>
          set((state) => {
            const index = state.timetable.findIndex((t) => t.id === id);
            if (index !== -1) {
              Object.assign(state.timetable[index], updates);
            }
          }),

        removeTimetableItem: (id) =>
          set((state) => {
            state.timetable = state.timetable.filter((t) => t.id !== id);
          }),

        // 成績
        setGrades: (grades) =>
          set((state) => {
            state.grades = grades;
          }),

        addGrade: (grade) =>
          set((state) => {
            state.grades.push(grade);
          }),

        updateGrade: (id, updates) =>
          set((state) => {
            const index = state.grades.findIndex((g) => g.id === id);
            if (index !== -1) {
              Object.assign(state.grades[index], updates);
            }
          }),

        // お知らせ
        setNotifications: (notifications) =>
          set((state) => {
            state.notifications = notifications;
          }),

        markNotificationAsRead: (id) =>
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (notification) {
              notification.read = true;
            }
          }),

        markAllNotificationsAsRead: () =>
          set((state) => {
            state.notifications.forEach((notification) => {
              notification.read = true;
            });
          }),

        toggleNotificationStar: (id) =>
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (notification) {
              notification.starred = !notification.starred;
            }
          }),

        addNotification: (notification) =>
          set((state) => {
            state.notifications.unshift(notification);
          }),

        // 学務管理 - コース
        setCourses: (courses) =>
          set((state) => {
            state.courses = courses;
          }),

        addCourse: (course) =>
          set((state) => {
            state.courses.push(course);
          }),

        updateCourse: (id, updates) =>
          set((state) => {
            const course = state.courses.find((c) => c.id === id);
            if (course) {
              Object.assign(course, updates);
            }
          }),

        removeCourse: (id) =>
          set((state) => {
            state.courses = state.courses.filter((c) => c.id !== id);
          }),

        // 学務管理 - 履修登録
        setRegistrations: (registrations) =>
          set((state) => {
            state.registrations = registrations;
          }),

        addRegistration: (registration) =>
          set((state) => {
            state.registrations.push(registration);
          }),

        updateRegistration: (id, updates) =>
          set((state) => {
            const registration = state.registrations.find((r) => r.id === id);
            if (registration) {
              Object.assign(registration, updates);
            }
          }),

        removeRegistration: (id) =>
          set((state) => {
            state.registrations = state.registrations.filter((r) => r.id !== id);
          }),

        // 学務管理 - 学術記録
        setAcademicRecord: (record) =>
          set((state) => {
            state.academicRecord = record;
          }),

        updateAcademicRecord: (updates) =>
          set((state) => {
            if (state.academicRecord) {
              Object.assign(state.academicRecord, updates);
            }
          }),

        // 学務管理 - 履修計画
        setCoursePlans: (plans) =>
          set((state) => {
            state.coursePlans = plans;
          }),

        addCoursePlan: (plan) =>
          set((state) => {
            state.coursePlans.push(plan);
          }),

        updateCoursePlan: (id, updates) =>
          set((state) => {
            const plan = state.coursePlans.find((p) => p.id === id);
            if (plan) {
              Object.assign(plan, updates);
            }
          }),

        removeCoursePlan: (id) =>
          set((state) => {
            state.coursePlans = state.coursePlans.filter((p) => p.id !== id);
          }),

        // 学務管理 - 学期情報
        setCurrentSemester: (semester) =>
          set((state) => {
            state.currentSemester = semester;
          }),

        // 設定
        updateSettings: (updates) =>
          set((state) => {
            Object.assign(state.settings, updates);
          }),

        // フィルター
        updateSubjectsFilter: (updates) =>
          set((state) => {
            Object.assign(state.filters.subjects, updates);
          }),

        updateNotificationsFilter: (updates) =>
          set((state) => {
            Object.assign(state.filters.notifications, updates);
          }),

        updateGradesFilter: (updates) =>
          set((state) => {
            Object.assign(state.filters.grades, updates);
          }),

        updateCoursesFilter: (updates) =>
          set((state) => {
            Object.assign(state.filters.courses, updates);
          }),

        updateRegistrationsFilter: (updates) =>
          set((state) => {
            Object.assign(state.filters.registrations, updates);
          }),

        updateAcademicRecordsFilter: (updates) =>
          set((state) => {
            Object.assign(state.filters.academicRecords, updates);
          }),

        clearAllFilters: () =>
          set((state) => {
            state.filters.subjects = initialState.filters.subjects;
            state.filters.notifications = initialState.filters.notifications;
            state.filters.grades = initialState.filters.grades;
            state.filters.courses = initialState.filters.courses;
            state.filters.registrations = initialState.filters.registrations;
            state.filters.academicRecords = initialState.filters.academicRecords;
          }),

        // ローディング状態
        setLoading: (key, loading) =>
          set((state) => {
            state.loading[key] = loading;
          }),

        // データ初期化
        initializeData: () => {
          // サンプルデータを設定
          set((state) => {
            // 学生情報
            state.student = {
              id: '1',
              name: '田中太郎',
              studentId: 'S2021001',
              email: 'tanaka.taro@university.ac.jp',
              department: '情報科学科',
              year: 3,
            };
            state.isAuthenticated = true;

            // サンプル成績データ
            state.grades = [
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
                subjectId: 'prog001',
                subjectName: 'プログラミング演習',
                subjectCode: 'PROG001',
                professor: '山田教授',
                credits: 3,
                semester: '後期',
                year: 2023,
                grade: 'A-',
                gpa: 3.7,
                category: '必修',
                department: '情報科学科',
                examScore: 88,
                reportScore: 92,
                attendanceScore: 100,
                finalScore: 90
              }
            ];

            // サンプル時間割データ
            state.timetable = [
              {
                id: '1',
                subjectId: 'cs301',
                subject: 'データベース論',
                professor: '田中教授',
                room: 'A301',
                startTime: '09:00',
                endTime: '10:30',
                dayOfWeek: 1, // Monday
                period: 1,
                color: '#3B82F6'
              },
              {
                id: '2',
                subjectId: 'math201',
                subject: '統計学',
                professor: '佐藤教授',
                room: 'B205',
                startTime: '10:40',
                endTime: '12:10',
                dayOfWeek: 2, // Tuesday
                period: 2,
                color: '#10B981'
              },
              {
                id: '3',
                subjectId: 'prog001',
                subject: 'プログラミング演習',
                professor: '山田教授',
                room: 'C102',
                startTime: '13:00',
                endTime: '14:30',
                dayOfWeek: 3, // Wednesday
                period: 3,
                color: '#F59E0B'
              }
            ];

            // サンプル履修科目データ
            state.subjects = [
              {
                id: 'cs301',
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
                room: 'A301',
                maxStudents: 40,
                currentStudents: 35,
                description: 'データベースの設計と実装について学習します',
                status: 'enrolled',
                rating: 4.5
              }
            ];
          });
        },

        resetStore: () => set(initialState),
      })),
      {
        name: 'university-portal-store',
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          student: state.student,
          settings: state.settings,
          // フィルター状態は永続化しない
        }),
      }
    ),
    {
      name: 'university-portal-store',
    }
  )
);