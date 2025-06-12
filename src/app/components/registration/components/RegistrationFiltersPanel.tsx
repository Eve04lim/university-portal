'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ResponsiveCard, Button, Select } from '../../ui';
import { useAppStore } from '../../../../store/useAppStore';

const RegistrationFiltersPanel: React.FC = () => {
  const { filters, updateRegistrationsFilter } = useAppStore();

  const handleAcademicYearChange = (year: string) => {
    const current = filters.registrations.academicYear;
    const updated = current.includes(year)
      ? current.filter(y => y !== year)
      : [...current, year];
    updateRegistrationsFilter({ academicYear: updated });
  };

  const handleSemesterChange = (semester: string) => {
    const current = filters.registrations.semester;
    const updated = current.includes(semester)
      ? current.filter(s => s !== semester)
      : [...current, semester];
    updateRegistrationsFilter({ semester: updated });
  };

  const handleStatusChange = (status: string) => {
    const current = filters.registrations.status;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateRegistrationsFilter({ status: updated });
  };

  const handleCategoryChange = (category: string) => {
    const current = filters.registrations.category;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateRegistrationsFilter({ category: updated });
  };

  const resetFilters = () => {
    updateRegistrationsFilter({
      academicYear: [],
      semester: [],
      status: [],
      category: [],
    });
  };

  const academicYears = ['2024', '2023', '2022', '2021'];
  const semesters = ['spring', 'fall', 'intensive', 'year-long'];
  const semesterLabels = {
    spring: '前期',
    fall: '後期',
    intensive: '集中講義',
    'year-long': '通年'
  };
  const statuses = ['registered', 'completed', 'dropped', 'failed'];
  const statusLabels = {
    registered: '履修中',
    completed: '修了',
    dropped: '履修取消',
    failed: '不合格'
  };
  const categories = ['必修', '選択必修', '選択', '自由', '教職', '資格'];

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

      {/* 年度 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">年度</h4>
        <div className="space-y-2">
          {academicYears.map(year => (
            <label key={year} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.registrations.academicYear.includes(year)}
                onChange={() => handleAcademicYearChange(year)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{year}年度</span>
            </label>
          ))}
        </div>
      </div>

      {/* 学期 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">学期</h4>
        <div className="space-y-2">
          {semesters.map(semester => (
            <label key={semester} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.registrations.semester.includes(semester)}
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

      {/* ステータス */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">ステータス</h4>
        <div className="space-y-2">
          {statuses.map(status => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.registrations.status.includes(status)}
                onChange={() => handleStatusChange(status)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {statusLabels[status as keyof typeof statusLabels]}
              </span>
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
                checked={filters.registrations.category.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default RegistrationFiltersPanel;