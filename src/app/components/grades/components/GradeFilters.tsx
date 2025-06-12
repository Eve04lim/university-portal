'use client';

import { ResponsiveCard, Select } from '../../ui';
import { FilterOption } from '../types';

interface GradeFiltersProps {
  selectedYear: string;
  selectedSemester: string;
  selectedCategory: string;
  onYearChange: (year: string) => void;
  onSemesterChange: (semester: string) => void;
  onCategoryChange: (category: string) => void;
  yearOptions: FilterOption[];
  semesterOptions: FilterOption[];
  categoryOptions: FilterOption[];
}

const GradeFilters = ({
  selectedYear,
  selectedSemester,
  selectedCategory,
  onYearChange,
  onSemesterChange,
  onCategoryChange,
  yearOptions,
  semesterOptions,
  categoryOptions
}: GradeFiltersProps) => {
  return (
    <ResponsiveCard className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年度
          </label>
          <Select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            options={yearOptions}
            className="w-full"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            学期
          </label>
          <Select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            options={semesterOptions}
            className="w-full"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ
          </label>
          <Select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={categoryOptions}
            className="w-full"
          />
        </div>
      </div>
    </ResponsiveCard>
  );
};

export default GradeFilters;