import {
  Course,
  CourseFilters,
  CourseSchedule,
  Instructor,
  Syllabus,
  CourseRestriction,
  CourseRecommendation,
  AcademicSemester
} from '../lib/types';

/**
 * 科目管理サービス
 * 科目の検索、フィルタリング、詳細取得、推奨アルゴリズムを提供
 */
export class CourseService {
  
  /**
   * 科目一覧を取得
   */
  static async getCourses(filters?: Partial<CourseFilters>): Promise<Course[]> {
    // 実際の実装ではAPIを呼び出す
    const allCourses = CourseService.getSampleCourses();
    
    if (!filters) return allCourses;
    
    return CourseService.applyCourseFilters(allCourses, filters);
  }
  
  /**
   * 科目IDで特定の科目を取得
   */
  static async getCourseById(courseId: string): Promise<Course | null> {
    const courses = CourseService.getSampleCourses();
    return courses.find(course => course.id === courseId) || null;
  }
  
  /**
   * 科目コードで検索
   */
  static async getCourseByCode(courseCode: string): Promise<Course | null> {
    const courses = CourseService.getSampleCourses();
    return courses.find(course => course.code === courseCode) || null;
  }
  
  /**
   * 学部・学科別科目取得
   */
  static async getCoursesByDepartment(department: string): Promise<Course[]> {
    const courses = CourseService.getSampleCourses();
    return courses.filter(course => course.department === department);
  }
  
  /**
   * 教員別科目取得
   */
  static async getCoursesByInstructor(instructorName: string): Promise<Course[]> {
    const courses = CourseService.getSampleCourses();
    return courses.filter(course => 
      course.instructors.some(instructor => 
        instructor.name.includes(instructorName)
      )
    );
  }
  
  /**
   * 時間割重複チェック
   */
  static checkScheduleConflict(
    existingCourses: Course[], 
    newCourse: Course
  ): { hasConflict: boolean; conflictingCourses: Course[] } {
    const conflictingCourses: Course[] = [];
    
    for (const existingCourse of existingCourses) {
      for (const existingSchedule of existingCourse.schedule) {
        for (const newSchedule of newCourse.schedule) {
          if (CourseService.isScheduleConflict(existingSchedule, newSchedule)) {
            conflictingCourses.push(existingCourse);
            break;
          }
        }
      }
    }
    
    return {
      hasConflict: conflictingCourses.length > 0,
      conflictingCourses
    };
  }
  
  /**
   * 前提科目チェック
   */
  static checkPrerequisites(
    course: Course, 
    completedCourseIds: string[]
  ): { satisfied: boolean; missingPrerequisites: string[] } {
    const missingPrerequisites = course.prerequisites.filter(
      prereqId => !completedCourseIds.includes(prereqId)
    );
    
    return {
      satisfied: missingPrerequisites.length === 0,
      missingPrerequisites
    };
  }
  
  /**
   * 履修制限チェック
   */
  static checkRestrictions(
    course: Course,
    studentGrade: number,
    studentDepartment: string,
    studentGPA: number,
    totalCredits: number
  ): { eligible: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // 学年制限
    if (course.targetGrades.length > 0 && !course.targetGrades.includes(studentGrade)) {
      violations.push(`対象学年: ${course.targetGrades.join('、')}年`);
    }
    
    // その他の制限をチェック
    for (const restriction of course.restrictions) {
      switch (restriction.type) {
        case 'department':
          if (restriction.value !== studentDepartment) {
            violations.push(`学科制限: ${restriction.value}`);
          }
          break;
        case 'gpa':
          if (studentGPA < Number(restriction.value)) {
            violations.push(`GPA制限: ${restriction.value}以上`);
          }
          break;
        case 'credits':
          if (totalCredits < Number(restriction.value)) {
            violations.push(`単位制限: ${restriction.value}単位以上`);
          }
          break;
      }
    }
    
    return {
      eligible: violations.length === 0,
      violations
    };
  }
  
