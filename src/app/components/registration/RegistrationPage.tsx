'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Filter, 
  Search,
  Calendar,
  Clock,
  BookOpen,
  User,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid, Button, Input, Select } from '../ui';
import { CourseRegistration, RegistrationFilters } from '../../../lib/types';
import { RegistrationService } from '../../../services/registrationService';
import { useAppStore } from '../../../store/useAppStore';
import RegistrationCard from './components/RegistrationCard';
import RegistrationModal from './components/RegistrationModal';
import RegistrationFiltersPanel from './components/RegistrationFiltersPanel';

const RegistrationPage: React.FC = () => {
  const { 
    registrations, 
    setRegistrations, 
    setLoading, 
    filters,
    updateRegistrationsFilter 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<CourseRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [sortBy, setSortBy] = useState<'courseName' | 'registrationDate' | 'credits' | 'semester'>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 履修登録データを取得
  useEffect(() => {
    const loadRegistrations = async () => {
      setLoading('registrations', true);
      try {
        const registrationData = await RegistrationService.getRegistrations();
        setRegistrations(registrationData);
      } catch (error) {
        console.error('履修登録データ取得エラー:', error);
      } finally {
        setLoading('registrations', false);
      }
    };

    if (registrations.length === 0) {
      loadRegistrations();
    }
  }, [registrations.length, setRegistrations, setLoading]);

  // フィルター済み履修登録一覧
  const filteredRegistrations = useMemo(() => {
    let filtered = [...registrations];

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(registration =>
        registration.courseName.toLowerCase().includes(query) ||
        registration.courseCode.toLowerCase().includes(query)
      );
    }

    // 年度フィルター
    if (filters.registrations.academicYear.length > 0) {
      filtered = filtered.filter(registration => 
        filters.registrations.academicYear.includes(registration.academicYear)
      );
    }

    // 学期フィルター
    if (filters.registrations.semester.length > 0) {
      filtered = filtered.filter(registration => 
        filters.registrations.semester.includes(registration.semester)
      );
    }

    // ステータスフィルター
    if (filters.registrations.status.length > 0) {
      filtered = filtered.filter(registration => 
        filters.registrations.status.includes(registration.status)
      );
    }

    // カテゴリフィルター
    if (filters.registrations.category.length > 0) {
      filtered = filtered.filter(registration => 
        registration.category && filters.registrations.category.includes(registration.category)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'courseName':
          aValue = a.courseName;
          bValue = b.courseName;
          break;
        case 'registrationDate':
          aValue = new Date(a.registrationDate);
          bValue = new Date(b.registrationDate);
          break;
        case 'credits':
          aValue = a.credits;
          bValue = b.credits;
          break;
        case 'semester':
          aValue = a.semester;
          bValue = b.semester;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  }, [registrations, searchQuery, filters.registrations, sortBy, sortOrder]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    updateRegistrationsFilter({
      academicYear: [],
      semester: [],
      status: [],
      category: [],
    });
  };

  const handleCreateNew = () => {
    setSelectedRegistration(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleView = (registration: CourseRegistration) => {
    setSelectedRegistration(registration);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (registration: CourseRegistration) => {
    setSelectedRegistration(registration);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
  };

  const getStatusStats = () => {
    const stats = {
      registered: 0,
      completed: 0,
      dropped: 0,
      failed: 0,
    };

    registrations.forEach(reg => {
      if (reg.status in stats) {
        stats[reg.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const getTotalCredits = () => {
    return registrations
      .filter(reg => reg.status === 'registered' || reg.status === 'completed')
      .reduce((total, reg) => total + reg.credits, 0);
  };

  const sortOptions = [
    { value: 'registrationDate-desc', label: '登録日時 (新しい順)' },
    { value: 'registrationDate-asc', label: '登録日時 (古い順)' },
    { value: 'courseName-asc', label: '科目名 (昇順)' },
    { value: 'courseName-desc', label: '科目名 (降順)' },
    { value: 'credits-desc', label: '単位数 (多い順)' },
    { value: 'credits-asc', label: '単位数 (少ない順)' },
    { value: 'semester-asc', label: '学期 (昇順)' },
    { value: 'semester-desc', label: '学期 (降順)' },
  ];

  const statusStats = getStatusStats();
  const totalCredits = getTotalCredits();

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">履修登録管理</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              履修登録の管理・確認ができます
            </p>
          </div>
          
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2 sm:w-auto"
          >
            <Plus size={16} />
            新規登録
          </Button>
        </div>

        {/* 統計カード */}
        <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={4}>
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">履修中</p>
                <p className="text-2xl font-bold text-blue-600">{statusStats.registered}</p>
              </div>
              <CheckCircle className="text-blue-500" size={24} />
            </div>
          </ResponsiveCard>
          
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">修了済</p>
                <p className="text-2xl font-bold text-green-600">{statusStats.completed}</p>
              </div>
              <Calendar className="text-green-500" size={24} />
            </div>
          </ResponsiveCard>
          
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">履修取消</p>
                <p className="text-2xl font-bold text-orange-600">{statusStats.dropped}</p>
              </div>
              <X className="text-orange-500" size={24} />
            </div>
          </ResponsiveCard>
          
          <ResponsiveCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総単位数</p>
                <p className="text-2xl font-bold text-purple-600">{totalCredits}</p>
              </div>
              <BookOpen className="text-purple-500" size={24} />
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>

        {/* 検索・フィルター・ソートバー */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 検索 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="科目名、科目コードで検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          
          {/* ソート */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => handleSortChange(e.target.value)}
            options={sortOptions}
            className="min-w-[180px]"
          />
          
          {/* フィルターボタン */}
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${showFilters ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <Filter size={16} />
            フィルター
          </Button>
        </div>

        {/* アクティブフィルター表示 */}
        {(searchQuery || filters.registrations.academicYear.length > 0 || 
          filters.registrations.semester.length > 0 || filters.registrations.status.length > 0 ||
          filters.registrations.category.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">アクティブフィルター:</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                検索: {searchQuery}
              </span>
            )}
            {filters.registrations.academicYear.map(year => (
              <span key={year} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {year}年度
              </span>
            ))}
            {filters.registrations.semester.map(semester => (
              <span key={semester} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {semester}
              </span>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs px-2 py-1"
            >
              すべてクリア
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filteredRegistrations.length}件の履修登録
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* フィルターパネル */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <RegistrationFiltersPanel />
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="flex-1">
          {filteredRegistrations.length === 0 ? (
            <ResponsiveCard className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">履修登録が見つかりません</h3>
              <p className="text-gray-600 mb-4">
                検索条件やフィルターを変更するか、新しい履修登録を作成してください
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={clearAllFilters} variant="secondary">
                  フィルターをクリア
                </Button>
                <Button onClick={handleCreateNew}>
                  新規登録
                </Button>
              </div>
            </ResponsiveCard>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                  onView={() => handleView(registration)}
                  onEdit={() => handleEdit(registration)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 履修登録モーダル */}
      {isModalOpen && (
        <RegistrationModal
          registration={selectedRegistration}
          mode={modalMode}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RegistrationPage;