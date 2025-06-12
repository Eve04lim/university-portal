import { Grade, GradeStatistics } from './types';

// 成績の色を取得
export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A+': return 'text-green-800 bg-green-100';
    case 'A': return 'text-green-700 bg-green-50';
    case 'B+': return 'text-blue-800 bg-blue-100';
    case 'B': return 'text-blue-700 bg-blue-50';
    case 'C+': return 'text-yellow-800 bg-yellow-100';
    case 'C': return 'text-yellow-700 bg-yellow-50';
    case 'D': return 'text-orange-800 bg-orange-100';
    case 'F': return 'text-red-800 bg-red-100';
    case '履修中': return 'text-gray-800 bg-gray-100';
    default: return 'text-gray-600 bg-gray-50';
  }
};

// カテゴリの色を取得
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case '必修': return 'text-red-600 bg-red-50';
    case '選択必修': return 'text-orange-600 bg-orange-50';
    case '選択': return 'text-blue-600 bg-blue-50';
    case '自由': return 'text-gray-600 bg-gray-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

// GPAを計算
export const calculateGPA = (grades: Grade[]): number => {
  const completedGrades = grades.filter(g => g.grade !== '履修中' && g.gpa > 0);
  if (completedGrades.length === 0) return 0;
  
  const totalPoints = completedGrades.reduce((sum, grade) => sum + (grade.gpa * grade.credits), 0);
  const totalCredits = completedGrades.reduce((sum, grade) => sum + grade.credits, 0);
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

// 成績分布を計算
export const calculateGradeDistribution = (grades: Grade[]): Record<string, number> => {
  const distribution: Record<string, number> = {};
  const completedGrades = grades.filter(g => g.grade !== '履修中');
  
  completedGrades.forEach(grade => {
    distribution[grade.grade] = (distribution[grade.grade] || 0) + 1;
  });
  
  return distribution;
};

// 平均点を計算
export const calculateAverageScore = (grades: Grade[]): number => {
  const completedGrades = grades.filter(g => g.grade !== '履修中' && g.finalScore > 0);
  if (completedGrades.length === 0) return 0;
  
  const totalScore = completedGrades.reduce((sum, grade) => sum + grade.finalScore, 0);
  return totalScore / completedGrades.length;
};

// 統計情報を計算
export const calculateStatistics = (grades: Grade[]): GradeStatistics => {
  const completedGrades = grades.filter(g => g.grade !== '履修中');
  
  return {
    overallGPA: calculateGPA(grades),
    totalCredits: completedGrades.reduce((sum, grade) => sum + grade.credits, 0),
    completedSubjects: completedGrades.length,
    averageScore: calculateAverageScore(grades),
    gradeDistribution: calculateGradeDistribution(grades)
  };
};

// 成績をフィルタリング
export const filterGrades = (
  grades: Grade[],
  filters: {
    year: string;
    semester: string;
    category: string;
  }
): Grade[] => {
  return grades.filter(grade => {
    const yearMatch = filters.year === 'all' || grade.year.toString() === filters.year;
    const semesterMatch = filters.semester === 'all' || grade.semester === filters.semester;
    const categoryMatch = filters.category === 'all' || grade.category === filters.category;
    
    return yearMatch && semesterMatch && categoryMatch;
  });
};