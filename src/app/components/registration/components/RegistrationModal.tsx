'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  BookOpen,
  User,
  Clock,
  Award,
  AlertCircle,
  Save,
  X,
  Trash2
} from 'lucide-react';
import { ResponsiveModal, Button, Input, Select, ResponsiveCard } from '../../ui';
import { CourseRegistration, Course } from '../../../../lib/types';
import { useAppStore } from '../../../../store/useAppStore';
import { CourseService } from '../../../../services/courseService';

interface RegistrationModalProps {
  registration: CourseRegistration | null;
  mode: 'view' | 'edit' | 'create';
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  registration,
  mode,
  isOpen,
  onClose,
}) => {
  const { 
    addRegistration, 
    updateRegistration, 
    removeRegistration,
    courses,
    setCourses 
  } = useAppStore();
  
  const [formData, setFormData] = useState({
    courseId: '',
    courseName: '',
    courseCode: '',
    credits: 0,
    semester: 'spring',
    academicYear: 2024,
    status: 'registered' as const,
    grade: '',
    gpa: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  // 利用可能なコースを取得
  useEffect(() => {
    const loadCourses = async () => {
      if (mode === 'create' && courses.length === 0) {
        try {
          const coursesData = await CourseService.getCourses();
          setCourses(coursesData);
          setAvailableCourses(coursesData);
        } catch (error) {
          console.error('コース取得エラー:', error);
        }
      } else {
        setAvailableCourses(courses);
      }
    };

    if (isOpen) {
      loadCourses();
    }
  }, [isOpen, mode, courses, setCourses]);

  // 既存の履修登録データをフォームに設定
  useEffect(() => {
    if (registration && (mode === 'view' || mode === 'edit')) {
      setFormData({
        courseId: registration.courseId,
        courseName: registration.courseName,
        courseCode: registration.courseCode,
        credits: registration.credits,
        semester: registration.semester,
        academicYear: registration.academicYear,
        status: registration.status,
        grade: registration.grade || '',
        gpa: registration.gpa?.toString() || '',
        notes: registration.notes || '',
      });
    } else if (mode === 'create') {
      setFormData({
        courseId: '',
        courseName: '',
        courseCode: '',
        credits: 0,
        semester: 'spring',
        academicYear: 2024,
        status: 'registered',
        grade: '',
        gpa: '',
        notes: '',
      });
    }
  }, [registration, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseSelect = (courseId: string) => {
    const selectedCourse = availableCourses.find(c => c.id === courseId);
    if (selectedCourse) {
      setFormData(prev => ({
        ...prev,
        courseId,
        courseName: selectedCourse.name,
        courseCode: selectedCourse.code,
        credits: selectedCourse.credits,
        semester: selectedCourse.semester,
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (mode === 'create') {
        const newRegistration: CourseRegistration = {
          id: `reg-${Date.now()}`,
          studentId: 'student-1', // 実際のアプリでは現在のユーザーIDを使用
          courseId: formData.courseId,
          courseName: formData.courseName,
          courseCode: formData.courseCode,
          credits: formData.credits,
          semester: formData.semester,
          academicYear: formData.academicYear,
          registrationDate: new Date(),
          status: formData.status,
          registrationType: 'regular',
          grade: formData.grade || undefined,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
          notes: formData.notes || undefined,
          lastModified: new Date(),
        };
        
        addRegistration(newRegistration);
      } else if (mode === 'edit' && registration) {
        const updates: Partial<CourseRegistration> = {
          status: formData.status,
          grade: formData.grade || undefined,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
          notes: formData.notes || undefined,
          lastModified: new Date(),
        };
        
        // ステータス変更時の日付更新
        if (formData.status === 'dropped' && !registration.dropDate) {
          updates.dropDate = new Date();
        } else if (formData.status === 'completed' && !registration.completionDate) {
          updates.completionDate = new Date();
        }
        
        updateRegistration(registration.id, updates);
      }
      
      onClose();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (registration && window.confirm('この履修登録を削除しますか？')) {
      try {
        removeRegistration(registration.id);
        onClose();
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
      }
    }
  };

  const getStatusOptions = () => [
    { value: 'registered', label: '履修中' },
    { value: 'completed', label: '修了' },
    { value: 'dropped', label: '履修取消' },
    { value: 'cancelled', label: '取り消し' },
    { value: 'waitlisted', label: 'ウェイトリスト' },
  ];

  const getSemesterOptions = () => [
    { value: 'spring', label: '前期' },
    { value: 'fall', label: '後期' },
    { value: 'intensive', label: '集中講義' },
    { value: 'year-long', label: '通年' },
  ];

  const getYearOptions = () => [
    { value: '2024', label: '2024年度' },
    { value: '2023', label: '2023年度' },
    { value: '2022', label: '2022年度' },
    { value: '2021', label: '2021年度' },
  ];

  const getCourseOptions = () => 
    availableCourses.map(course => ({
      value: course.id,
      label: `${course.name} (${course.code})`
    }));

  const isReadOnly = mode === 'view';
  const canDelete = mode === 'edit' && registration;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'create' ? '新規履修登録' :
        mode === 'edit' ? '履修登録編集' : '履修登録詳細'
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* 科目選択 (新規作成時のみ) */}
        {mode === 'create' && (
          <ResponsiveCard className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">科目選択</h3>
            <Select
              value={formData.courseId}
              onChange={(e) => handleCourseSelect(e.target.value)}
              options={[
                { value: '', label: '科目を選択してください' },
                ...getCourseOptions()
              ]}
              className="w-full"
            />
          </ResponsiveCard>
        )}

        {/* 基本情報 */}
        <ResponsiveCard className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                科目名
              </label>
              <Input
                value={formData.courseName}
                onChange={(e) => handleInputChange('courseName', e.target.value)}
                disabled={isReadOnly || mode === 'create'}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                科目コード
              </label>
              <Input
                value={formData.courseCode}
                onChange={(e) => handleInputChange('courseCode', e.target.value)}
                disabled={isReadOnly || mode === 'create'}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                単位数
              </label>
              <Input
                type="number"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
                disabled={isReadOnly || mode === 'create'}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年度
              </label>
              <Select
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                options={getYearOptions()}
                disabled={isReadOnly}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                学期
              </label>
              <Select
                value={formData.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
                options={getSemesterOptions()}
                disabled={isReadOnly || mode === 'create'}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                options={getStatusOptions()}
                disabled={isReadOnly}
                className="w-full"
              />
            </div>
          </div>
        </ResponsiveCard>

        {/* 成績情報 */}
        {(mode !== 'create' || formData.status === 'completed') && (
          <ResponsiveCard className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">成績情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  成績
                </label>
                <Input
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="例: A, B+, C"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPA
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange('gpa', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="例: 4.0"
                  className="w-full"
                />
              </div>
            </div>
          </ResponsiveCard>
        )}

        {/* 備考 */}
        <ResponsiveCard className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">備考</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            disabled={isReadOnly}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="備考があれば入力してください"
          />
        </ResponsiveCard>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              disabled={loading || !formData.courseName}
              className="flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {loading ? '保存中...' : '保存'}
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="secondary"
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
              削除
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={onClose}
            className="sm:ml-auto"
          >
            {isReadOnly ? '閉じる' : 'キャンセル'}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default RegistrationModal;