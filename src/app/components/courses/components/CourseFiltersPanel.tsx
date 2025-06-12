'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { ResponsiveCard, Button, Input, Select } from '../../ui';
import { useAppStore } from '../../../../store/useAppStore';

const CourseFiltersPanel: React.FC = () => {
  const { filters, updateCoursesFilter } = useAppStore();

  const handleDepartmentChange = (department: string) => {
    const current = filters.courses.department;
    const updated = current.includes(department)
      ? current.filter(d => d !== department)
      : [...current, department];
    updateCoursesFilter({ department: updated });
  };

  const handleCategoryChange = (category: string) => {
    const current = filters.courses.category;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateCoursesFilter({ category: updated });
  };

  const handleCreditsChange = (credits: number) => {
    const current = filters.courses.credits;
    const updated = current.includes(credits)
      ? current.filter(c => c !== credits)
      : [...current, credits];
    updateCoursesFilter({ credits: updated });
  };

  const handleSemesterChange = (semester: string) => {
    const current = filters.courses.semester;
    const updated = current.includes(semester)
      ? current.filter(s => s !== semester)
      : [...current, semester];
    updateCoursesFilter({ semester: updated });
  };

  const handleDayOfWeekChange = (day: number) => {
    const current = filters.courses.dayOfWeek;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    updateCoursesFilter({ dayOfWeek: updated });
  };

  const handlePeriodChange = (period: number) => {
    const current = filters.courses.period;
    const updated = current.includes(period)
      ? current.filter(p => p !== period)
      : [...current, period];
    updateCoursesFilter({ period: updated });
  };

  const handleDifficultyChange = (difficulty: number) => {
    const current = filters.courses.difficulty;
    const updated = current.includes(difficulty)
      ? current.filter(d => d !== difficulty)
      : [...current, difficulty];
    updateCoursesFilter({ difficulty: updated });
  };

  const resetFilters = () => {
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

  const departments = ['情報科学科', '数学科', '物理学科', '化学科', '生物学科'];
  const categories = ['必修', '選択必修', '選択', '自由', '教職', '資格'];
  const creditOptions = [1, 2, 3, 4];
  const semesters = ['spring', 'fall', 'intensive', 'year-long'];
  const semesterLabels = {
    spring: '前期',
    fall: '後期', 
    intensive: '集中講義',
    'year-long': '通年'
  };
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const periods = [1, 2, 3, 4, 5, 6];
  const difficulties = [1, 2, 3, 4, 5];
  const difficultyLabels = {
    1: '非常に易しい',
    2: '易しい',
    3: '普通',
    4: '難しい',
    5: '非常に難しい'
  };

  const availabilityOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'available', label: '履修可能' },
    { value: 'full', label: '定員満了' },
  ];

  return (
    <ResponsiveCard className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">フィルター</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={resetFilters}
          className="flex items-center gap-1"
        >
          <RotateCcw size={14} />
          リセット
        </Button>
      </div>

      {/* 学部・学科 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">学部・学科</h4>
        <div className="space-y-2">
          {departments.map(department => (
            <label key={department} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.courses.department.includes(department)}
                onChange={() => handleDepartmentChange(department)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{department}</span>
            </label>
          ))}
        </div>
      </div>

      {/* カテゴリ */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">科目カテゴリ</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.courses.category.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 単位数 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">単位数</h4>
        <div className="grid grid-cols-2 gap-2">
          {creditOptions.map(credits => (
            <label key={credits} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.courses.credits.includes(credits)}
                onChange={() => handleCreditsChange(credits)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{credits}単位</span>
            </label>
          ))}
        </div>
      </div>

      {/* 学期 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">開講学期</h4>
        <div className="space-y-2">
          {semesters.map(semester => (
            <label key={semester} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.courses.semester.includes(semester)}
                onChange={() => handleSemesterChange(semester)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {semesterLabels[semester as keyof typeof semesterLabels]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 曜日 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">曜日</h4>
        <div className="grid grid-cols-4 gap-2">
          {dayNames.map((dayName, index) => (
            <label key={index} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.courses.dayOfWeek.includes(index)}
                onChange={() => handleDayOfWeekChange(index)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-1 text-sm text-gray-700">{dayName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 時限 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">時限</h4>
        <div className="grid grid-cols-3 gap-2">
          {periods.map(period => (
            <label key={period} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.courses.period.includes(period)}
                onChange={() => handlePeriodChange(period)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-1 text-sm text-gray-700">{period}限</span>
            </label>
          ))}
        </div>
      </div>

      {/* 空席状況 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">空席状況</h4>
        <Select
          value={filters.courses.availability}
          onChange={(e) => updateCoursesFilter({ availability: e.target.value as any })}
          options={availabilityOptions}
        />
      </div>

      {/* 難易度 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">難易度</h4>
        <div className="space-y-2">
          {difficulties.map(difficulty => (
            <label key={difficulty} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.courses.difficulty.includes(difficulty)}
                onChange={() => handleDifficultyChange(difficulty)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {difficultyLabels[difficulty as keyof typeof difficultyLabels]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 評価 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">最低評価</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={filters.courses.rating}
            onChange={(e) => updateCoursesFilter({ rating: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>0.0</span>
            <span className="font-medium">{filters.courses.rating.toFixed(1)}以上</span>
            <span>5.0</span>
          </div>
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default CourseFiltersPanel;