'use client';

import React from 'react';
import { 
  Star, 
  Users, 
  Clock, 
  MapPin, 
  BookOpen, 
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { ResponsiveCard, Button } from '../../ui';
import { Course } from '../../../../lib/types';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  layout?: 'grid' | 'list';
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onClick, 
  layout = 'grid' 
}) => {
  const isFull = course.currentStudents >= course.maxStudents;
  const availabilityPercentage = (course.currentStudents / course.maxStudents) * 100;
  
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return '易しい';
    if (difficulty <= 3) return '普通';
    if (difficulty <= 4) return '難しい';
    return '非常に難しい';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-100';
    if (difficulty <= 3) return 'text-yellow-600 bg-yellow-100';
    if (difficulty <= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '必修': return 'text-red-700 bg-red-100';
      case '選択必修': return 'text-orange-700 bg-orange-100';
      case '選択': return 'text-blue-700 bg-blue-100';
      case '自由': return 'text-gray-700 bg-gray-100';
      case '教職': return 'text-purple-700 bg-purple-100';
      case '資格': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatSchedule = (schedule: typeof course.schedule) => {
    if (schedule.length === 0) return '未定';
    
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return schedule.map(s => 
      `${dayNames[s.dayOfWeek]}${s.period}限 (${s.startTime}-${s.endTime})`
    ).join(', ');
  };

  const formatInstructors = (instructors: typeof course.instructors) => {
    return instructors.map(i => i.name).join(', ');
  };

  if (layout === 'list') {
    return (
      <ResponsiveCard 
        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {/* 基本情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {course.name}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {course.code}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(course.category)}`}>
                    {course.category}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{course.credits}単位</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{course.currentStudents}/{course.maxStudents}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(course.difficulty)}`}>
                      {getDifficultyLabel(course.difficulty)}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{formatInstructors(course.instructors)}</span>
                  <span className="mx-2">•</span>
                  <span>{course.department}</span>
                </div>

                <div className="text-sm text-gray-600">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  {formatSchedule(course.schedule)}
                </div>
              </div>

              {/* アクション */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {isFull ? (
                  <Button size="sm" disabled className="flex items-center gap-1">
                    <AlertCircle size={14} />
                    定員満了
                  </Button>
                ) : (
                  <Button size="sm" className="flex items-center gap-1">
                    <UserPlus size={14} />
                    履修登録
                  </Button>
                )}
                
                <div className="text-xs text-center text-gray-500">
                  残り{course.maxStudents - course.currentStudents}席
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveCard>
    );
  }

  return (
    <ResponsiveCard 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {course.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {course.code}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(course.category)}`}>
                {course.category}
              </span>
            </div>
          </div>
          
          {isFull ? (
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          ) : (
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
          )}
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <BookOpen size={14} />
            <span>{course.credits}単位</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Star size={14} className="text-yellow-500" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users size={14} />
            <span>{course.currentStudents}/{course.maxStudents}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(course.difficulty)}`}>
              {getDifficultyLabel(course.difficulty)}
            </span>
          </div>
        </div>

        {/* 教員・学部 */}
        <div className="text-sm text-gray-600">
          <div className="font-medium truncate">{formatInstructors(course.instructors)}</div>
          <div className="text-xs text-gray-500">{course.department}</div>
        </div>

        {/* スケジュール */}
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <Calendar size={14} />
            <span className="font-medium">時間割</span>
          </div>
          <div className="text-xs">{formatSchedule(course.schedule)}</div>
        </div>

        {/* 定員状況 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>定員状況</span>
            <span>{course.currentStudents}/{course.maxStudents} ({availabilityPercentage.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                availabilityPercentage >= 90 ? 'bg-red-500' :
                availabilityPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* アクション */}
        <div className="pt-2 border-t border-gray-100">
          {isFull ? (
            <Button 
              fullWidth 
              size="sm" 
              disabled 
              className="flex items-center justify-center gap-1"
            >
              <AlertCircle size={14} />
              定員満了
            </Button>
          ) : (
            <Button 
              fullWidth 
              size="sm" 
              className="flex items-center justify-center gap-1"
            >
              <UserPlus size={14} />
              履修登録
            </Button>
          )}
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default CourseCard;