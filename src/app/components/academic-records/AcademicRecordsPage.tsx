'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Filter, 
  Search,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid, Button, Input, Select } from '../ui';
import { AcademicRecord, CourseRegistration } from '../../../lib/types';
import { AcademicRecordsService } from '../../../services/academicRecordsService';
import { useAppStore } from '../../../store/useAppStore';
import GradeChart from './components/GradeChart';
import GPAChart from './components/GPAChart';
import TranscriptTable from './components/TranscriptTable';
import AcademicSummary from './components/AcademicSummary';
import GraduationProgressCard from './components/GraduationProgressCard';
import AcademicRecordsFiltersPanel from './components/AcademicRecordsFiltersPanel';

const AcademicRecordsPage: React.FC = () => {
  const { 
    academicRecord, 
    setAcademicRecord, 
    registrations,
    setLoading, 
    filters,
    updateAcademicRecordsFilter 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'progress' | 'analytics'>('overview');

  // 学術記録データを取得
  useEffect(() => {
    const loadAcademicRecord = async () => {
      setLoading('academicRecord', true);
      try {
        const record = await AcademicRecordsService.getAcademicRecord('student-1');
        if (record) {
          setAcademicRecord(record);
        }
      } catch (error) {
        console.error('学術記録取得エラー:', error);
      } finally {
        setLoading('academicRecord', false);
      }
    };

    if (!academicRecord) {
      loadAcademicRecord();
    }
  }, [academicRecord, setAcademicRecord, setLoading]);

  // フィルター済み成績データ
  const filteredGrades = useMemo(() => {
    if (!academicRecord) return [];
    
    let filtered = [...academicRecord.courseGrades];

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(grade =>
        grade.courseName.toLowerCase().includes(query) ||
        grade.courseCode.toLowerCase().includes(query)
      );
    }

    // 年度フィルター
    if (filters.academicRecords.academicYear.length > 0) {
      filtered = filtered.filter(grade => 
        filters.academicRecords.academicYear.includes(grade.academicYear.toString())
      );
    }

    // 学期フィルター
    if (filters.academicRecords.semester.length > 0) {
      filtered = filtered.filter(grade => 
        filters.academicRecords.semester.includes(grade.semester)
      );
    }

    // カテゴリフィルター
    if (filters.academicRecords.category.length > 0) {
      filtered = filtered.filter(grade => 
        grade.category && filters.academicRecords.category.includes(grade.category)
      );
    }

    // 成績範囲フィルター
    if (filters.academicRecords.gradeRange.length > 0) {
      filtered = filtered.filter(grade => {
        const gradePoints = getGradePoints(grade.grade);
        return filters.academicRecords.gradeRange.some(range => {
          switch (range) {
            case 'A': return gradePoints >= 4.0;
            case 'B': return gradePoints >= 3.0 && gradePoints < 4.0;
            case 'C': return gradePoints >= 2.0 && gradePoints < 3.0;
            case 'D': return gradePoints >= 1.0 && gradePoints < 2.0;
            case 'F': return gradePoints < 1.0;
            default: return false;
          }
        });
      });
    }

    // GPA範囲フィルター
    const [minGPA, maxGPA] = filters.academicRecords.gpaRange;
    filtered = filtered.filter(grade => 
      grade.gradePoints >= minGPA && grade.gradePoints <= maxGPA
    );

    return filtered;
  }, [academicRecord, searchQuery, filters.academicRecords]);

  const getGradePoints = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0,
      'F': 0.0
    };
    return gradeMap[grade] || 0.0;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    updateAcademicRecordsFilter({
      academicYear: [],
      semester: [],
      category: [],
      gradeRange: [],
      gpaRange: [0, 4],
    });
  };

  const handleExportTranscript = async () => {
    try {
      if (academicRecord) {
        await AcademicRecordsService.exportTranscript(academicRecord.studentId);
        alert('成績証明書の生成を開始しました');
      }
    } catch (error) {
      console.error('成績証明書エクスポートエラー:', error);
      alert('成績証明書の生成に失敗しました');
    }
  };

  const tabs = [
    { id: 'overview', label: '概要', icon: BarChart3 },
    { id: 'transcript', label: '成績一覧', icon: FileText },
    { id: 'progress', label: '卒業要件', icon: Target },
    { id: 'analytics', label: '分析', icon: PieChart },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">学術記録</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              成績・学習履歴の確認と分析ができます
            </p>
          </div>
          
          <Button
            onClick={handleExportTranscript}
            className="flex items-center gap-2 sm:w-auto"
          >
            <Download size={16} />
            成績証明書出力
          </Button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 検索・フィルターバー */}
        {(activeTab === 'transcript' || activeTab === 'analytics') && (
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
        )}

        {/* アクティブフィルター表示 */}
        {(activeTab === 'transcript' || activeTab === 'analytics') && 
         (searchQuery || filters.academicRecords.academicYear.length > 0 || 
          filters.academicRecords.semester.length > 0 || filters.academicRecords.category.length > 0 ||
          filters.academicRecords.gradeRange.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">アクティブフィルター:</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                検索: {searchQuery}
              </span>
            )}
            {filters.academicRecords.academicYear.map(year => (
              <span key={year} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {year}年度
              </span>
            ))}
            {filters.academicRecords.semester.map(semester => (
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
      </div>

      <div className="flex gap-6">
        {/* フィルターパネル */}
        {showFilters && (activeTab === 'transcript' || activeTab === 'analytics') && (
          <div className="w-80 flex-shrink-0">
            <AcademicRecordsFiltersPanel />
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="flex-1">
          {activeTab === 'overview' && academicRecord && (
            <div className="space-y-6">
              <AcademicSummary academicRecord={academicRecord} />
              <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
                <GradeChart grades={academicRecord.courseGrades} />
                <GPAChart semesterGPAs={academicRecord.semesterGPAs} />
              </ResponsiveGrid>
            </div>
          )}

          {activeTab === 'transcript' && (
            <TranscriptTable 
              grades={filteredGrades} 
              academicRecord={academicRecord}
            />
          )}

          {activeTab === 'progress' && academicRecord && (
            <GraduationProgressCard 
              academicRecord={academicRecord}
              registrations={registrations}
            />
          )}

          {activeTab === 'analytics' && academicRecord && (
            <div className="space-y-6">
              <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
                <GradeChart grades={filteredGrades} />
                <GPAChart semesterGPAs={academicRecord.semesterGPAs} />
              </ResponsiveGrid>
              
              {/* 詳細分析コンテンツ */}
              <ResponsiveCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">成績分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {academicRecord.overallGPA.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">累積GPA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {academicRecord.totalCreditsEarned}
                    </div>
                    <div className="text-sm text-gray-600">取得単位数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {filteredGrades.length}
                    </div>
                    <div className="text-sm text-gray-600">履修科目数</div>
                  </div>
                </div>
              </ResponsiveCard>
            </div>
          )}

          {!academicRecord && (
            <ResponsiveCard className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">学術記録が見つかりません</h3>
              <p className="text-gray-600">
                学術記録データの読み込み中、またはデータが存在しません
              </p>
            </ResponsiveCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicRecordsPage;