import {
  AcademicRecord,
  SemesterRecord,
  DegreeProgress,
  CategoryProgress,
  Honor,
  Probation,
  CourseRegistration,
  AcademicRecordFilters,
  Course,
  CourseGrade,
  SemesterGPA,
  GraduationRequirement,
  GraduationRequirements
} from '../lib/types';
import { RegistrationService } from './registrationService';
import { CourseService } from './courseService';

/**
 * 学術記録管理サービス
 * 成績管理、GPA計算、卒業要件進捗追跡を提供
 */
export class AcademicRecordsService {
  
  /**
   * 学生の学術記録を取得
   */
  static async getAcademicRecord(studentId: string): Promise<AcademicRecord | null> {
    try {
      // 履修登録一覧を取得
      const registrations = await RegistrationService.getRegistrations(studentId);
      
      // 学期別に整理
      const semesterRecords = await AcademicRecordsService.createSemesterRecords(registrations);
      
      // 累計情報を計算
      const { totalCreditsEarned, totalCreditsAttempted, cumulativeGPA } = 
        AcademicRecordsService.calculateCumulativeStats(registrations);
      
      // 学位要件進捗を計算
      const degreeProgress = await AcademicRecordsService.calculateDegreeProgress(
        studentId, 
        registrations
      );
      
      // 表彰・警告を取得
      const honors = AcademicRecordsService.calculateHonors(semesterRecords);
      const probations = AcademicRecordsService.calculateProbations(semesterRecords);
      
      // コース成績をフラット化
      const courseGrades = AcademicRecordsService.flattenCourseGrades(registrations);
      
      // 学期別GPAを作成
      const semesterGPAs = AcademicRecordsService.createSemesterGPAs(semesterRecords);
      
      // 卒業要件を作成
      const graduationRequirements = await AcademicRecordsService.createGraduationRequirements(
        studentId, 
        registrations
      );

      return {
        id: `record-${studentId}`,
        studentId,
        semesterRecords,
        totalCreditsEarned,
        totalCreditsAttempted,
        cumulativeGPA,
        overallGPA: cumulativeGPA,
        courseGrades,
        semesterGPAs,
        graduationRequirements,
        degreeProgress,
        honors,
        probations,
        lastUpdated: new Date()
      };
      
    } catch (error) {
      console.error('学術記録取得エラー:', error);
      return null;
    }
  }
  
  /**
   * 学期別成績を取得
   */
  static async getSemesterRecord(
    studentId: string,
    academicYear: number,
    semester: string
  ): Promise<SemesterRecord | null> {
    const registrations = await RegistrationService.getRegistrations(studentId, {
      academicYear: [academicYear],
      semester: [semester]
    });
    
    if (registrations.length === 0) return null;
    
    const semesterGPA = AcademicRecordsService.calculateSemesterGPA(registrations);
    const semesterCredits = AcademicRecordsService.calculateSemesterCredits(registrations);
    
    return {
      semester: {
        id: `${academicYear}-${semester}`,
        academicYear,
        semester: semester as 'spring' | 'fall' | 'intensive',
        name: `${academicYear}年度${AcademicRecordsService.getSemesterName(semester)}`,
        startDate: new Date(`${academicYear}-04-01`),
        endDate: new Date(`${academicYear}-09-30`),
        registrationStart: new Date(`${academicYear}-03-01`),
        registrationEnd: new Date(`${academicYear}-04-15`),
        addDropDeadline: new Date(`${academicYear}-04-30`),
        withdrawalDeadline: new Date(`${academicYear}-07-15`),
        finalExamStart: new Date(`${academicYear}-07-20`),
        finalExamEnd: new Date(`${academicYear}-07-31`),
        status: 'finished'
      },
      registrations,
      semesterGPA,
      semesterCredits
    };
  }
  
