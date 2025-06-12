import { 
  StudySession, 
  AcademicProgress, 
  SubjectPerformance 
} from '../app/components/analytics/types';
import { Grade, TimetableItem, Subject } from '../lib/types';

/**
 * Analytics Data Service
 * Transforms existing app data (grades, timetable, subjects) into analytics format
 */

export class AnalyticsDataService {
  /**
   * Transform Grade data to SubjectPerformance analytics format
   */
  static transformGradesToSubjectPerformance(grades: Grade[]): SubjectPerformance[] {
    return grades
      .filter(grade => grade.grade !== '履修中') // Exclude current enrollments
      .map(grade => {
        // Convert letter grades to numeric scores for analysis
        const gradeToScore = {
          'A+': 95, 'A': 90, 'A-': 87,
          'B+': 83, 'B': 80, 'B-': 77,
          'C+': 73, 'C': 70, 'C-': 67,
          'D+': 63, 'D': 60, 'F': 0
        };

        const midtermScore = grade.examScore || gradeToScore[grade.grade as keyof typeof gradeToScore] || 0;
        const finalScore = grade.finalScore || gradeToScore[grade.grade as keyof typeof gradeToScore] || 0;
        const assignmentScores = [
          grade.reportScore || finalScore,
          grade.attendanceScore || 90,
          finalScore
        ];

        return {
          subjectId: grade.subjectId,
          subjectName: grade.subjectName,
          category: grade.category,
          semester: grade.semester,
          year: grade.year,
          currentGrade: grade.grade,
          midtermScore,
          finalScore,
          assignmentScores,
          attendanceRate: grade.attendanceScore || 90,
          studyHours: AnalyticsDataService.estimateStudyHours(grade.credits, grade.category),
          difficulty: AnalyticsDataService.calculateDifficulty(grade.category, grade.gpa),
          satisfaction: AnalyticsDataService.calculateSatisfaction(grade.gpa, grade.credits)
        } as SubjectPerformance;
      });
  }

  /**
   * Transform Grade data to AcademicProgress analytics format
   */
  static transformGradesToAcademicProgress(grades: Grade[]): AcademicProgress[] {
    const semesterMap = new Map<string, {
      semester: string;
      year: number;
      totalCredits: number;
      totalGpa: number;
      subjects: Grade[];
    }>();

    // Group grades by semester
    grades.forEach(grade => {
      if (grade.grade === '履修中') return; // Skip current enrollments

      const key = `${grade.year}-${grade.semester}`;
      if (!semesterMap.has(key)) {
        semesterMap.set(key, {
          semester: grade.semester,
          year: grade.year,
          totalCredits: 0,
          totalGpa: 0,
          subjects: []
        });
      }

      const semesterData = semesterMap.get(key)!;
      semesterData.subjects.push(grade);
      semesterData.totalCredits += grade.credits;
      semesterData.totalGpa += grade.gpa * grade.credits;
    });

    // Convert to AcademicProgress format
    return Array.from(semesterMap.values()).map(semesterData => {
      const averageGpa = semesterData.totalGpa / semesterData.totalCredits;
      const averageGrade = semesterData.subjects.reduce((sum, g) => {
        const gradeToScore = {
          'A+': 95, 'A': 90, 'A-': 87,
          'B+': 83, 'B': 80, 'B-': 77,
          'C+': 73, 'C': 70, 'C-': 67,
          'D+': 63, 'D': 60, 'F': 0
        };
        return sum + (gradeToScore[g.grade as keyof typeof gradeToScore] || 0);
      }, 0) / semesterData.subjects.length;

      return {
        semester: semesterData.semester,
        year: semesterData.year,
        gpa: Math.round(averageGpa * 100) / 100,
        credits: semesterData.totalCredits,
        totalSubjects: semesterData.subjects.length,
        passedSubjects: semesterData.subjects.filter(g => g.grade !== 'F').length,
        failedSubjects: semesterData.subjects.filter(g => g.grade === 'F').length,
        averageGrade: Math.round(averageGrade)
      } as AcademicProgress;
    });
  }

