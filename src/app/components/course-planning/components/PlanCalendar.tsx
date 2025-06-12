'use client';

import React from 'react';
import { Calendar, BookOpen } from 'lucide-react';
import { ResponsiveCard } from '../../ui';
import { CoursePlan } from '../../../../lib/types';

interface PlanCalendarProps {
  plans: CoursePlan[];
}

const PlanCalendar: React.FC<PlanCalendarProps> = ({ plans }) => {
  // 簡単なカレンダービュー（実際のアプリではより高度なカレンダーライブラリを使用）
  return (
    <ResponsiveCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">履修計画カレンダー</h3>
      </div>
      
      {plans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>表示する履修計画がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{plan.name}</h4>
                <span className="text-sm text-gray-500">{plan.academicYear}年度</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {plan.courses.map((course, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="font-medium">{course.courseName}</div>
                    <div className="text-gray-500">{course.credits}単位</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ResponsiveCard>
  );
};

export default PlanCalendar;