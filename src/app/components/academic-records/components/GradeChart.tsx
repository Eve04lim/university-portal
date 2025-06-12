'use client';

import React from 'react';
import { ResponsiveCard } from '../../ui';
import { CourseGrade } from '../../../../lib/types';

interface GradeChartProps {
  grades: CourseGrade[];
}

const GradeChart: React.FC<GradeChartProps> = ({ grades }) => {
  const gradeDistribution = () => {
    const distribution = {
      'A': 0, 'A-': 0,
      'B+': 0, 'B': 0, 'B-': 0,
      'C+': 0, 'C': 0, 'C-': 0,
      'D+': 0, 'D': 0,
      'F': 0
    };

    grades.forEach(grade => {
      if (grade.grade in distribution) {
        distribution[grade.grade as keyof typeof distribution]++;
      }
    });

    return distribution;
  };

  const getGradeColor = (grade: string) => {
    const colorMap: { [key: string]: string } = {
      'A': '#10B981', 'A-': '#34D399',
      'B+': '#3B82F6', 'B': '#60A5FA', 'B-': '#93C5FD',
      'C+': '#F59E0B', 'C': '#FBBF24', 'C-': '#FCD34D',
      'D+': '#F97316', 'D': '#FB923C',
      'F': '#EF4444'
    };
    return colorMap[grade] || '#6B7280';
  };

  const distribution = gradeDistribution();
  const totalGrades = grades.length;
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <ResponsiveCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">成績分布</h3>
      
      {totalGrades === 0 ? (
        <div className="text-center py-8 text-gray-500">
          表示する成績データがありません
        </div>
      ) : (
        <div className="space-y-4">
          {/* チャート */}
          <div className="space-y-2">
            {Object.entries(distribution).map(([grade, count]) => {
              const percentage = totalGrades > 0 ? (count / totalGrades) * 100 : 0;
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={grade} className="flex items-center gap-3">
                  <div className="w-8 text-sm font-medium text-gray-700 text-right">
                    {grade}
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div 
                        className="h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ 
                          width: `${barWidth}%`, 
                          backgroundColor: getGradeColor(grade) 
                        }}
                      >
                        {count > 0 && (
                          <span className="text-white text-xs font-medium">
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* 統計サマリー */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {distribution['A'] + distribution['A-']}
                </div>
                <div className="text-xs text-gray-600">A評価</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {distribution['B+'] + distribution['B'] + distribution['B-']}
                </div>
                <div className="text-xs text-gray-600">B評価</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {distribution['C+'] + distribution['C'] + distribution['C-']}
                </div>
                <div className="text-xs text-gray-600">C評価</div>
              </div>
            </div>
          </div>

          {/* 成績評価の説明 */}
          <div className="mt-4 text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-2">
              <div>A: 90-100点 (優)</div>
              <div>B: 80-89点 (良)</div>
              <div>C: 70-79点 (可)</div>
              <div>D: 60-69点 (不可)</div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveCard>
  );
};

export default GradeChart;