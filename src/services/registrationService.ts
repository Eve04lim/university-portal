import {
  CourseRegistration,
  Course,
  AcademicSemester,
  RegistrationFilters,
  Student
} from '../lib/types';
import { CourseService } from './courseService';

/**
 * 履修登録管理サービス
 * 履修登録、履修取消、単位数チェック、時間割重複チェックを提供
 */
export class RegistrationService {
  
  /**
   * 学生の履修登録一覧を取得
   */
  static async getRegistrations(
    studentId: string, 
    filters?: Partial<RegistrationFilters>
  ): Promise<CourseRegistration[]> {
    // 実際の実装ではAPIを呼び出す
    const allRegistrations = RegistrationService.getSampleRegistrations().filter(
      reg => reg.studentId === studentId
    );
    
    if (!filters) return allRegistrations;
    
    return RegistrationService.applyRegistrationFilters(allRegistrations, filters);
  }
  
  /**
   * 現在学期の履修登録取得
   */
  static async getCurrentRegistrations(studentId: string): Promise<CourseRegistration[]> {
    const currentYear = new Date().getFullYear();
    const currentSemester = RegistrationService.getCurrentSemester();
    
    return RegistrationService.getRegistrations(studentId, {
      academicYear: [currentYear],
      semester: [currentSemester]
    });
  }
  
