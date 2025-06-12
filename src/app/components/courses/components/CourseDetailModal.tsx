'use client';

import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Users, 
  Clock, 
  MapPin, 
  BookOpen, 
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  UserPlus,
  User,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResponsiveModal, Button, ResponsiveCard } from '../../ui';
import { Course } from '../../../../lib/types';
import { useAppStore } from '../../../../store/useAppStore';

interface CourseDetailModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  const { addRegistration } = useAppStore();
  const [showPrerequisites, setShowPrerequisites] = useState(false);
  const [registering, setRegistering] = useState(false);

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
      `${dayNames[s.dayOfWeek]}曜日 ${s.period}限 (${s.startTime}-${s.endTime})`
    ).join(', ');
  };

  const formatInstructors = (instructors: typeof course.instructors) => {
    return instructors.map(i => i.name).join(', ');
  };

  const getSemesterLabel = (semester: string) => {
    switch (semester) {
      case 'spring': return '前期';
      case 'fall': return '後期';
      case 'intensive': return '集中講義';
      case 'year-long': return '通年';
      default: return semester;
    }
  };

  const handleRegister = async () => {
    if (isFull) return;
    
    setRegistering(true);
    try {
      // ここで実際の履修登録処理を行う
      const registration = {
        id: `reg-${Date.now()}`,
        studentId: 'student-1', // 実際のアプリでは現在のユーザーIDを使用
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        credits: course.credits,
        semester: course.semester,
        academicYear: '2024',
        registrationDate: new Date().toISOString(),
        status: 'registered' as const,
        grade: null,
        gpa: null,
      };
      
      addRegistration(registration);
      
      // 成功メッセージを表示（実際のアプリではトーストやスナックバーを使用）
      alert('履修登録が完了しました');
      onClose();
    } catch (error) {
      console.error('履修登録エラー:', error);
      alert('履修登録に失敗しました');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={course.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* ヘッダー情報 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {course.code}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(course.category)}`}>
                {course.category}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(course.difficulty)}`}>
                {getDifficultyLabel(course.difficulty)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar size={14} />
                <span>{getSemesterLabel(course.semester)}</span>
              </div>
            </div>
          </div>
          
          {isFull ? (
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
          ) : (
            <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
          )}
        </div>

        {/* 定員状況 */}
        <ResponsiveCard className="p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">定員状況</span>
            <span>{course.currentStudents}/{course.maxStudents} ({availabilityPercentage.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                availabilityPercentage >= 90 ? 'bg-red-500' :
                availabilityPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            残り{course.maxStudents - course.currentStudents}席
          </div>
        </ResponsiveCard>

        {/* 基本情報 */}
        <ResponsiveCard className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">担当教員:</span>
              <div className="mt-1">
                {course.instructors.map((instructor, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    <span>{instructor.name}</span>
                    {instructor.email && (
                      <a 
                        href={`mailto:${instructor.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">学部・学科:</span>
              <p className="text-sm text-gray-600 mt-1">{course.department}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">時間割:</span>
              <p className="text-sm text-gray-600 mt-1">{formatSchedule(course.schedule)}</p>
            </div>
            
            {course.schedule.length > 0 && course.schedule[0].room && (
              <div>
                <span className="text-sm font-medium text-gray-700">教室:</span>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin size={14} />
                  <span>{course.schedule[0].room}</span>
                </div>
              </div>
            )}
          </div>
        </ResponsiveCard>

        {/* 科目説明 */}
        <ResponsiveCard className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">科目概要</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {course.description}
          </p>
        </ResponsiveCard>

        {/* 履修条件・前提科目 */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <ResponsiveCard className="p-4">
            <button
              onClick={() => setShowPrerequisites(!showPrerequisites)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold text-gray-900">前提科目・履修条件</h3>
              {showPrerequisites ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>
            
            {showPrerequisites && (
              <div className="mt-3 space-y-2">
                {course.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={14} />
                    <span>{prereq}</span>
                  </div>
                ))}
              </div>
            )}
          </ResponsiveCard>
        )}

        {/* 評価情報 */}
        <ResponsiveCard className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">評価情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">総合評価:</span>
              <div className="flex items-center gap-1 mt-1">
                <Star className="text-yellow-500" size={16} />
                <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">/ 5.0</span>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">難易度:</span>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(course.difficulty)}`}>
                  {getDifficultyLabel(course.difficulty)} ({course.difficulty}/5)
                </span>
              </div>
            </div>
          </div>
        </ResponsiveCard>

        {/* アクション */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {isFull ? (
            <Button 
              fullWidth 
              disabled 
              className="flex items-center justify-center gap-2"
            >
              <AlertCircle size={16} />
              定員満了のため履修登録できません
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                onClick={handleRegister}
                disabled={registering}
                className="flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                {registering ? '登録中...' : '履修登録する'}
              </Button>
              <Button
                variant="secondary"
                onClick={onClose}
                className="sm:w-auto"
              >
                閉じる
              </Button>
            </>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default CourseDetailModal;