  /**
   * GPA履歴を取得
   */
  static async getGPAHistory(studentId: string): Promise<{
    semester: string;
    academicYear: number;
    semesterGPA: number;
    cumulativeGPA: number;
    credits: number;
  }[]> {
    const registrations = await RegistrationService.getRegistrations(studentId);
    const semesterRecords = await AcademicRecordsService.createSemesterRecords(registrations);
    
    let cumulativeGPA = 0;
    let totalPoints = 0;
    let totalCredits = 0;
    
    return semesterRecords.map(record => {
      // 学期の成績ポイントと単位数を加算
      const semesterPoints = record.registrations
        .filter(reg => reg.finalGrade && reg.gpa)
        .reduce((sum, reg) => {
          const course = registrations.find(r => r.id === reg.id);
          return sum + (reg.gpa! * (reg.earnedCredits || 0));
        }, 0);
      
      const semesterCredits = record.registrations
        .filter(reg => reg.finalGrade && reg.finalGrade !== 'F')
        .reduce((sum, reg) => sum + (reg.earnedCredits || 0), 0);
      
      totalPoints += semesterPoints;
      totalCredits += semesterCredits;
      cumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
      
      return {
        semester: record.semester.semester,
        academicYear: record.semester.academicYear,
        semesterGPA: record.semesterGPA,
        cumulativeGPA: Math.round(cumulativeGPA * 100) / 100,
        credits: semesterCredits
      };
    });
  }
  
  /**
   * 卒業判定を実行
   */
  static async checkGraduationEligibility(studentId: string): Promise<{
    eligible: boolean;
    progress: DegreeProgress;
    missingRequirements: string[];
    estimatedGraduation: Date;
  }> {
    const degreeProgress = await AcademicRecordsService.calculateDegreeProgress(
      studentId,
      await RegistrationService.getRegistrations(studentId)
    );
    
    const missingRequirements: string[] = [];
    
    // 単位数チェック
    if (degreeProgress.earnedCredits < degreeProgress.totalRequiredCredits) {
      missingRequirements.push(
        `単位数不足: ${degreeProgress.earnedCredits}/${degreeProgress.totalRequiredCredits}単位`
      );
    }
    
    // カテゴリ別単位数チェック
    for (const category of degreeProgress.categoryProgress) {
      if (category.earnedCredits < category.requiredCredits) {
        missingRequirements.push(
          `${category.category}: ${category.earnedCredits}/${category.requiredCredits}単位`
        );
      }
    }
    
    // その他の要件チェック
    missingRequirements.push(...degreeProgress.remainingRequirements);
    
    const eligible = missingRequirements.length === 0;
    
    return {
      eligible,
      progress: degreeProgress,
      missingRequirements,
      estimatedGraduation: degreeProgress.expectedGraduation
    };
  }
  
  /**
   * 成績証明書データを生成
   */
  static async generateTranscript(
    studentId: string,
    filters?: Partial<AcademicRecordFilters>
  ): Promise<{
    studentInfo: any;
    semesterRecords: SemesterRecord[];
    summary: {
      totalCredits: number;
      cumulativeGPA: number;
      honors: Honor[];
    };
  }> {
    const record = await AcademicRecordsService.getAcademicRecord(studentId);
    if (!record) {
      throw new Error('学術記録が見つかりません');
    }
    
    let filteredRecords = record.semesterRecords;
    
    // フィルター適用
    if (filters) {
      if (filters.academicYear && filters.academicYear.length > 0) {
        filteredRecords = filteredRecords.filter(r => 
          filters.academicYear!.includes(r.semester.academicYear)
        );
      }
      
      if (filters.semester && filters.semester.length > 0) {
        filteredRecords = filteredRecords.filter(r => 
          filters.semester!.includes(r.semester.semester)
        );
      }
    }
    
    // 学生情報を取得（簡易版）
    const studentInfo = {
      id: studentId,
      name: '田中太郎',
      studentId: 'S2021001',
      department: '情報科学科',
      year: 2
    };
    
    return {
      studentInfo,
      semesterRecords: filteredRecords,
      summary: {
        totalCredits: record.totalCreditsEarned,
        cumulativeGPA: record.cumulativeGPA,
        honors: record.honors
      }
    };
  }
  