  /**
   * 履修登録実行
   */
  static async registerCourse(
    studentId: string,
    courseId: string,
    registrationType: 'regular' | 'audit' | 'pass-fail' = 'regular'
  ): Promise<{
    success: boolean;
    registration?: CourseRegistration;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // 科目取得
      const course = await CourseService.getCourseById(courseId);
      if (!course) {
        errors.push('指定された科目が見つかりません');
        return { success: false, errors, warnings };
      }
      
      // 既存の履修登録チェック
      const existingRegistrations = await RegistrationService.getCurrentRegistrations(studentId);
      const alreadyRegistered = existingRegistrations.find(reg => 
        reg.courseId === courseId && 
        ['registered', 'waitlisted'].includes(reg.status)
      );
      
      if (alreadyRegistered) {
        errors.push('この科目は既に履修登録されています');
        return { success: false, errors, warnings };
      }
      
      // 履修制限チェック
      const student = await RegistrationService.getStudentInfo(studentId);
      if (!student) {
        errors.push('学生情報が見つかりません');
        return { success: false, errors, warnings };
      }
      
      const restrictionCheck = CourseService.checkRestrictions(
        course,
        student.year,
        student.department,
        3.0, // TODO: 実際のGPAを取得
        100 // TODO: 実際の単位数を取得
      );
      
      if (!restrictionCheck.eligible) {
        errors.push(...restrictionCheck.violations);
        return { success: false, errors, warnings };
      }
      
      // 前提科目チェック
      const completedCourses = existingRegistrations
        .filter(reg => reg.finalGrade && reg.finalGrade !== 'F')
        .map(reg => reg.courseId);
        
      const prerequisiteCheck = CourseService.checkPrerequisites(course, completedCourses);
      if (!prerequisiteCheck.satisfied) {
        const missingCourses = await Promise.all(
          prerequisiteCheck.missingPrerequisites.map(id => CourseService.getCourseById(id))
        );
        const missingNames = missingCourses
          .filter(c => c !== null)
          .map(c => c!.name)
          .join(', ');
        errors.push(`前提科目が不足しています: ${missingNames}`);
        return { success: false, errors, warnings };
      }
      
      // 時間割重複チェック
      const registeredCourses = await Promise.all(
        existingRegistrations
          .filter(reg => reg.status === 'registered')
          .map(reg => CourseService.getCourseById(reg.courseId))
      );
      const validCourses = registeredCourses.filter(c => c !== null) as Course[];
      
      const conflictCheck = CourseService.checkScheduleConflict(validCourses, course);
      if (conflictCheck.hasConflict) {
        const conflictNames = conflictCheck.conflictingCourses.map(c => c.name).join(', ');
        errors.push(`時間割が重複しています: ${conflictNames}`);
        return { success: false, errors, warnings };
      }
      
      // 定員チェック
      const isWaitlisted = course.currentStudents >= course.maxStudents;
      if (isWaitlisted && registrationType !== 'audit') {
        warnings.push('定員に達しているため、ウェイトリストに登録されます');
      }
      
      // 単位数上限チェック
      const currentCredits = existingRegistrations
        .filter(reg => reg.status === 'registered')
        .reduce((total, reg) => total + (reg.earnedCredits || 0), 0);
      
      const maxCreditsPerSemester = RegistrationService.getMaxCreditsPerSemester(student.year);
      if (currentCredits + course.credits > maxCreditsPerSemester) {
        warnings.push(`学期の履修上限単位数(${maxCreditsPerSemester}単位)を超過します`);
      }
      
      // 履修登録作成
      const registration: CourseRegistration = {
        id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        courseId,
        academicYear: course.academicYear,
        semester: course.semester,
        registrationDate: new Date(),
        status: isWaitlisted ? 'waitlisted' : 'registered',
        registrationType,
        lastModified: new Date()
      };
      
      // TODO: 実際の実装ではデータベースに保存
      
      return {
        success: true,
        registration,
        errors,
        warnings
      };
      
    } catch (error) {
      errors.push('履修登録中にエラーが発生しました');
      return { success: false, errors, warnings };
    }
  }
  
  /**
   * 履修取消
   */
  static async dropCourse(
    studentId: string,
    registrationId: string
  ): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // 履修登録取得
      const registrations = await RegistrationService.getRegistrations(studentId);
      const registration = registrations.find(reg => reg.id === registrationId);
      
      if (!registration) {
        errors.push('指定された履修登録が見つかりません');
        return { success: false, errors, warnings };
      }
      
      if (registration.status !== 'registered' && registration.status !== 'waitlisted') {
        errors.push('この履修登録は取消できません');
        return { success: false, errors, warnings };
      }
      
      // 履修取消期限チェック
      const semester = await RegistrationService.getCurrentSemesterInfo();
      const now = new Date();
      
      if (semester && now > semester.addDropDeadline) {
        // 履修取消期限後は withdraw 扱い
        if (now > semester.withdrawalDeadline) {
          errors.push('履修辞退期限を過ぎています');
          return { success: false, errors, warnings };
        } else {
          warnings.push('履修取消期限を過ぎているため、履修辞退として処理されます');
        }
      }
      
      // TODO: 実際の実装では更新処理を実行
      
      return { success: true, errors, warnings };
      
    } catch (error) {
      errors.push('履修取消中にエラーが発生しました');
      return { success: false, errors, warnings };
    }
  }
  
  /**
   * 履修可能科目一覧取得
   */
  static async getEligibleCourses(
    studentId: string,
    semester: string,
    academicYear: number
  ): Promise<Course[]> {
    // 全科目を取得
    const allCourses = await CourseService.getCourses({
      semester: [semester],
      availability: 'available'
    });
    
    // 学生情報取得
    const student = await RegistrationService.getStudentInfo(studentId);
    if (!student) return [];
    
    // 既履修科目取得
    const existingRegistrations = await RegistrationService.getRegistrations(studentId);
    const completedCourses = existingRegistrations
      .filter(reg => reg.finalGrade && reg.finalGrade !== 'F')
      .map(reg => reg.courseId);
    
    // フィルタリング
    return allCourses.filter(course => {
      // 既履修は除外
      if (completedCourses.includes(course.id)) return false;
      
      // 履修制限チェック
      const restrictionCheck = CourseService.checkRestrictions(
        course,
        student.year,
        student.department,
        3.0, // TODO: 実際のGPAを取得
        100 // TODO: 実際の単位数を取得
      );
      if (!restrictionCheck.eligible) return false;
      
      // 前提科目チェック
      const prerequisiteCheck = CourseService.checkPrerequisites(course, completedCourses);
      if (!prerequisiteCheck.satisfied) return false;
      
      return true;
    });
  }
  
  /**
   * 履修単位数集計
   */
  static async getCreditSummary(
    studentId: string,
    academicYear?: number,
    semester?: string
  ): Promise<{
    totalCredits: number;
    earnedCredits: number;
    inProgressCredits: number;
    categoryBreakdown: Record<string, {
      total: number;
      earned: number;
      inProgress: number;
    }>;
  }> {
    const registrations = await RegistrationService.getRegistrations(studentId);
    
    let filteredRegistrations = registrations;
    if (academicYear) {
      filteredRegistrations = filteredRegistrations.filter(reg => reg.academicYear === academicYear);
    }
    if (semester) {
      filteredRegistrations = filteredRegistrations.filter(reg => reg.semester === semester);
    }
    
    const categoryBreakdown: Record<string, { total: number; earned: number; inProgress: number }> = {};
    
    let totalCredits = 0;
    let earnedCredits = 0;
    let inProgressCredits = 0;
    
    for (const registration of filteredRegistrations) {
      const course = await CourseService.getCourseById(registration.courseId);
      if (!course) continue;
      
      const credits = course.credits;
      const category = course.category;
      
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { total: 0, earned: 0, inProgress: 0 };
      }
      
      totalCredits += credits;
      categoryBreakdown[category].total += credits;
      
      if (registration.finalGrade && registration.finalGrade !== 'F') {
        earnedCredits += credits;
        categoryBreakdown[category].earned += credits;
      } else if (registration.status === 'registered') {
        inProgressCredits += credits;
        categoryBreakdown[category].inProgress += credits;
      }
    }
    
    return {
      totalCredits,
      earnedCredits,
      inProgressCredits,
      categoryBreakdown
    };
  }
  
  /**
   * フィルター適用
   */
  private static applyRegistrationFilters(
    registrations: CourseRegistration[],
    filters: Partial<RegistrationFilters>
  ): CourseRegistration[] {
    return registrations.filter(registration => {
      if (filters.academicYear && !filters.academicYear.includes(registration.academicYear)) {
        return false;
      }
      
      if (filters.semester && !filters.semester.includes(registration.semester)) {
        return false;
      }
      
      if (filters.status && !filters.status.includes(registration.status)) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * 現在の学期取得
   */
  private static getCurrentSemester(): string {
    const now = new Date();
    const month = now.getMonth() + 1;
    
    if (month >= 4 && month <= 8) {
      return 'spring';
    } else if (month >= 9 && month <= 2) {
      return 'fall';
    } else {
      return 'intensive';
    }
  }
  
  /**
   * 現在の学期情報取得
   */
  private static async getCurrentSemesterInfo(): Promise<AcademicSemester | null> {
    // TODO: 実際の実装では学期情報APIから取得
    const currentYear = new Date().getFullYear();
    const currentSemester = RegistrationService.getCurrentSemester();
    
    return {
      id: `${currentYear}-${currentSemester}`,
      academicYear: currentYear,
      semester: currentSemester as 'spring' | 'fall' | 'intensive',
      name: `${currentYear}年度${currentSemester === 'spring' ? '前期' : '後期'}`,
      startDate: new Date(`${currentYear}-04-01`),
      endDate: new Date(`${currentYear}-09-30`),
      registrationStart: new Date(`${currentYear}-03-01`),
      registrationEnd: new Date(`${currentYear}-04-15`),
      addDropDeadline: new Date(`${currentYear}-04-30`),
      withdrawalDeadline: new Date(`${currentYear}-07-15`),
      finalExamStart: new Date(`${currentYear}-07-20`),
      finalExamEnd: new Date(`${currentYear}-07-31`),
      status: 'active'
    };
  }
  
  /**
   * 学年別履修上限単位数取得
   */
  private static getMaxCreditsPerSemester(grade: number): number {
    switch (grade) {
      case 1: return 22;
      case 2: return 24;
      case 3: return 26;
      case 4: return 28;
      default: return 20;
    }
  }
  
  /**
   * 学生情報取得（簡易版）
   */
  private static async getStudentInfo(studentId: string): Promise<Student | null> {
    // TODO: 実際の実装では学生情報APIから取得
    return {
      id: studentId,
      name: '田中太郎',
      studentId: 'S2021001',
      email: 'tanaka@university.ac.jp',
      department: '情報科学科',
      year: 2
    };
  }
  
  /**
   * サンプル履修登録データ生成
   */
  private static getSampleRegistrations(): CourseRegistration[] {
    return [
      {
        id: 'reg-001',
        studentId: 'student-1',
        courseId: 'cs101',
        academicYear: 2024,
        semester: 'spring',
        registrationDate: new Date('2024-03-15'),
        status: 'registered',
        registrationType: 'regular',
        lastModified: new Date('2024-03-15')
      },
      {
        id: 'reg-002',
        studentId: 'student-1',
        courseId: 'math201',
        academicYear: 2024,
        semester: 'spring',
        registrationDate: new Date('2024-03-16'),
        status: 'registered',
        registrationType: 'regular',
        lastModified: new Date('2024-03-16')
      },
      {
        id: 'reg-003',
        studentId: 'student-1',
        courseId: 'phys101',
        academicYear: 2023,
        semester: 'fall',
        registrationDate: new Date('2023-09-15'),
        status: 'registered',
        registrationType: 'regular',
        finalGrade: 'B+',
        gpa: 3.3,
        earnedCredits: 2,
        lastModified: new Date('2024-01-20')
      }
    ];
  }
}