'use client';

import React from 'react';
import { 
  Calendar,
  BookOpen,
  Eye,
  Edit,
  Copy,
  Trash2,
  Download,
  MoreVertical,
  Target
} from 'lucide-react';
import { ResponsiveCard, Button } from '../../ui';
import { CoursePlan } from '../../../../lib/types';

interface PlanCardProps {
  plan: CoursePlan;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100';
      case 'completed':
        return 'text-blue-700 bg-blue-100';
      case 'draft':
        return 'text-yellow-700 bg-yellow-100';
      case 'archived':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'completed':
        return '完了';
      case 'draft':
        return '下書き';
      case 'archived':
        return 'アーカイブ';
      default:
        return status;
    }
  };

  const getSemesterLabel = (semester: string) => {
    switch (semester) {
      case 'spring':
        return '前期';
      case 'fall':
        return '後期';
      case 'intensive':
        return '集中講義';
      case 'year-long':
        return '通年';
      default:
        return semester;
    }
  };

  const getRequiredCoursesCount = () => {
    return plan.courses.filter(course => course.isRequired).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ResponsiveCard className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {plan.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {plan.description}
            </p>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
            {getStatusLabel(plan.status)}
          </span>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>{plan.academicYear}年度</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen size={14} />
            <span>{getSemesterLabel(plan.semester)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target size={14} />
            <span>{plan.totalCredits}単位</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-red-600">必修:</span>
            <span>{getRequiredCoursesCount()}科目</span>
          </div>
        </div>

        {/* 科目一覧（最初の3つのみ表示） */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-gray-700">科目一覧</h4>
          <div className="space-y-1">
            {plan.courses.slice(0, 3).map((course, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className={`truncate ${course.isRequired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {course.courseName} ({course.courseCode})
                </span>
                <span className="text-gray-500 ml-2">{course.credits}単位</span>
              </div>
            ))}
            {plan.courses.length > 3 && (
              <div className="text-xs text-gray-500">
                他 {plan.courses.length - 3} 科目...
              </div>
            )}
          </div>
        </div>

        {/* 更新日時 */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
          更新日: {formatDate(plan.updatedAt)}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={onView}
            className="flex items-center gap-1 flex-1"
          >
            <Eye size={12} />
            詳細
          </Button>
          
          {plan.status !== 'archived' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <Edit size={12} />
              編集
            </Button>
          )}
          
          <div className="relative group">
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-1"
            >
              <MoreVertical size={12} />
            </Button>
            
            {/* ドロップダウンメニュー（実際のアプリではポップオーバーライブラリを使用） */}
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1 min-w-[120px]">
                <button
                  onClick={onDuplicate}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Copy size={12} />
                  複製
                </button>
                <button
                  onClick={onExport}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Download size={12} />
                  エクスポート
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 size={12} />
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default PlanCard;