  /**
   * Generate study sessions based on timetable and subject data
   */
  static generateStudySessionsFromTimetable(
    timetable: TimetableItem[], 
    subjects: Subject[], 
    weeks: number = 4
  ): StudySession[] {
    const sessions: StudySession[] = [];
    const now = new Date();

    // Generate sessions for the past N weeks
    for (let week = 0; week < weeks; week++) {
      timetable.forEach(item => {
        const subject = subjects.find(s => s.id === item.subjectId || s.name === item.subject);
        if (!subject) return;

        // Calculate session date
        const sessionDate = new Date(now);
        const dayOfWeek = typeof item.dayOfWeek === 'string' ? parseInt(item.dayOfWeek) : item.dayOfWeek;
        sessionDate.setDate(now.getDate() - (week * 7) + (dayOfWeek - now.getDay()));

        // Generate random variations for realistic data
        const baseEfficiency = AnalyticsDataService.getBaseEfficiency(item.subject);
        const efficiency = Math.max(1, Math.min(5, 
          baseEfficiency + (Math.random() - 0.5) * 2
        ));

        const duration = AnalyticsDataService.calculateSessionDuration(item.subject, item.period.toString());
        
        sessions.push({
          id: `session_${week}_${item.id}_${Math.random().toString(36).substr(2, 9)}`,
          subjectId: subject.id,
          subjectName: item.subject,
          date: sessionDate,
          duration,
          type: 'lecture',
          location: item.room ? AnalyticsDataService.getRoomType(item.room) : 'classroom',
          efficiency: Math.round(efficiency * 10) / 10,
          notes: `${item.subject}の講義 (${item.period}限)`
        });

        // Add study sessions (additional study time)
        if (Math.random() > 0.3) { // 70% chance of additional study
          const studyDate = new Date(sessionDate);
          studyDate.setDate(studyDate.getDate() + Math.floor(Math.random() * 3) + 1);
          
          sessions.push({
            id: `study_${week}_${item.id}_${Math.random().toString(36).substr(2, 9)}`,
            subjectId: subject.id,
            subjectName: item.subject,
            date: studyDate,
            duration: 60 + Math.floor(Math.random() * 120), // 1-3 hours
            type: 'study',
            location: ['library', 'home', 'classroom'][Math.floor(Math.random() * 3)] as 'library' | 'home' | 'classroom',
            efficiency: Math.max(1, Math.min(5, baseEfficiency + (Math.random() - 0.5) * 1.5)),
            notes: `${item.subject}の復習・予習`
          });
        }
      });
    }

    return sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Estimate study hours based on credits and category
   */
  private static estimateStudyHours(credits: number, category: string): number {
    const baseHours = credits * 15; // Standard: 15 hours per credit
    const categoryMultiplier = {
      '必修': 1.2,
      '選択必修': 1.1,
      '選択': 1.0,
      '自由': 0.8
    };
    return Math.round(baseHours * (categoryMultiplier[category as keyof typeof categoryMultiplier] || 1.0));
  }

  /**
   * Calculate subject difficulty based on category and GPA
   */
  private static calculateDifficulty(category: string, gpa: number): number {
    let baseDifficulty = 3;
    
    // Adjust by category
    if (category === '必修') baseDifficulty += 0.5;
    if (category === '選択必修') baseDifficulty += 0.3;
    
    // Adjust by performance (inverse relationship)
    if (gpa >= 4.0) baseDifficulty -= 1;
    else if (gpa >= 3.5) baseDifficulty -= 0.5;
    else if (gpa < 2.5) baseDifficulty += 1;
    
    return Math.max(1, Math.min(5, Math.round(baseDifficulty * 10) / 10));
  }

  /**
   * Calculate satisfaction based on GPA and credits
   */
  private static calculateSatisfaction(gpa: number, credits: number): number {
    let satisfaction = 3;
    
    // Higher GPA = higher satisfaction
    if (gpa >= 4.0) satisfaction = 5;
    else if (gpa >= 3.5) satisfaction = 4;
    else if (gpa >= 3.0) satisfaction = 3;
    else if (gpa >= 2.5) satisfaction = 2;
    else satisfaction = 1;
    
    // More credits might reduce satisfaction due to workload
    if (credits >= 3) satisfaction -= 0.3;
    
    return Math.max(1, Math.min(5, Math.round(satisfaction * 10) / 10));
  }

  /**
   * Get base efficiency for different subjects
   */
  private static getBaseEfficiency(subjectName: string): number {
    const subjectEfficiency: { [key: string]: number } = {
      'データベース論': 4.2,
      'ソフトウェア工学': 3.8,
      '統計学': 3.5,
      '英語コミュニケーション': 4.0,
      '物理学基礎': 3.2,
      '日本史概論': 3.8
    };
    
    return subjectEfficiency[subjectName] || 3.5;
  }

  /**
   * Calculate session duration based on subject and period
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static calculateSessionDuration(subjectName: string, _period: string): number {
    // Standard lecture is 90 minutes
    let baseDuration = 90;
    
    // Some subjects might have longer sessions
    if (subjectName.includes('演習') || subjectName.includes('実習')) {
      baseDuration = 180; // 3 hours for practical sessions
    }
    
    return baseDuration;
  }

  /**
   * Determine room type based on room name/code
   */
  private static getRoomType(room: string): 'classroom' | 'library' | 'online' {
    if (room.includes('図書館') || room.includes('lib')) return 'library';
    if (room.includes('オンライン') || room.includes('zoom')) return 'online';
    return 'classroom';
  }

  /**
   * Merge analytics data with existing data sources
   */
  static integrateWithExistingData(
    grades: Grade[],
    timetable: TimetableItem[],
    subjects: Subject[]
  ) {
    return {
      subjectPerformances: this.transformGradesToSubjectPerformance(grades),
      academicProgress: this.transformGradesToAcademicProgress(grades),
      studySessions: this.generateStudySessionsFromTimetable(timetable, subjects, 8) // 8 weeks of data
    };
  }
}