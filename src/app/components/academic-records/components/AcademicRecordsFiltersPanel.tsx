'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ResponsiveCard, Button } from '../../ui';
import { useAppStore } from '../../../../store/useAppStore';

const AcademicRecordsFiltersPanel: React.FC = () => {
  const { filters, updateAcademicRecordsFilter } = useAppStore();

  const handleAcademicYearChange = (year: string) => {
    const current = filters.academicRecords.academicYear;
    const updated = current.includes(year)
      ? current.filter(y => y !== year)
      : [...current, year];
    updateAcademicRecordsFilter({ academicYear: updated });
  };

  const handleSemesterChange = (semester: string) => {
    const current = filters.academicRecords.semester;
    const updated = current.includes(semester)
      ? current.filter(s => s !== semester)
      : [...current, semester];
    updateAcademicRecordsFilter({ semester: updated });
  };

  const handleCategoryChange = (category: string) => {
    const current = filters.academicRecords.category;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateAcademicRecordsFilter({ category: updated });
  };

  const handleGradeRangeChange = (gradeRange: string) => {
    const current = filters.academicRecords.gradeRange;
    const updated = current.includes(gradeRange)
      ? current.filter(g => g !== gradeRange)
      : [...current, gradeRange];
    updateAcademicRecordsFilter({ gradeRange: updated });
  };

  const handleGPARangeChange = (field: 'min' | 'max', value: number) => {
    const [currentMin, currentMax] = filters.academicRecords.gpaRange;
    const updated: [number, number] = field === 'min' 
      ? [value, currentMax]
      : [currentMin, value];
    updateAcademicRecordsFilter({ gpaRange: updated });
  };

  const resetFilters = () => {
    updateAcademicRecordsFilter({
      academicYear: [],
      semester: [],
      category: [],
      gradeRange: [],
      gpaRange: [0, 4],
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
  const categories = ['必修', '選択必修', '選択', '自由', '教職', '資格'];
  const gradeRanges = ['A', 'B', 'C', 'D', 'F'];
  const gradeRangeLabels = {
    'A': 'A評価 (4.0-3.7)',
    'B': 'B評価 (3.6-3.0)',
    'C': 'C評価 (2.9-2.0)',
    'D': 'D評価 (1.9-1.0)',
    'F': 'F評価 (0.9-0.0)'
  };

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
                checked={filters.academicRecords.academicYear.includes(year)}
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
                checked={filters.academicRecords.semester.includes(semester)}
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

      {/* カテゴリ */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">科目カテゴリ</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.academicRecords.category.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 成績範囲 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">成績範囲</h4>
        <div className="space-y-2">
          {gradeRanges.map(gradeRange => (
            <label key={gradeRange} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.academicRecords.gradeRange.includes(gradeRange)}
                onChange={() => handleGradeRangeChange(gradeRange)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {gradeRangeLabels[gradeRange as keyof typeof gradeRangeLabels]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* GPA範囲 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">GPA範囲</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">最小値</label>
            <input
              type="range"
              min="0"
              max="4"
              step="0.1"
              value={filters.academicRecords.gpaRange[0]}
              onChange={(e) => handleGPARangeChange('min', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.0</span>
              <span className="font-medium">{filters.academicRecords.gpaRange[0].toFixed(1)}</span>
              <span>4.0</span>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">最大値</label>
            <input
              type="range"
              min="0"
              max="4"
              step="0.1"
              value={filters.academicRecords.gpaRange[1]}
              onChange={(e) => handleGPARangeChange('max', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.0</span>
              <span className="font-medium">{filters.academicRecords.gpaRange[1].toFixed(1)}</span>
              <span>4.0</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {filters.academicRecords.gpaRange[0].toFixed(1)} - {filters.academicRecords.gpaRange[1].toFixed(1)} の範囲で絞り込み
          </div>
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default AcademicRecordsFiltersPanel;