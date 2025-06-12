'use client';

import { ResponsiveCard, ResponsiveGrid } from '../../ui';
import { Grade, SemesterGPA } from '../types';
import { getGradeColor } from '../utils';

interface GradeChartProps {
  gradeDistribution: Record<string, number>;
  semesterGPAData: SemesterGPA[];
  completedGrades: Grade[];
}

const GradeChart = ({ gradeDistribution, semesterGPAData, completedGrades }: GradeChartProps) => {
  const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
  const maxCount = Math.max(...Object.values(gradeDistribution), 1);

  return (
    <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
      {/* 成績分布グラフ */}
      <ResponsiveCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">成績分布</h3>
        <div className="space-y-3">
          {grades.map(grade => {
            const count = gradeDistribution[grade] || 0;
            const percentage = completedGrades.length > 0 ? (count / completedGrades.length) * 100 : 0;
            const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={grade} className="flex items-center space-x-3">
                <div className={`w-12 text-center py-1 text-xs font-medium rounded ${getGradeColor(grade)}`}>
                  {grade}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="bg-blue-500 h-6 rounded-full transition-all duration-300"
                    style={{ width: `${width}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {count}科目 ({percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ResponsiveCard>

      {/* GPA推移グラフ */}
      <ResponsiveCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">GPA推移</h3>
        <div className="space-y-4">
          {semesterGPAData.map((semester, index) => {
            const maxGPA = 4.0;
            const width = (semester.gpa / maxGPA) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {semester.year}年 {semester.semester}
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {semester.gpa.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12">
                    {semester.credits}単位
                  </span>
                </div>
              </div>
            );
          })}
          
          {semesterGPAData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>GPA推移データがありません</p>
            </div>
          )}
        </div>
      </ResponsiveCard>
    </ResponsiveGrid>
  );
};

export default GradeChart;