  /**
   * 学期別記録を作成
   */
  private static async createSemesterRecords(
    registrations: CourseRegistration[]
  ): Promise<SemesterRecord[]> {
    // 学期別にグループ化
    const semesterGroups = registrations.reduce((groups, reg) => {
      const key = `${reg.academicYear}-${reg.semester}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(reg);
      return groups;
    }, {} as Record<string, CourseRegistration[]>);
    
    const records: SemesterRecord[] = [];
    
    for (const [key, regs] of Object.entries(semesterGroups)) {
      const [year, semester] = key.split('-');
      const academicYear = parseInt(year);
      
      const semesterGPA = AcademicRecordsService.calculateSemesterGPA(regs);
      const semesterCredits = AcademicRecordsService.calculateSemesterCredits(regs);
      
      records.push({
        semester: {
          id: key,
          academicYear,
          semester: semester as 'spring' | 'fall' | 'intensive',
          name: `${academicYear}年度${AcademicRecordsService.getSemesterName(semester)}`,
          startDate: new Date(`${academicYear}-04-01`),
          endDate: new Date(`${academicYear}-09-30`),
          registrationStart: new Date(`${academicYear}-03-01`),
          registrationEnd: new Date(`${academicYear}-04-15`),
          addDropDeadline: new Date(`${academicYear}-04-30`),
          withdrawalDeadline: new Date(`${academicYear}-07-15`),
          finalExamStart: new Date(`${academicYear}-07-20`),
          finalExamEnd: new Date(`${academicYear}-07-31`),
          status: academicYear < new Date().getFullYear() ? 'finished' : 'active'
        },
        registrations: regs,
        semesterGPA,
        semesterCredits
      });
    }
    
    return records.sort((a, b) => {
      if (a.semester.academicYear !== b.semester.academicYear) {
        return a.semester.academicYear - b.semester.academicYear;
      }
      return a.semester.semester.localeCompare(b.semester.semester);
    });
  }
  
  /**
   * 学期GPA計算
   */
  private static calculateSemesterGPA(registrations: CourseRegistration[]): number {
    const graded = registrations.filter(reg => reg.finalGrade && reg.gpa);
    
    if (graded.length === 0) return 0;
    
    const totalPoints = graded.reduce((sum, reg) => 
      sum + (reg.gpa! * (reg.earnedCredits || 0)), 0
    );
    const totalCredits = graded.reduce((sum, reg) => 
      sum + (reg.earnedCredits || 0), 0
    );
    
    return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  }
  
  /**
   * 学期単位数計算
   */
  private static calculateSemesterCredits(registrations: CourseRegistration[]): number {
    return registrations
      .filter(reg => reg.finalGrade && reg.finalGrade !== 'F')
      .reduce((sum, reg) => sum + (reg.earnedCredits || 0), 0);
  }
  
  /**
   * 累計統計計算
   */
  private static calculateCumulativeStats(registrations: CourseRegistration[]): {
    totalCreditsEarned: number;
    totalCreditsAttempted: number;
    cumulativeGPA: number;
  } {
    const graded = registrations.filter(reg => reg.finalGrade);
    const passed = graded.filter(reg => reg.finalGrade !== 'F');
    
    const totalCreditsEarned = passed.reduce((sum, reg) => 
      sum + (reg.earnedCredits || 0), 0
    );
    const totalCreditsAttempted = graded.reduce((sum, reg) => 
      sum + (reg.earnedCredits || 0), 0
    );
    
    const totalPoints = passed
      .filter(reg => reg.gpa)
      .reduce((sum, reg) => sum + (reg.gpa! * (reg.earnedCredits || 0)), 0);
    const cumulativeGPA = totalCreditsEarned > 0 ? 
      Math.round((totalPoints / totalCreditsEarned) * 100) / 100 : 0;
    
    return {
      totalCreditsEarned,
      totalCreditsAttempted,
      cumulativeGPA
    };
  }
  
  /**
   * 学位要件進捗計算
   */
  private static async calculateDegreeProgress(
    studentId: string,
    registrations: CourseRegistration[]
  ): Promise<DegreeProgress> {
    // プログラム別要件（簡易版）
    const requirements = AcademicRecordsService.getDegreeRequirements('情報科学科');
    
    const earnedCredits = registrations
      .filter(reg => reg.finalGrade && reg.finalGrade !== 'F')
      .reduce((sum, reg) => sum + (reg.earnedCredits || 0), 0);
    
    // カテゴリ別進捗計算
    const categoryProgress: CategoryProgress[] = [];
    
    for (const [category, requiredCredits] of Object.entries(requirements.categories)) {
      const categoryRegistrations = registrations.filter(async reg => {
        const course = await CourseService.getCourseById(reg.courseId);
        return course?.category === category;
      });
      
      const earned = categoryRegistrations
        .filter(reg => reg.finalGrade && reg.finalGrade !== 'F')
        .reduce((sum, reg) => sum + (reg.earnedCredits || 0), 0);
      
      const inProgress = categoryRegistrations
        .filter(reg => reg.status === 'registered')
        .reduce((sum, reg) => sum + (reg.earnedCredits || 0), 0);
      
      categoryProgress.push({
        category,
        requiredCredits,
        earnedCredits: earned,
        inProgressCredits: inProgress,
        courses: categoryRegistrations.map(reg => reg.courseId)
      });
    }
    
    // 卒業見込み計算
    const remainingCredits = requirements.totalCredits - earnedCredits;
    const semestersRemaining = Math.ceil(remainingCredits / 20); // 1学期平均20単位
    const expectedGraduation = new Date();
    expectedGraduation.setMonth(expectedGraduation.getMonth() + semestersRemaining * 6);
    
    const graduationEligible = remainingCredits <= 0;
    const remainingRequirements = graduationEligible ? [] : [
      `残り${remainingCredits}単位必要`,
      '卒業論文未提出' // 例
    ];
    
    return {
      program: '情報科学科学士課程',
      totalRequiredCredits: requirements.totalCredits,
      earnedCredits,
      categoryProgress,
      expectedGraduation,
      graduationEligible,
      remainingRequirements
    };
  }
  
  /**
   * 表彰計算
   */
  private static calculateHonors(semesterRecords: SemesterRecord[]): Honor[] {
    const honors: Honor[] = [];
    
    semesterRecords.forEach(record => {
      // Dean's List (学期GPA 3.7以上)
      if (record.semesterGPA >= 3.7) {
        honors.push({
          type: 'dean-list',
          name: 'Dean\'s List',
          semester: record.semester.semester,
          academicYear: record.semester.academicYear,
          gpa: record.semesterGPA
        });
      }
      
      // Honor Roll (学期GPA 3.5以上)
      if (record.semesterGPA >= 3.5 && record.semesterGPA < 3.7) {
        honors.push({
          type: 'honor-roll',
          name: 'Honor Roll',
          semester: record.semester.semester,
          academicYear: record.semester.academicYear,
          gpa: record.semesterGPA
        });
      }
    });
    
    return honors;
  }
  
  /**
   * 学業警告計算
   */
  private static calculateProbations(semesterRecords: SemesterRecord[]): Probation[] {
    const probations: Probation[] = [];
    
    semesterRecords.forEach(record => {
      // Academic Warning (学期GPA 2.0未満)
      if (record.semesterGPA < 2.0 && record.semesterGPA > 0) {
        probations.push({
          type: 'academic-warning',
          semester: record.semester.semester,
          academicYear: record.semester.academicYear,
          reason: `学期GPA ${record.semesterGPA}が基準を下回りました`,
          requirements: [
            '次学期のGPAを2.5以上にする',
            '学習計画書を提出する'
          ],
          resolved: false
        });
      }
    });
    
    return probations;
  }
  
  /**
   * 学期名取得
   */
  private static getSemesterName(semester: string): string {
    switch (semester) {
      case 'spring': return '前期';
      case 'fall': return '後期';
      case 'intensive': return '集中講義';
      default: return semester;
    }
  }
  
  /**
   * 学位要件取得（簡易版）
   */
  private static getDegreeRequirements(program: string): {
    totalCredits: number;
    categories: Record<string, number>;
  } {
    // 情報科学科の例
    return {
      totalCredits: 124,
      categories: {
        '必修': 40,
        '選択必修': 30,
        '選択': 40,
        '自由': 14
      }
    };
  }

  /**
   * 成績証明書エクスポート
   */
  static async exportTranscript(studentId: string, format: 'pdf' | 'csv' = 'pdf'): Promise<Blob> {
    const record = await this.getAcademicRecord(studentId);
    if (!record) {
      throw new Error('学術記録が見つかりません');
    }

    if (format === 'csv') {
      return this.exportTranscriptAsCSV(record);
    } else {
      return this.exportTranscriptAsPDF(record);
    }
  }

  /**
   * CSV形式で成績証明書をエクスポート
   */
  private static exportTranscriptAsCSV(record: AcademicRecord): Blob {
    const headers = ['科目コード', '科目名', '単位数', '学年', '学期', '成績', 'GPA'];
    const rows = record.courseGrades.map(grade => [
      grade.courseCode,
      grade.courseName,
      grade.credits.toString(),
      grade.academicYear.toString(),
      grade.semester,
      grade.finalGrade,
      grade.gpa.toString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * PDF形式で成績証明書をエクスポート（簡易版）
   */
  private static exportTranscriptAsPDF(record: AcademicRecord): Blob {
    // 実際のPDF生成は別のライブラリ（jsPDFなど）を使用
    const content = `成績証明書\n学生ID: ${record.studentId}\n累計GPA: ${record.cumulativeGPA}\n取得単位数: ${record.totalCreditsEarned}`;
    return new Blob([content], { type: 'application/pdf' });
  }

  /**
   * 履修登録をコース成績にフラット化
   */
  private static flattenCourseGrades(registrations: CourseRegistration[]): CourseGrade[] {
    return registrations
      .filter(reg => reg.finalGrade && reg.gpa !== undefined)
      .map(reg => ({
        id: `grade-${reg.id}`,
        courseId: reg.courseId,
        courseName: reg.courseName || '',
        courseCode: reg.courseCode || '',
        credits: reg.credits || 0,
        category: '', // 実際のデータからカテゴリを取得
        academicYear: reg.academicYear,
        semester: reg.semester,
        finalGrade: reg.finalGrade!,
        grade: reg.grade || reg.finalGrade!,
        gpa: reg.gpa!,
        gradePoints: reg.gpa! * (reg.credits || 0),
        instructors: [] // 実際のデータから教員情報を取得
      }));
  }

  /**
   * 学期別GPA配列を作成
   */
  private static createSemesterGPAs(semesterRecords: SemesterRecord[]): SemesterGPA[] {
    return semesterRecords.map(record => ({
      academicYear: record.semester.academicYear,
      semester: record.semester.semester,
      gpa: record.semesterGPA,
      credits: record.semesterCredits
    }));
  }

  /**
   * 卒業要件を作成
   */
  private static async createGraduationRequirements(
    studentId: string, 
    registrations: CourseRegistration[]
  ): Promise<GraduationRequirements> {
    const requirements = [
      {
        id: 'req-general',
        category: '必修',
        name: '必修科目',
        requiredCredits: 40,
        creditsRequired: 40,
        earnedCredits: 0,
        inProgressCredits: 0,
        completed: false,
        courses: [],
        description: '学位取得に必要な必修科目'
      },
      {
        id: 'req-elective-required',
        category: '選択必修',
        name: '選択必修科目',
        requiredCredits: 30,
        creditsRequired: 30,
        earnedCredits: 0,
        inProgressCredits: 0,
        completed: false,
        courses: [],
        description: '指定された科目群から選択する必修科目'
      },
      {
        id: 'req-elective',
        category: '選択',
        name: '選択科目',
        requiredCredits: 40,
        creditsRequired: 40,
        earnedCredits: 0,
        inProgressCredits: 0,
        completed: false,
        courses: [],
        description: '自由に選択できる科目'
      },
      {
        id: 'req-free',
        category: '自由',
        name: '自由科目',
        requiredCredits: 14,
        creditsRequired: 14,
        earnedCredits: 0,
        inProgressCredits: 0,
        completed: false,
        courses: [],
        description: '他学部科目等も含む自由科目'
      }
    ];

    // 各要件の進捗を計算（簡易版）
    const updatedRequirements = requirements.map(req => ({
      ...req,
      completed: req.earnedCredits >= req.requiredCredits
    }));

    // GraduationRequirements型に拡張
    const graduationRequirements = updatedRequirements as GraduationRequirements;
    graduationRequirements.totalCreditsRequired = requirements.reduce((sum, req) => sum + req.requiredCredits, 0);
    graduationRequirements.categoryRequirements = updatedRequirements;

    return graduationRequirements;
  }
}