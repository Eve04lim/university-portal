'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save,
  X,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Target
} from 'lucide-react';
import { ResponsiveModal, Button, Input, Select, ResponsiveCard } from '../../ui';
import { CoursePlan, PlannedCourse } from '../../../../lib/types';
import { useAppStore } from '../../../../store/useAppStore';

interface PlanModalProps {
  plan: CoursePlan | null;
  mode: 'view' | 'edit' | 'create';
  isOpen: boolean;
  onClose: () => void;
}

const PlanModal: React.FC<PlanModalProps> = ({
  plan,
  mode,
  isOpen,
  onClose,
}) => {
  const { addCoursePlan, updateCoursePlan, courses } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicYear: '2024',
    semester: 'year-long',
    status: 'draft' as const,
  });
  
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan && (mode === 'view' || mode === 'edit')) {
      setFormData({
        name: plan.name,
        description: plan.description,
        academicYear: plan.academicYear,
        semester: plan.semester,
        status: plan.status,
      });
      setPlannedCourses(plan.courses);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        academicYear: '2024',
        semester: 'year-long',
        status: 'draft',
      });
      setPlannedCourses([]);
    }
  }, [plan, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCourse = () => {
    const newCourse: PlannedCourse = {
      courseId: '',
      courseName: '',
      courseCode: '',
      credits: 0,
      semester: 'spring',
      isRequired: false,
      priority: 'medium',
      notes: '',
    };
    setPlannedCourses(prev => [...prev, newCourse]);
  };

  const handleUpdateCourse = (index: number, updates: Partial<PlannedCourse>) => {
    setPlannedCourses(prev => 
      prev.map((course, i) => i === index ? { ...course, ...updates } : course)
    );
  };

  const handleRemoveCourse = (index: number) => {
    setPlannedCourses(prev => prev.filter((_, i) => i !== index));
  };

  const handleCourseSelect = (index: number, courseId: string) => {
    const selectedCourse = courses.find(c => c.id === courseId);
    if (selectedCourse) {
      handleUpdateCourse(index, {
        courseId,
        courseName: selectedCourse.name,
        courseCode: selectedCourse.code,
        credits: selectedCourse.credits,
        semester: selectedCourse.semester,
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const totalCredits = plannedCourses.reduce((sum, course) => sum + course.credits, 0);
      
      if (mode === 'create') {
        const newPlan: CoursePlan = {
          id: `plan-${Date.now()}`,
          studentId: 'student-1',
          name: formData.name,
          description: formData.description,
          academicYear: formData.academicYear,
          semester: formData.semester,
          courses: plannedCourses,
          totalCredits,
          status: formData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        addCoursePlan(newPlan);
      } else if (mode === 'edit' && plan) {
        const updates: Partial<CoursePlan> = {
          name: formData.name,
          description: formData.description,
          academicYear: formData.academicYear,
          semester: formData.semester,
          courses: plannedCourses,
          totalCredits,
          status: formData.status,
          updatedAt: new Date().toISOString(),
        };
        
        updateCoursePlan(plan.id, updates);
      }
      
      onClose();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';
  const totalCredits = plannedCourses.reduce((sum, course) => sum + course.credits, 0);

  const semesterOptions = [
    { value: 'spring', label: '前期' },
    { value: 'fall', label: '後期' },
    { value: 'intensive', label: '集中講義' },
    { value: 'year-long', label: '通年' },
  ];

  const statusOptions = [
    { value: 'draft', label: '下書き' },
    { value: 'active', label: 'アクティブ' },
    { value: 'completed', label: '完了' },
    { value: 'archived', label: 'アーカイブ' },
  ];

  const priorityOptions = [
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ];

  const courseOptions = [
    { value: '', label: '科目を選択' },
    ...courses.map(course => ({
      value: course.id,
      label: `${course.name} (${course.code})`
    }))
  ];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'create' ? '新規履修計画' :
        mode === 'edit' ? '履修計画編集' : '履修計画詳細'
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* 基本情報 */}
        <ResponsiveCard className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                計画名
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isReadOnly}
                placeholder="履修計画の名前を入力"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年度
              </label>
              <Input
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                disabled={isReadOnly}
                placeholder="2024"
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
                options={semesterOptions}
                disabled={isReadOnly}
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
                options={statusOptions}
                disabled={isReadOnly}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="履修計画の説明を入力"
            />
          </div>
        </ResponsiveCard>

        {/* 科目一覧 */}
        <ResponsiveCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">履修科目</h3>
              <span className="text-sm text-gray-500">
                ({plannedCourses.length}科目, {totalCredits}単位)
              </span>
            </div>
            
            {!isReadOnly && (
              <Button
                size="sm"
                onClick={handleAddCourse}
                className="flex items-center gap-1"
              >
                <Plus size={14} />
                科目追加
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {plannedCourses.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      科目
                    </label>
                    <Select
                      value={course.courseId}
                      onChange={(e) => handleCourseSelect(index, e.target.value)}
                      options={courseOptions}
                      disabled={isReadOnly}
                      className="w-full text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      単位数
                    </label>
                    <Input
                      type="number"
                      value={course.credits}
                      onChange={(e) => handleUpdateCourse(index, { credits: parseInt(e.target.value) || 0 })}
                      disabled={isReadOnly}
                      className="w-full text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      優先度
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={course.priority}
                        onChange={(e) => handleUpdateCourse(index, { priority: e.target.value as any })}
                        options={priorityOptions}
                        disabled={isReadOnly}
                        className="flex-1 text-sm"
                      />
                      
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={course.isRequired}
                          onChange={(e) => handleUpdateCourse(index, { isRequired: e.target.checked })}
                          disabled={isReadOnly}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-1"
                        />
                        必修
                      </label>
                      
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRemoveCourse(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {course.notes && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      備考
                    </label>
                    <Input
                      value={course.notes}
                      onChange={(e) => handleUpdateCourse(index, { notes: e.target.value })}
                      disabled={isReadOnly}
                      placeholder="備考があれば入力"
                      className="w-full text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
            
            {plannedCourses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm">履修科目が登録されていません</p>
                {!isReadOnly && (
                  <Button
                    size="sm"
                    onClick={handleAddCourse}
                    className="mt-2"
                  >
                    科目を追加
                  </Button>
                )}
              </div>
            )}
          </div>
        </ResponsiveCard>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              disabled={loading || !formData.name}
              className="flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {loading ? '保存中...' : '保存'}
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

export default PlanModal;