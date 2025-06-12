'use client';

import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  BookOpen
} from 'lucide-react';
import { ResponsiveCard, ResponsiveTable, Button } from '../../ui';
import { CourseGrade, AcademicRecord } from '../../../../lib/types';

interface TranscriptTableProps {
  grades: CourseGrade[];
  academicRecord: AcademicRecord | null;
}

const TranscriptTable: React.FC<TranscriptTableProps> = ({ grades, academicRecord }) => {
  const [groupBy, setGroupBy] = useState<'semester' | 'category' | 'none'>('semester');
  const [sortBy, setSortBy] = useState<'date' | 'grade' | 'credits' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getGradeColor = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      'A+': 'text-green-700 bg-green-100',
      'A': 'text-green-700 bg-green-100',
      'A-': 'text-green-600 bg-green-50',
      'B+': 'text-blue-700 bg-blue-100',
      'B': 'text-blue-700 bg-blue-100',
      'B-': 'text-blue-600 bg-blue-50',
      'C+': 'text-yellow-700 bg-yellow-100',
      'C': 'text-yellow-700 bg-yellow-100',
      'C-': 'text-yellow-600 bg-yellow-50',
      'D+': 'text-orange-700 bg-orange-100',
      'D': 'text-orange-700 bg-orange-100',
      'F': 'text-red-700 bg-red-100'
    };
    return gradeColors[grade] || 'text-gray-700 bg-gray-100';
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      '必修': 'text-red-700 bg-red-100',
      '選択必修': 'text-orange-700 bg-orange-100',
      '選択': 'text-blue-700 bg-blue-100',
      '自由': 'text-gray-700 bg-gray-100',
      '教職': 'text-purple-700 bg-purple-100',
      '資格': 'text-green-700 bg-green-100'
    };
    return categoryColors[category] || 'text-gray-700 bg-gray-100';
  };

  const getSemesterLabel = (semester: string) => {
    const semesterLabels: { [key: string]: string } = {
      'spring': '前期',
      'fall': '後期',
      'intensive': '集中講義',
      'year-long': '通年'
    };
    return semesterLabels[semester] || semester;
  };

  const sortedGrades = [...grades].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.academicYear === b.academicYear ? 
          a.semester.localeCompare(b.semester) :
          a.academicYear - b.academicYear;
        break;
      case 'grade':
        comparison = b.gradePoints - a.gradePoints;
        break;
      case 'credits':
        comparison = b.credits - a.credits;
        break;
      case 'name':
        comparison = a.courseName.localeCompare(b.courseName);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const groupedGrades = () => {
    if (groupBy === 'none') return { 'すべて': sortedGrades };
    
    const groups: { [key: string]: CourseGrade[] } = {};
    
    sortedGrades.forEach(grade => {
      let key = '';
      
      switch (groupBy) {
        case 'semester':
          key = `${grade.academicYear}年度 ${getSemesterLabel(grade.semester)}`;
          break;
        case 'category':
          key = grade.category || 'その他';
          break;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(grade);
    });
    
    return groups;
  };

  const calculateGroupStats = (groupGrades: CourseGrade[]) => {
    const totalCredits = groupGrades.reduce((sum, g) => sum + g.credits, 0);
    const totalGradePoints = groupGrades.reduce((sum, g) => sum + (g.gradePoints * g.credits), 0);
    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    return { totalCredits, gpa };
  };

  const groupedData = groupedGrades();

  return (
    <div className="space-y-6">
      {/* コントロール */}
      <ResponsiveCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              グループ化
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semester">学期別</option>
              <option value="category">カテゴリ別</option>
              <option value="none">グループ化しない</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              並び替え
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">日付 (新しい順)</option>
              <option value="date-asc">日付 (古い順)</option>
              <option value="grade-desc">成績 (高い順)</option>
              <option value="grade-asc">成績 (低い順)</option>
              <option value="credits-desc">単位数 (多い順)</option>
              <option value="credits-asc">単位数 (少ない順)</option>
              <option value="name-asc">科目名 (昇順)</option>
              <option value="name-desc">科目名 (降順)</option>
            </select>
          </div>
        </div>
      </ResponsiveCard>

      {/* 成績表 */}
      {Object.entries(groupedData).map(([groupName, groupGrades]) => {
        const stats = calculateGroupStats(groupGrades);
        
        return (
          <ResponsiveCard key={groupName} className="overflow-hidden">
            {/* グループヘッダー */}
            {groupBy !== 'none' && (
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{stats.totalCredits}単位</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award size={14} />
                      <span>GPA: {stats.gpa.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* テーブル */}
            <ResponsiveTable
              columns={[
                {
                  key: 'courseName',
                  label: '科目名',
                  render: (value: unknown, row: Record<string, unknown>) => {
                    const grade = row as unknown as CourseGrade;
                    return (
                      <div>
                        <div className="font-medium text-gray-900">{grade.courseName}</div>
                        <div className="text-sm text-gray-500">{grade.courseCode}</div>
                      </div>
                    );
                  }
                },
                {
                  key: 'semester',
                  label: '学期',
                  render: (value: unknown, row: Record<string, unknown>) => {
                    const grade = row as unknown as CourseGrade;
                    return (
                      <div className="text-sm">
                        <div>{grade.academicYear}年度</div>
                        <div className="text-gray-500">{getSemesterLabel(grade.semester)}</div>
                      </div>
                    );
                  }
                },
                {
                  key: 'category',
                  label: 'カテゴリ',
                  render: (value: unknown, row: Record<string, unknown>) => {
                    const grade = row as unknown as CourseGrade;
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(grade.category || '')}`}>
                        {grade.category || '-'}
                      </span>
                    );
                  }
                },
                {
                  key: 'credits',
                  label: '単位',
                  render: (value: unknown, row: Record<string, unknown>) => {
                    const grade = row as unknown as CourseGrade;
                    return (
                      <span className="font-medium">{grade.credits}</span>
                    );
                  }
                },
                {
                  key: 'grade',
                  label: '成績',
                  render: (value: unknown, row: Record<string, unknown>) => {
                    const grade = row as unknown as CourseGrade;
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    );
                  }
                },
                {
                  key: 'gradePoints',
                  label: 'GP',
                  render: (value: unknown, row: Record<string, unknown>) => {
                    const grade = row as unknown as CourseGrade;
                    return (
                      <span className="font-medium">{grade.gradePoints.toFixed(1)}</span>
                    );
                  }
                }
              ]}
              data={groupGrades as unknown as Record<string, unknown>[]}
            />
            
            {/* グループ合計 */}
            {groupBy !== 'none' && groupGrades.length > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">
                    小計 ({groupGrades.length}科目)
                  </span>
                  <div className="flex items-center gap-4">
                    <span>単位数: {stats.totalCredits}</span>
                    <span>GPA: {stats.gpa.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </ResponsiveCard>
        );
      })}

      {/* 全体統計 */}
      {academicRecord && (
        <ResponsiveCard className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">全体統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {academicRecord.totalCreditsEarned}
              </div>
              <div className="text-sm text-blue-600">総取得単位数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {academicRecord.overallGPA.toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">累積GPA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {grades.length}
              </div>
              <div className="text-sm text-blue-600">履修科目数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {grades.filter(g => g.gradePoints >= 4.0).length}
              </div>
              <div className="text-sm text-blue-600">A評価科目数</div>
            </div>
          </div>
        </ResponsiveCard>
      )}

      {grades.length === 0 && (
        <ResponsiveCard className="p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">成績データがありません</h3>
          <p className="text-gray-600">
            フィルター条件を変更するか、履修登録を確認してください
          </p>
        </ResponsiveCard>
      )}
    </div>
  );
};

export default TranscriptTable;