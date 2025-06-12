'use client';

import React from 'react';
import { Lightbulb, Star, BookOpen, Plus } from 'lucide-react';
import { ResponsiveCard, Button } from '../../ui';
import { AcademicRecord, CourseRegistration } from '../../../../lib/types';

interface RecommendedCoursesProps {
  academicRecord: AcademicRecord | null;
  registrations: CourseRegistration[];
}

const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({
  academicRecord,
  registrations
}) => {
  // 簡単な推薦ロジック（実際のアプリではより高度なアルゴリズムを使用）
  const getRecommendations = () => {
    if (!academicRecord) return [];
    
    // サンプル推薦科目
    return [
      {
        id: 'rec-1',
        name: 'データサイエンス入門',
        code: 'DS101',
        credits: 2,
        reason: 'あなたの数学・統計分野の成績が優秀です',
        rating: 4.5,
        difficulty: 3
      },
      {
        id: 'rec-2',
        name: 'ソフトウェア工学',
        code: 'SE201',
        credits: 3,
        reason: 'プログラミング系科目の履修実績があります',
        rating: 4.2,
        difficulty: 4
      },
      {
        id: 'rec-3',
        name: '機械学習基礎',
        code: 'ML101',
        credits: 2,
        reason: '現在のトレンドに合致した分野です',
        rating: 4.7,
        difficulty: 5
      }
    ];
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return '易しい';
    if (difficulty <= 3) return '普通';
    if (difficulty <= 4) return '難しい';
    return '非常に難しい';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600';
    if (difficulty <= 3) return 'text-yellow-600';
    if (difficulty <= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const recommendations = getRecommendations();

  return (
    <ResponsiveCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-yellow-500" />
        <h3 className="font-semibold text-gray-900">おすすめ科目</h3>
      </div>
      
      {!academicRecord ? (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">学術記録がないため推薦できません</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">現在おすすめ科目がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {course.name}
                  </h4>
                  <p className="text-xs text-gray-500">{course.code}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="text-yellow-500" size={12} />
                  <span className="text-xs text-gray-600">{course.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <BookOpen size={10} />
                  <span>{course.credits}単位</span>
                </div>
                <span className={getDifficultyColor(course.difficulty)}>
                  {getDifficultyLabel(course.difficulty)}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-3">
                {course.reason}
              </p>
              
              <Button
                size="sm"
                className="w-full flex items-center justify-center gap-1 text-xs"
              >
                <Plus size={10} />
                計画に追加
              </Button>
            </div>
          ))}
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              あなたの履修履歴と成績に基づく推薦です
            </p>
          </div>
        </div>
      )}
    </ResponsiveCard>
  );
};

export default RecommendedCourses;