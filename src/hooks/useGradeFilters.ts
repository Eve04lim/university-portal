import { useState, useMemo, useCallback } from 'react';
import { Grade, GradeStatistics, FilterOption } from '../app/components/grades/types';
import { filterGrades, calculateStatistics } from '../app/components/grades/utils';

export interface GradeFilters {
  selectedYear: string;
  selectedSemester: string;
  selectedCategory: string;
}

export interface UseGradeFiltersReturn {
  // Filter state
  filters: GradeFilters;
  
  // Filter actions
  setYear: (year: string) => void;
  setSemester: (semester: string) => void;
  setCategory: (category: string) => void;
  resetFilters: () => void;
  
  // Computed data
  filteredGrades: Grade[];
  statistics: GradeStatistics;
  completedGrades: Grade[];
  
  // Filter options
  yearOptions: FilterOption[];
  semesterOptions: FilterOption[];
  categoryOptions: FilterOption[];
}

const getCurrentYear = (): string => {
  return new Date().getFullYear().toString();
};

const DEFAULT_FILTERS: GradeFilters = {
  selectedYear: getCurrentYear(),
  selectedSemester: 'all',
  selectedCategory: 'all'
};

export const useGradeFilters = (grades: Grade[]): UseGradeFiltersReturn => {
  // Filter state
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_FILTERS.selectedYear);
  const [selectedSemester, setSelectedSemester] = useState<string>(DEFAULT_FILTERS.selectedSemester);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_FILTERS.selectedCategory);

  // Filter actions
  const setYear = useCallback((year: string) => setSelectedYear(year), []);
  const setSemester = useCallback((semester: string) => setSelectedSemester(semester), []);
  const setCategory = useCallback((category: string) => setSelectedCategory(category), []);
  
  const resetFilters = useCallback(() => {
    setSelectedYear(DEFAULT_FILTERS.selectedYear);
    setSelectedSemester(DEFAULT_FILTERS.selectedSemester);
    setSelectedCategory(DEFAULT_FILTERS.selectedCategory);
  }, []);

  // Computed values
  const filteredGrades = useMemo(() => 
    filterGrades(grades, {
      year: selectedYear,
      semester: selectedSemester,
      category: selectedCategory
    }), 
    [grades, selectedYear, selectedSemester, selectedCategory]
  );

  const statistics = useMemo(() => 
    calculateStatistics(filteredGrades), 
    [filteredGrades]
  );

  const completedGrades = useMemo(() => 
    filteredGrades.filter(g => g.grade !== '履修中'), 
    [filteredGrades]
  );

  // Filter options (could be derived from data or configured)
  const yearOptions: FilterOption[] = useMemo(() => {
    const years = Array.from(new Set(grades.map(g => g.year.toString()))).sort().reverse();
    return [
      { value: 'all', label: 'すべての年度' },
      ...years.map(year => ({ value: year, label: `${year}年度` }))
    ];
  }, [grades]);

  const semesterOptions: FilterOption[] = [
    { value: 'all', label: 'すべての学期' },
    { value: '前期', label: '前期' },
    { value: '後期', label: '後期' },
    { value: '通年', label: '通年' }
  ];

  const categoryOptions: FilterOption[] = [
    { value: 'all', label: 'すべてのカテゴリ' },
    { value: '必修', label: '必修' },
    { value: '選択必修', label: '選択必修' },
    { value: '選択', label: '選択' },
    { value: '自由', label: '自由' }
  ];

  return {
    // Filter state
    filters: {
      selectedYear,
      selectedSemester,
      selectedCategory
    },
    
    // Filter actions
    setYear,
    setSemester,
    setCategory,
    resetFilters,
    
    // Computed data
    filteredGrades,
    statistics,
    completedGrades,
    
    // Filter options
    yearOptions,
    semesterOptions,
    categoryOptions
  };
};