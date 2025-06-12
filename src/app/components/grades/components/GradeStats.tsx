'use client';

import { Award, BookOpen, TrendingUp } from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid } from '../../ui';
import { GradeStatistics } from '../types';

interface GradeStatsProps {
  statistics: GradeStatistics;
}

const GradeStats = ({ statistics }: GradeStatsProps) => {
  const {
    overallGPA,
    totalCredits,
    completedSubjects,
    averageScore
  } = statistics;

  const statsItems = [
    {
      label: '総GPA',
      value: overallGPA.toFixed(2),
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: '取得単位数',
      value: `${totalCredits}単位`,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: '履修完了科目',
      value: `${completedSubjects}科目`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: '平均点',
      value: `${averageScore.toFixed(1)}点`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={4}>
      {statsItems.map((item, index) => (
        <ResponsiveCard key={index} className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                {item.label}
              </h3>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {item.value}
              </div>
            </div>
          </div>
        </ResponsiveCard>
      ))}
    </ResponsiveGrid>
  );
};

export default GradeStats;