  /**
   * 科目推奨アルゴリズム
   */
  static getRecommendedCourses(
    studentProfile: {
      id: string;
      grade: number;
      department: string;
      gpa: number;
      completedCourses: string[];
      interests: string[];
      targetCredits: number;
    },
    availableCourses: Course[]
  ): CourseRecommendation[] {
    const recommendations: CourseRecommendation[] = [];
    
    for (const course of availableCourses) {
      const score = CourseService.calculateRecommendationScore(course, studentProfile);
      const reasons = CourseService.getRecommendationReasons(course, studentProfile);
      const warnings = CourseService.getRecommendationWarnings(course, studentProfile);
      
      if (score > 0) {
        recommendations.push({
          courseId: course.id,
          score,
          reasons,
          warnings
        });
      }
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // 上位20件
  }
  
  /**
   * フィルター適用
   */
  private static applyCourseFilters(courses: Course[], filters: Partial<CourseFilters>): Course[] {
    return courses.filter(course => {
      // 検索キーワード
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          course.name.toLowerCase().includes(searchLower) ||
          course.code.toLowerCase().includes(searchLower) ||
          course.instructors.some(inst => inst.name.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      // 学部フィルター
      if (filters.department && filters.department.length > 0) {
        if (!filters.department.includes(course.department)) return false;
      }
      
      // カテゴリフィルター
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(course.category)) return false;
      }
      
      // 単位数フィルター
      if (filters.credits && filters.credits.length > 0) {
        if (!filters.credits.includes(course.credits)) return false;
      }
      
      // 学期フィルター
      if (filters.semester && filters.semester.length > 0) {
        if (!filters.semester.includes(course.semester)) return false;
      }
      
      // 曜日フィルター
      if (filters.dayOfWeek && filters.dayOfWeek.length > 0) {
        const coursedays = course.schedule.map(s => s.dayOfWeek);
        const hasMatchingDay = filters.dayOfWeek.some(day => coursedays.includes(day));
        if (!hasMatchingDay) return false;
      }
      
      // 時限フィルター
      if (filters.period && filters.period.length > 0) {
        const coursePeriods = course.schedule.map(s => s.period);
        const hasMatchingPeriod = filters.period.some(period => coursePeriods.includes(period));
        if (!hasMatchingPeriod) return false;
      }
      
      // 空席状況フィルター
      if (filters.availability && filters.availability !== 'all') {
        const isFull = course.currentStudents >= course.maxStudents;
        switch (filters.availability) {
          case 'available':
            if (isFull) return false;
            break;
          case 'full':
            if (!isFull) return false;
            break;
          case 'waitlist':
            // 将来の実装: ウェイトリスト機能
            break;
        }
      }
      
      // 難易度フィルター
      if (filters.difficulty && filters.difficulty.length > 0) {
        if (!filters.difficulty.includes(course.difficulty)) return false;
      }
      
      // 評価フィルター
      if (filters.rating && course.rating < filters.rating) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * スケジュール重複判定
   */
  private static isScheduleConflict(schedule1: CourseSchedule, schedule2: CourseSchedule): boolean {
    // 曜日が異なる場合は重複なし
    if (schedule1.dayOfWeek !== schedule2.dayOfWeek) return false;
    
    // 時限が同じ場合は重複
    if (schedule1.period === schedule2.period) return true;
    
    // 時間で詳細チェック
    const start1 = CourseService.timeToMinutes(schedule1.startTime);
    const end1 = CourseService.timeToMinutes(schedule1.endTime);
    const start2 = CourseService.timeToMinutes(schedule2.startTime);
    const end2 = CourseService.timeToMinutes(schedule2.endTime);
    
    return !(end1 <= start2 || end2 <= start1);
  }
  
  /**
   * 時間を分に変換
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  /**
   * 推奨スコア計算
   */
  private static calculateRecommendationScore(
    course: Course, 
    studentProfile: any
  ): number {
    let score = 0;
    
    // 基本点
    score += 50;
    
    // 必修科目は高スコア
    if (course.category === '必修') score += 40;
    else if (course.category === '選択必修') score += 30;
    
    // 学年適合性
    if (course.targetGrades.includes(studentProfile.grade)) score += 20;
    
    // 評価の高い科目
    score += course.rating * 5;
    
    // 難易度調整（GPAに基づく）
    const gpaFactor = studentProfile.gpa / 4.0;
    if (course.difficulty <= 3 && gpaFactor < 0.7) score += 10;
    if (course.difficulty >= 4 && gpaFactor > 0.8) score += 15;
    
    return Math.max(0, score);
  }
  
  /**
   * 推奨理由生成
   */
  private static getRecommendationReasons(course: Course, studentProfile: any) {
    const reasons = [];
    
    if (course.category === '必修') {
      reasons.push({
        type: 'degree-requirement' as const,
        description: '卒業に必要な必修科目です',
        weight: 0.4
      });
    }
    
    if (course.targetGrades.includes(studentProfile.grade)) {
      reasons.push({
        type: 'prerequisite' as const,
        description: 'あなたの学年に適した科目です',
        weight: 0.2
      });
    }
    
    if (course.rating >= 4.0) {
      reasons.push({
        type: 'interest' as const,
        description: '評価の高い人気科目です',
        weight: 0.3
      });
    }
    
    return reasons;
  }
  
  /**
   * 推奨警告生成
   */
  private static getRecommendationWarnings(course: Course, studentProfile: any): string[] {
    const warnings = [];
    
    if (course.difficulty >= 4 && studentProfile.gpa < 3.0) {
      warnings.push('この科目は難易度が高く、GPAが低い学生には推奨されません');
    }
    
    if (course.workload >= 4) {
      warnings.push('この科目は課題量が多く、時間管理に注意が必要です');
    }
    
    if (course.currentStudents / course.maxStudents > 0.9) {
      warnings.push('定員に近いため、早めの履修登録を推奨します');
    }
    
    return warnings;
  }
  
  /**
   * サンプル科目データ生成
   */
  private static getSampleCourses(): Course[] {
    const now = new Date();
    
    return [
      {
        id: 'cs101',
        code: 'CS101',
        name: 'プログラミング基礎',
        nameEn: 'Introduction to Programming',
        credits: 2,
        semester: 'spring',
        academicYear: 2024,
        department: '情報科学科',
        faculty: '工学部',
        schedule: [
          {
            id: 'cs101-schedule-1',
            dayOfWeek: 1, // 月曜日
            period: 1,
            startTime: '09:00',
            endTime: '10:30',
            room: 'C301',
            building: 'コンピュータ棟',
            type: 'lecture'
          },
          {
            id: 'cs101-schedule-2',
            dayOfWeek: 3, // 水曜日
            period: 2,
            startTime: '10:40',
            endTime: '12:10',
            room: 'PC201',
            building: 'コンピュータ棟',
            type: 'lab'
          }
        ],
        instructors: [
          {
            id: 'instructor-1',
            name: '田中一郎',
            nameEn: 'Ichiro Tanaka',
            title: '教授',
            department: '情報科学科',
            email: 'tanaka@university.ac.jp',
            office: 'C棟301号室',
            officeHours: '火・木 14:00-16:00',
            researchAreas: ['プログラミング言語', 'ソフトウェア工学']
          }
        ],
        category: '必修',
        targetGrades: [1, 2],
        maxStudents: 40,
        currentStudents: 35,
        prerequisites: [],
        corequisites: [],
        restrictions: [
          {
            type: 'department',
            condition: '学科限定',
            value: '情報科学科'
          }
        ],
        syllabus: {
          description: 'プログラミングの基本概念を学び、実際にコードを書く能力を身につけます。',
          objectives: [
            'プログラミングの基本構文を理解する',
            '簡単なアルゴリズムを実装できる',
            'デバッグの基本技術を習得する'
          ],
          plan: [
            { week: 1, topic: 'プログラミング概論', content: 'プログラミングとは何かを学ぶ' },
            { week: 2, topic: '変数と演算', content: '基本的なデータ型と演算子' },
            { week: 3, topic: '制御構造', content: 'if文とループ文' },
            // ... 他の週
          ],
          evaluation: [
            { type: 'exam', name: '中間試験', weight: 30, description: '講義内容の理解度を確認' },
            { type: 'exam', name: '期末試験', weight: 40, description: '総合的な理解度を評価' },
            { type: 'assignment', name: 'プログラミング課題', weight: 25, description: '実際のコーディング能力を評価' },
            { type: 'attendance', name: '出席', weight: 5, description: '出席状況' }
          ],
          textbooks: [
            {
              title: 'はじめてのプログラミング',
              author: '山田太郎',
              publisher: '技術出版',
              isbn: '978-4-12345-678-9',
              price: 2800,
              required: true
            }
          ],
          references: [
            'プログラミング言語入門 - 鈴木花子著',
            'コンピュータサイエンス概論 - 佐藤次郎著'
          ],
          notes: 'PCを持参すること。プログラミング経験は不要です。',
          lastUpdated: new Date('2024-03-15')
        },
        rating: 4.2,
        difficulty: 2,
        workload: 3,
        status: 'active',
        registrationPeriod: {
          start: new Date('2024-03-01'),
          end: new Date('2024-04-15')
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-15'),
        tags: ['プログラミング', '基礎', '必修']
      },
      {
        id: 'math201',
        code: 'MATH201',
        name: '微分積分学',
        nameEn: 'Calculus',
        credits: 3,
        semester: 'spring',
        academicYear: 2024,
        department: '数学科',
        faculty: '理学部',
        schedule: [
          {
            id: 'math201-schedule-1',
            dayOfWeek: 2, // 火曜日
            period: 2,
            startTime: '10:40',
            endTime: '12:10',
            room: 'A101',
            building: '本館',
            type: 'lecture'
          },
          {
            id: 'math201-schedule-2',
            dayOfWeek: 4, // 木曜日
            period: 2,
            startTime: '10:40',
            endTime: '12:10',
            room: 'A101',
            building: '本館',
            type: 'lecture'
          }
        ],
        instructors: [
          {
            id: 'instructor-2',
            name: '佐藤美智子',
            nameEn: 'Michiko Sato',
            title: '准教授',
            department: '数学科',
            email: 'sato@university.ac.jp',
            office: 'A棟205号室',
            officeHours: '月・金 13:00-15:00',
            researchAreas: ['解析学', '微分方程式']
          }
        ],
        category: '必修',
        targetGrades: [1, 2],
        maxStudents: 80,
        currentStudents: 75,
        prerequisites: [],
        corequisites: [],
        restrictions: [],
        syllabus: {
          description: '1変数および多変数関数の微分積分学を学習します。',
          objectives: [
            '微分の概念と計算方法を理解する',
            '積分の概念と計算方法を理解する',
            '微分積分学の応用問題を解ける'
          ],
          plan: [
            { week: 1, topic: '関数と極限', content: '関数の概念と極限の定義' },
            { week: 2, topic: '微分の定義', content: '導関数の定義と基本性質' },
            // ... 他の週
          ],
          evaluation: [
            { type: 'exam', name: '中間試験', weight: 40 },
            { type: 'exam', name: '期末試験', weight: 50 },
            { type: 'quiz', name: '小テスト', weight: 10 }
          ],
          textbooks: [
            {
              title: '微分積分学入門',
              author: '高橋正雄',
              publisher: '数学出版',
              isbn: '978-4-98765-432-1',
              price: 3200,
              required: true
            }
          ],
          references: ['解析学概論', '微分積分学演習'],
          notes: '高校数学IIIの知識が前提です。',
          lastUpdated: new Date('2024-02-20')
        },
        rating: 3.8,
        difficulty: 4,
        workload: 4,
        status: 'active',
        registrationPeriod: {
          start: new Date('2024-03-01'),
          end: new Date('2024-04-15')
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-02-20'),
        tags: ['数学', '微積分', '理系基礎']
      }
      // 追加のサンプル科目をここに含めることができます
    ];
  }
}