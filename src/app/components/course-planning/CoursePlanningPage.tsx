'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar,
  BookOpen,
  Target,
  Save,
  Share,
  Download,
  Edit,
  Trash2,
  Copy,
  Clock
} from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid, Button, Input, Select } from '../ui';
import { CoursePlan } from '../../../lib/types';
import { useAppStore } from '../../../store/useAppStore';
import PlanCard from './components/PlanCard';
import PlanModal from './components/PlanModal';
import PlanCalendar from './components/PlanCalendar';
import PlanProgressSummary from './components/PlanProgressSummary';
import RecommendedCourses from './components/RecommendedCourses';

const CoursePlanningPage: React.FC = () => {
  const { 
    coursePlans, 
    setCoursePlans, 
    addCoursePlan,
    updateCoursePlan,
    removeCoursePlan,
    setLoading,
    academicRecord,
    registrations
  } = useAppStore();
  
  const [activeView, setActiveView] = useState<'grid' | 'calendar' | 'timeline'>('grid');
  const [selectedPlan, setSelectedPlan] = useState<CoursePlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 履修計画データを取得
  useEffect(() => {
    const loadCoursePlans = async () => {
      setLoading('coursePlans', true);
      try {
        // 実際のアプリではAPIからデータを取得
        const samplePlans: CoursePlan[] = [
          {
            id: 'plan-1',
            studentId: 'student-1',
            name: '2024年度 履修計画',
            startYear: 2024,
            endYear: 2025,
            yearlyPlans: [
              {
                academicYear: 2024,
                semesterPlans: [
                  {
                    semester: 'spring',
                    plannedCourses: [
                      {
                        courseId: 'cs301',
                        courseName: 'データベース論',
                        credits: 2,
                        category: '必修',
                        priority: 'high',
                        status: 'planned'
                      },
                      {
                        courseId: 'math201',
                        courseName: '統計学',
                        credits: 2,
                        category: '選択',
                        priority: 'medium',
                        status: 'planned'
                      }
                    ],
                    targetCredits: 16,
                    targetGPA: 3.5
                  }
                ]
              }
            ],
            targetGraduation: new Date('2025-03-31'),
            targetGPA: 3.5,
            status: 'active',
            createdAt: new Date(),
            lastModified: new Date(),
            notes: '卒業要件を満たすための基本的な履修計画'
          }
        ];
        
        setCoursePlans(samplePlans);
      } catch (error) {
        console.error('履修計画取得エラー:', error);
      } finally {
        setLoading('coursePlans', false);
      }
    };

    if (coursePlans.length === 0) {
      loadCoursePlans();
    }
  }, [coursePlans.length, setCoursePlans, setLoading]);

  const filteredPlans = coursePlans.filter(plan => {
    const matchesSearch = !searchQuery || 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.notes && plan.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSemester = filterSemester === 'all'; // 簡略化
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    
    return matchesSearch && matchesSemester && matchesStatus;
  });

  const handleCreateNew = () => {
    setSelectedPlan(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleView = (plan: CoursePlan) => {
    setSelectedPlan(plan);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (plan: CoursePlan) => {
    setSelectedPlan(plan);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDuplicate = (plan: CoursePlan) => {
    const duplicatedPlan: CoursePlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      name: `${plan.name} (コピー)`,
      status: 'draft',
      createdAt: new Date(),
      lastModified: new Date()
    };
    
    addCoursePlan(duplicatedPlan);
  };

  const handleDelete = (plan: CoursePlan) => {
    if (window.confirm(`履修計画「${plan.name}」を削除しますか？`)) {
      removeCoursePlan(plan.id);
    }
  };

  const handleExport = async (plan: CoursePlan) => {
    try {
      // 実際のアプリではPDF生成やCSVエクスポートなどを実装
      const planData = JSON.stringify(plan, null, 2);
      const blob = new Blob([planData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const getTotalCredits = () => {
    return filteredPlans.reduce((total, plan) => total + plan.totalCredits, 0);
  };

  const getActivePlansCount = () => {
    return filteredPlans.filter(plan => plan.status === 'active').length;
  };

  const viewOptions = [
    { value: 'grid', label: 'カード表示', icon: BookOpen },
    { value: 'calendar', label: 'カレンダー表示', icon: Calendar },
    { value: 'timeline', label: 'タイムライン表示', icon: Clock },
  ];

  const semesterOptions = [
    { value: 'all', label: 'すべての学期' },
    { value: 'spring', label: '前期' },
    { value: 'fall', label: '後期' },
    { value: 'intensive', label: '集中講義' },
    { value: 'year-long', label: '通年' },
  ];

  const statusOptions = [
    { value: 'all', label: 'すべてのステータス' },
    { value: 'draft', label: '下書き' },
    { value: 'active', label: 'アクティブ' },
    { value: 'completed', label: '完了' },
    { value: 'archived', label: 'アーカイブ' },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">履修計画</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              将来の履修予定を計画・管理できます
            </p>
          </div>
          
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2 sm:w-auto"
          >
            <Plus size={16} />
            新規作成
          </Button>
        </div>

        {/* 統計サマリー */}
        <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={4}>
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">計画数</p>
                <p className="text-2xl font-bold text-blue-600">{filteredPlans.length}</p>
              </div>
              <BookOpen className="text-blue-500" size={24} />
            </div>
          </ResponsiveCard>
          
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ</p>
                <p className="text-2xl font-bold text-green-600">{getActivePlansCount()}</p>
              </div>
              <Target className="text-green-500" size={24} />
            </div>
          </ResponsiveCard>
          
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">計画単位数</p>
                <p className="text-2xl font-bold text-purple-600">{getTotalCredits()}</p>
              </div>
              <Calendar className="text-purple-500" size={24} />
            </div>
          </ResponsiveCard>
          
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">進捗率</p>
                <p className="text-2xl font-bold text-orange-600">
                  {academicRecord ? 
                    Math.round((academicRecord.totalCreditsEarned / (academicRecord.graduationRequirements?.totalCreditsRequired || 1)) * 100) : 0
                  }%
                </p>
              </div>
              <Target className="text-orange-500" size={24} />
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>

        {/* 検索・フィルター・表示モードバー */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 検索 */}
          <div className="flex-1">
            <Input
              placeholder="履修計画名や説明で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* フィルター */}
          <Select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            options={semesterOptions}
            className="min-w-[140px]"
          />
          
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
            className="min-w-[140px]"
          />
          
          {/* 表示モード */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setActiveView(option.value as any)}
                  className={`px-3 py-2 text-sm flex items-center gap-1 transition-colors ${
                    activeView === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title={option.label}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* メインエリア */}
        <div className="lg:col-span-3">
          {activeView === 'grid' && (
            <div className="space-y-4">
              {filteredPlans.length === 0 ? (
                <ResponsiveCard className="p-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">履修計画がありません</h3>
                  <p className="text-gray-600 mb-4">
                    新しい履修計画を作成して、将来の学習予定を立てましょう
                  </p>
                  <Button onClick={handleCreateNew}>
                    履修計画を作成
                  </Button>
                </ResponsiveCard>
              ) : (
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={4}>
                  {filteredPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onView={() => handleView(plan)}
                      onEdit={() => handleEdit(plan)}
                      onDuplicate={() => handleDuplicate(plan)}
                      onDelete={() => handleDelete(plan)}
                      onExport={() => handleExport(plan)}
                    />
                  ))}
                </ResponsiveGrid>
              )}
            </div>
          )}

          {activeView === 'calendar' && (
            <PlanCalendar plans={filteredPlans} />
          )}

          {activeView === 'timeline' && (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <ResponsiveCard key={plan.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plan.status === 'active' ? 'bg-green-100 text-green-800' :
                      plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      plan.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status === 'active' ? 'アクティブ' :
                       plan.status === 'completed' ? '完了' :
                       plan.status === 'draft' ? '下書き' : 'アーカイブ'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{plan.academicYear}年度</span>
                    <span>{plan.totalCredits}単位</span>
                    <span>{plan.courses.length}科目</span>
                  </div>
                </ResponsiveCard>
              ))}
            </div>
          )}
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 進捗サマリー */}
          {academicRecord && (
            <PlanProgressSummary 
              academicRecord={academicRecord}
              registrations={registrations}
              plans={coursePlans}
            />
          )}

          {/* おすすめ科目 */}
          <RecommendedCourses 
            academicRecord={academicRecord}
            registrations={registrations}
          />
        </div>
      </div>

      {/* 履修計画モーダル */}
      {isModalOpen && (
        <PlanModal
          plan={selectedPlan}
          mode={modalMode}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CoursePlanningPage;