'use client';

import { BarChart3, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui';

// Types and utilities
import { Grade, ViewMode } from './types';
import { semesterGPAData } from './data';
import { gradesData } from './data';

// Custom hooks
import { useGradeFilters } from '../../../hooks/useGradeFilters';

// Components
import GradeFilters from './components/GradeFilters';
import GradeStats from './components/GradeStats';
import GradeTable from './components/GradeTable';
import GradeChart from './components/GradeChart';
import GradeDetailModal from './components/GradeDetailModal';

const GradesPage = () => {
  // Custom hooks
  const gradeFilters = useGradeFilters(gradesData);
  
  // Local state
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Event handlers
  const handleGradeClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGrade(null);
  };

  const handleExport = () => {
    // TODO: 実装予定 - CSV形式でエクスポート
    console.log('成績データをエクスポート');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">成績管理</h1>
          <p className="text-gray-600 text-sm sm:text-base">学業成績の確認と分析ができます</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              テーブル
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewMode === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={16} className="inline mr-1" />
              グラフ
            </button>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleExport}
            className="whitespace-nowrap"
          >
            <Download size={16} className="mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <GradeStats statistics={gradeFilters.statistics} />

      {/* Filters */}
      <GradeFilters
        selectedYear={gradeFilters.filters.selectedYear}
        selectedSemester={gradeFilters.filters.selectedSemester}
        selectedCategory={gradeFilters.filters.selectedCategory}
        onYearChange={gradeFilters.setYear}
        onSemesterChange={gradeFilters.setSemester}
        onCategoryChange={gradeFilters.setCategory}
        yearOptions={gradeFilters.yearOptions}
        semesterOptions={gradeFilters.semesterOptions}
        categoryOptions={gradeFilters.categoryOptions}
      />

      {/* Content */}
      {viewMode === 'table' ? (
        <GradeTable
          grades={gradeFilters.filteredGrades}
          onRowClick={handleGradeClick}
        />
      ) : (
        <GradeChart
          gradeDistribution={gradeFilters.statistics.gradeDistribution}
          semesterGPAData={semesterGPAData}
          completedGrades={gradeFilters.completedGrades}
        />
      )}

      {/* Modal */}
      <GradeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedGrade={selectedGrade}
      />
    </div>
  );
};

export default GradesPage;