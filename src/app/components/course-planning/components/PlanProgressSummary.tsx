'use client';

import React from 'react';
import { Target, Award, BookOpen, TrendingUp } from 'lucide-react';
import { ResponsiveCard } from '../../ui';
import { AcademicRecord, CourseRegistration, CoursePlan } from '../../../../lib/types';

interface PlanProgressSummaryProps {
  academicRecord: AcademicRecord;
  registrations: CourseRegistration[];
  plans: CoursePlan[];
}

const PlanProgressSummary: React.FC<PlanProgressSummaryProps> = ({
  academicRecord,
  registrations,
  plans
}) => {
  const calculateProgress = () => {
    if (!academicRecord.graduationRequirements) return 0;
    
    const required = academicRecord.graduationRequirements.totalCreditsRequired;
    const earned = academicRecord.totalCreditsEarned;
    return Math.min((earned / required) * 100, 100);
  };

  const getPlannedCredits = () => {
    return plans
      .filter(plan => plan.status === 'active')
      .reduce((total, plan) => total + plan.totalCredits, 0);
  };

  const getInProgressCredits = () => {
    return registrations
      .filter(reg => reg.status === 'registered')
      .reduce((total, reg) => total + reg.credits, 0);
  };

  const progress = calculateProgress();
  const plannedCredits = getPlannedCredits();
  const inProgressCredits = getInProgressCredits();

  return (
    <ResponsiveCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-blue-500" />
        <h3 className="font-semibold text-gray-900">進捗サマリー</h3>
      </div>
      
      <div className="space-y-4">
        {/* 卒業進捗 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">卒業進捗</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 統計 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award size={14} />
              <span>取得済み</span>
            </div>
            <span className="font-medium text-green-600">
              {academicRecord.totalCreditsEarned}単位
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen size={14} />
              <span>履修中</span>
            </div>
            <span className="font-medium text-blue-600">
              {inProgressCredits}単位
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target size={14} />
              <span>計画中</span>
            </div>
            <span className="font-medium text-purple-600">
              {plannedCredits}単位
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={14} />
              <span>累積GPA</span>
            </div>
            <span className="font-medium text-orange-600">
              {academicRecord.overallGPA.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 要件チェック */}
        {academicRecord.graduationRequirements && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">卒業要件</h4>
            <div className="space-y-1">
              {academicRecord.graduationRequirements.categoryRequirements.map((req, index) => {
                const earned = academicRecord.courseGrades
                  .filter(g => g.category === req.category)
                  .reduce((sum, g) => sum + g.credits, 0);
                const isCompleted = earned >= req.creditsRequired;
                
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className={isCompleted ? 'text-green-600' : 'text-gray-600'}>
                      {req.category}
                    </span>
                    <span className={isCompleted ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      {earned}/{req.creditsRequired}
                      {isCompleted && ' ✓'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ResponsiveCard>
  );
};

export default PlanProgressSummary;