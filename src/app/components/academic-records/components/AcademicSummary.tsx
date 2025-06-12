'use client';

import React from 'react';
import { 
  Award,
  BookOpen,
  TrendingUp,
  Calendar,
  Star,
  Target
} from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid } from '../../ui';
import { AcademicRecord } from '../../../../lib/types';

interface AcademicSummaryProps {
  academicRecord: AcademicRecord;
}

const AcademicSummary: React.FC<AcademicSummaryProps> = ({ academicRecord }) => {
  const calculateGPAStatus = (gpa: number) => {
    if (gpa >= 3.7) return { label: '優秀', color: 'text-green-600 bg-green-100' };
    if (gpa >= 3.0) return { label: '良好', color: 'text-blue-600 bg-blue-100' };
    if (gpa >= 2.0) return { label: '普通', color: 'text-yellow-600 bg-yellow-100' };
    return { label: '要改善', color: 'text-red-600 bg-red-100' };
  };

  const calculateProgressPercentage = () => {
    if (!academicRecord.graduationRequirements) return 0;
    const required = academicRecord.graduationRequirements.totalCreditsRequired;
    const earned = academicRecord.totalCreditsEarned;
    return Math.min((earned / required) * 100, 100);
  };

  const getHighestGrade = () => {
    const gradePoints = academicRecord.courseGrades.map(g => g.gradePoints);
    return Math.max(...gradePoints);
  };

  const getRecentSemesterGPA = () => {
    if (academicRecord.semesterGPAs.length === 0) return 0;
    return academicRecord.semesterGPAs[academicRecord.semesterGPAs.length - 1].gpa;
  };

  const gpaStatus = calculateGPAStatus(academicRecord.overallGPA);
  const progressPercentage = calculateProgressPercentage();

  return (
    <ResponsiveGrid cols={{ default: 1, md: 2, lg: 4 }} gap={4}>
      {/* 累積GPA */}
      <ResponsiveCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">累積GPA</h3>
          <Award className="text-blue-500" size={20} />
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {academicRecord.overallGPA.toFixed(2)}
          </div>
          <div className={`inline-block px-2 py-1 rounded-full text-xs ${gpaStatus.color}`}>
            {gpaStatus.label}
          </div>
        </div>
      </ResponsiveCard>

      {/* 取得単位数 */}
      <ResponsiveCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">取得単位数</h3>
          <BookOpen className="text-green-500" size={20} />
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {academicRecord.totalCreditsEarned}
          </div>
          {academicRecord.graduationRequirements && (
            <div className="text-xs text-gray-500">
              / {academicRecord.graduationRequirements.totalCreditsRequired} 単位
            </div>
          )}
        </div>
      </ResponsiveCard>

      {/* 最新学期GPA */}
      <ResponsiveCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">最新学期GPA</h3>
          <TrendingUp className="text-purple-500" size={20} />
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {getRecentSemesterGPA().toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            現在学期の成績
          </div>
        </div>
      </ResponsiveCard>

      {/* 卒業進捗 */}
      <ResponsiveCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">卒業進捗</h3>
          <Target className="text-orange-500" size={20} />
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {progressPercentage.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </ResponsiveCard>

      {/* 詳細統計 */}
      <ResponsiveCard className="p-4 md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">学習統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {academicRecord.courseGrades.length}
            </div>
            <div className="text-sm text-gray-600">履修科目数</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {academicRecord.courseGrades.filter(g => g.gradePoints >= 4.0).length}
            </div>
            <div className="text-sm text-gray-600">A評価科目</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">
              {academicRecord.semesterGPAs.length}
            </div>
            <div className="text-sm text-gray-600">履修学期数</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {getHighestGrade().toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">最高評価点</div>
          </div>
        </div>
      </ResponsiveCard>

      {/* 学習傾向 */}
      {academicRecord.graduationRequirements && (
        <ResponsiveCard className="p-4 md:col-span-2 lg:col-span-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">卒業要件進捗</h3>
          <div className="space-y-4">
            {academicRecord.graduationRequirements.categoryRequirements.map((req, index) => {
              const earned = academicRecord.courseGrades
                .filter(g => g.category === req.category)
                .reduce((sum, g) => sum + g.credits, 0);
              const progress = Math.min((earned / req.creditsRequired) * 100, 100);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {req.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {earned} / {req.creditsRequired} 単位
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress >= 100 ? 'bg-green-500' : 
                        progress >= 75 ? 'bg-blue-500' :
                        progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ResponsiveCard>
      )}
    </ResponsiveGrid>
  );
};

export default AcademicSummary;