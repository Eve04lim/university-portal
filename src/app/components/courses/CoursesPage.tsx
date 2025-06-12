'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Users, 
  Clock, 
  MapPin,
  BookOpen,
  ChevronDown,
  Plus
} from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid, Button, Input, Select } from '../ui';
import { Course, CourseFilters } from '../../../lib/types';
import { CourseService } from '../../../services/courseService';
import { useAppStore } from '../../../store/useAppStore';
import CourseCard from './components/CourseCard';
import CourseDetailModal from './components/CourseDetailModal';
import CourseFiltersPanel from './components/CourseFiltersPanel';

const CoursesPage: React.FC = () => {
  const { courses, setCourses, setLoading, filters, updateCoursesFilter } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'difficulty' | 'credits'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // コース一覧を取得
  useEffect(() => {
    const loadCourses = async () => {
      setLoading('courses', true);
      try {
        const coursesData = await CourseService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('コース取得エラー:', error);
      } finally {
        setLoading('courses', false);
      }
    };

    if (courses.length === 0) {
      loadCourses();
    }
  }, [courses.length, setCourses, setLoading]);

  // フィルター済みコース一覧
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.instructors.some(inst => inst.name.toLowerCase().includes(query)) ||
        course.department.toLowerCase().includes(query)
      );
    }

    // 学部フィルター
    if (filters.courses.department.length > 0) {
      filtered = filtered.filter(course => 
        filters.courses.department.includes(course.department)
      );
    }

    // カテゴリフィルター
    if (filters.courses.category.length > 0) {
      filtered = filtered.filter(course => 
        filters.courses.category.includes(course.category)
      );
    }

    // 単位数フィルター
    if (filters.courses.credits.length > 0) {
      filtered = filtered.filter(course => 
        filters.courses.credits.includes(course.credits)
      );
    }

    // 学期フィルター
    if (filters.courses.semester.length > 0) {
      filtered = filtered.filter(course => 
        filters.courses.semester.includes(course.semester)
      );
    }

    // 曜日フィルター
    if (filters.courses.dayOfWeek.length > 0) {
      filtered = filtered.filter(course => 
        course.schedule.some(schedule => 
          filters.courses.dayOfWeek.includes(schedule.dayOfWeek)
        )
      );
    }

    // 時限フィルター
    if (filters.courses.period.length > 0) {
      filtered = filtered.filter(course => 
        course.schedule.some(schedule => 
          filters.courses.period.includes(schedule.period)
        )
      );
    }

    // 空席状況フィルター
    if (filters.courses.availability !== 'all') {
      const isFull = (course: Course) => course.currentStudents >= course.maxStudents;
      switch (filters.courses.availability) {
        case 'available':
          filtered = filtered.filter(course => !isFull(course));
          break;
        case 'full':
          filtered = filtered.filter(course => isFull(course));
          break;
      }
    }

    // 難易度フィルター
    if (filters.courses.difficulty.length > 0) {
      filtered = filtered.filter(course => 
        filters.courses.difficulty.includes(course.difficulty)
      );
    }

    // 評価フィルター
    if (filters.courses.rating > 0) {
      filtered = filtered.filter(course => course.rating >= filters.courses.rating);
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'difficulty':
          aValue = a.difficulty;
          bValue = b.difficulty;
          break;
        case 'credits':
          aValue = a.credits;
          bValue = b.credits;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  }, [courses, searchQuery, filters.courses, sortBy, sortOrder]);

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
    updateCoursesFilter({
      search: '',
      department: [],
      category: [],
      credits: [],
      semester: [],
      dayOfWeek: [],
      period: [],
      instructor: [],
      availability: 'all',
      difficulty: [],
      rating: 0,
    });
  };

  const sortOptions = [
    { value: 'name-asc', label: '科目名 (昇順)' },
    { value: 'name-desc', label: '科目名 (降順)' },
    { value: 'rating-desc', label: '評価 (高い順)' },
    { value: 'rating-asc', label: '評価 (低い順)' },
    { value: 'difficulty-asc', label: '難易度 (易しい順)' },
    { value: 'difficulty-desc', label: '難易度 (難しい順)' },
    { value: 'credits-asc', label: '単位数 (少ない順)' },
    { value: 'credits-desc', label: '単位数 (多い順)' },
  ];

  const viewModeOptions = [
    { value: 'grid', label: 'グリッド表示' },
    { value: 'list', label: 'リスト表示' },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">科目一覧</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              履修可能な科目を検索・閲覧できます
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredCourses.length}件の科目
            </span>
          </div>
        </div>

        {/* 検索・フィルター・ソートバー */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 検索 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="科目名、科目コード、教員名で検索..."
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
            className="min-w-[160px]"
          />
          
          {/* 表示モード */}
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
            options={viewModeOptions}
            className="min-w-[120px]"
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
        {(searchQuery || filters.courses.department.length > 0 || filters.courses.category.length > 0 || 
          filters.courses.credits.length > 0 || filters.courses.semester.length > 0 ||
          filters.courses.dayOfWeek.length > 0 || filters.courses.period.length > 0 ||
          filters.courses.availability !== 'all' || filters.courses.difficulty.length > 0 ||
          filters.courses.rating > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">アクティブフィルター:</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                検索: {searchQuery}
              </span>
            )}
            {filters.courses.department.map(dept => (
              <span key={dept} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {dept}
              </span>
            ))}
            {filters.courses.category.map(cat => (
              <span key={cat} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {cat}
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
      </div>

      <div className="flex gap-6">
        {/* フィルターパネル */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <CourseFiltersPanel />
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="flex-1">
          {filteredCourses.length === 0 ? (
            <ResponsiveCard className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">科目が見つかりません</h3>
              <p className="text-gray-600 mb-4">
                検索条件やフィルターを変更してみてください
              </p>
              <Button onClick={clearAllFilters} variant="secondary">
                フィルターをクリア
              </Button>
            </ResponsiveCard>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap={4}>
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={() => setSelectedCourse(course)}
                    />
                  ))}
                </ResponsiveGrid>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={() => setSelectedCourse(course)}
                      layout="list"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 科目詳細モーダル */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
};

export default CoursesPage;