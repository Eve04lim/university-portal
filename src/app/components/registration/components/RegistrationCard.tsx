'use client';

import React from 'react';
import { 
  Calendar,
  BookOpen,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Award,
  Edit,
  Eye,
  MoreVertical
} from 'lucide-react';
import { ResponsiveCard, Button } from '../../ui';
import { CourseRegistration } from '../../../../lib/types';

interface RegistrationCardProps {
  registration: CourseRegistration;
  onView: () => void;
  onEdit: () => void;
}

const RegistrationCard: React.FC<RegistrationCardProps> = ({
  registration,
  onView,
  onEdit,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <CheckCircle className="text-blue-500" size={16} />;
      case 'completed':
        return <Award className="text-green-500" size={16} />;
      case 'dropped':
        return <X className="text-orange-500" size={16} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'registered':
        return '履修中';
      case 'completed':
        return '修了';
      case 'dropped':
        return '履修取消';
      case 'failed':
        return '不合格';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'text-blue-700 bg-blue-100';
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'dropped':
        return 'text-orange-700 bg-orange-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case '必修':
        return 'text-red-700 bg-red-100';
      case '選択必修':
        return 'text-orange-700 bg-orange-100';
      case '選択':
        return 'text-blue-700 bg-blue-100';
      case '自由':
        return 'text-gray-700 bg-gray-100';
      case '教職':
        return 'text-purple-700 bg-purple-100';
      case '資格':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatGrade = (grade: string | null, gpa: number | null) => {
    if (!grade) return '-';
    return gpa ? `${grade} (${gpa.toFixed(1)})` : grade;
  };

  return (
    <ResponsiveCard className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {registration.courseName}
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {registration.courseCode}
            </span>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(registration.status)}`}>
              {getStatusLabel(registration.status)}
            </span>
            
            {registration.category && (
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(registration.category)}`}>
                {registration.category}
              </span>
            )}
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <BookOpen size={14} />
              <span>{registration.credits}単位</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          {getStatusIcon(registration.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-500">年度・学期</span>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Calendar size={14} />
            <span>{registration.academicYear}年度 {getSemesterLabel(registration.semester)}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-500">登録日</span>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Clock size={14} />
            <span>{formatDate(registration.registrationDate)}</span>
          </div>
        </div>
        
        {(registration.grade || registration.gpa) && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500">成績</span>
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <Award size={14} />
              <span>{formatGrade(registration.grade, registration.gpa)}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-500">アクション</span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={onView}
              className="flex items-center gap-1"
            >
              <Eye size={12} />
              詳細
            </Button>
            
            {registration.status === 'registered' && (
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
          </div>
        </div>
      </div>

      {/* 追加情報があれば表示 */}
      {(registration.notes || registration.dropDate || registration.completionDate) && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="text-xs text-gray-600 space-y-1">
            {registration.dropDate && (
              <p>履修取消日: {formatDate(registration.dropDate)}</p>
            )}
            {registration.completionDate && (
              <p>修了日: {formatDate(registration.completionDate)}</p>
            )}
            {registration.notes && (
              <p>備考: {registration.notes}</p>
            )}
          </div>
        </div>
      )}
    </ResponsiveCard>
  );
};

export default RegistrationCard;