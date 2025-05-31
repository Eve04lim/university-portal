'use client';

import { Award, BarChart3, BookOpen, Calendar, Download, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button, ResponsiveCard, ResponsiveGrid, ResponsiveModal, ResponsiveTable, Select } from '../ui/ResponsiveComponents';

// 成績データの型定義
interface Grade {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  professor: string;
  credits: number;
  semester: string;
  year: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' | '履修中';
  gpa: number;
  category: '必修' | '選択必修' | '選択' | '自由';
  department: string;
  examScore?: number;
  reportScore?: number;
  attendanceScore?: number;
  finalScore: number;
}

// 学期別GPAデータ
interface SemesterGPA {
  semester: string;
  year: number;
  gpa: number;
  credits: number;
}

const GradesPage = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  // サンプル成績データ
  const gradesData: Grade[] = [
    {
      id: '1',
      subjectId: 'cs301',
      subjectName: 'データベース論',
      subjectCode: 'CS301',
      professor: '田中教授',
      credits: 2,
      semester: '前期',
      year: 2024,
      grade: 'A',
      gpa: 4.0,
      category: '必修',
      department: '情報科学科',
      examScore: 85,
      reportScore: 90,
      attendanceScore: 95,
      finalScore: 88
    },
    {
      id: '2',
      subjectId: 'math201',
      subjectName: '統計学',
      subjectCode: 'MATH201',
      professor: '佐藤教授',
      credits: 2,
      semester: '前期',
      year: 2024,
      grade: 'B+',
      gpa: 3.5,
      category: '選択必修',
      department: '数学科',
      examScore: 78,
      reportScore: 82,
      attendanceScore: 90,
      finalScore: 80
    },
    {
      id: '3',
      subjectId: 'cs201',
      subjectName: 'プログラミング演習',
      subjectCode: 'CS201',
      professor: '山田教授',
      credits: 3,
      semester: '前期',
      year: 2024,
      grade: '履修中',
      gpa: 0,
      category: '必修',
      department: '情報科学科',
      finalScore: 0
    },
    {
      id: '4',
      subjectId: 'cs401',
      subjectName: '機械学習',
      subjectCode: 'CS401',
      professor: '井上教授',
      credits: 3,
      semester: '後期',
      year: 2023,
      grade: 'A+',
      gpa: 4.5,
      category: '選択',
      department: '情報科学科',
      examScore: 95,
      reportScore: 88,
      attendanceScore: 100,
      finalScore: 92
    },
    {
      id: '5',
      subjectId: 'math101',
      subjectName: '線形代数',
      subjectCode: 'MATH101',
      professor: '鈴木教授',
      credits: 2,
      semester: '前期',
      year: 2023,
      grade: 'B',
      gpa: 3.0,
      category: '必修',
      department: '数学科',
      examScore: 72,
      reportScore: 75,
      attendanceScore: 85,
      finalScore: 74
    },
    {
      id: '6',
      subjectId: 'cs302',
      subjectName: 'ソフトウェア工学',
      subjectCode: 'CS302',
      professor: '高橋教授',
      credits: 2,
      semester: '後期',
      year: 2023,
      grade: 'A',
      gpa: 4.0,
      category: '選択必修',
      department: '情報科学科',
      examScore: 88,
      reportScore: 85,
      attendanceScore: 95,
      finalScore: 87
    }
  ];

  // 学期別GPAデータ
  const semesterGPAData: SemesterGPA[] = [
    { semester: '2023前期', year: 2023, gpa: 3.25, credits: 4 },
    { semester: '2023後期', year: 2023, gpa: 3.75, credits: 5 },
    { semester: '2024前期', year: 2024, gpa: 3.75, credits: 4 },
  ];

  const years = ['2024', '2023', '2022'];
  const semesters = ['前期', '後期'];
  const categories = ['必修', '選択必修', '選択', '自由'];

  const yearOptions = [
    { value: 'all', label: 'すべての年度' },
    ...years.map(year => ({ value: year, label: `${year}年度` }))
  ];

  const semesterOptions = [
    { value: 'all', label: 'すべての学期' },
    ...semesters.map(semester => ({ value: semester, label: semester }))
  ];

  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリ' },
    ...categories.map(category => ({ value: category, label: category }))
  ];

  // フィルタリング
  const filteredGrades = gradesData.filter(grade => {
    if (selectedYear !== 'all' && grade.year.toString() !== selectedYear) return false;
    if (selectedSemester !== 'all' && grade.semester !== selectedSemester) return false;
    if (selectedCategory !== 'all' && grade.category !== selectedCategory) return false;
    return true;
  });

  // 統計計算
  const completedGrades = filteredGrades.filter(g => g.grade !== '履修中');
  const totalCredits = completedGrades.reduce((sum, grade) => sum + grade.credits, 0);
  const totalGradePoints = completedGrades.reduce((sum, grade) => sum + (grade.gpa * grade.credits), 0);
  const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  // 成績分布
  const gradeDistribution = {
    'A+': completedGrades.filter(g => g.grade === 'A+').length,
    'A': completedGrades.filter(g => g.grade === 'A').length,
    'B+': completedGrades.filter(g => g.grade === 'B+').length,
    'B': completedGrades.filter(g => g.grade === 'B').length,
    'C+': completedGrades.filter(g => g.grade === 'C+').length,
    'C': completedGrades.filter(g => g.grade === 'C').length,
    'D': completedGrades.filter(g => g.grade === 'D').length,
    'F': completedGrades.filter(g => g.grade === 'F').length,
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-purple-600 bg-purple-50';
      case 'A': return 'text-blue-600 bg-blue-50';
      case 'B+': return 'text-green-600 bg-green-50';
      case 'B': return 'text-green-500 bg-green-50';
      case 'C+': return 'text-yellow-600 bg-yellow-50';
      case 'C': return 'text-yellow-500 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'F': return 'text-red-600 bg-red-50';
      case '履修中': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '必修': return 'text-red-600 bg-red-50';
      case '選択必修': return 'text-orange-600 bg-orange-50';
      case '選択': return 'text-blue-600 bg-blue-50';
      case '自由': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleGradeClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGrade(null);
  };

  // テーブル用のカラム定義
  const tableColumns = [
    {
      key: 'subjectName',
      label: '科目',
      render: (value: string, row: Grade) => (
        <div>
          <div className="font-medium text-gray-900">{row.subjectName}</div>
          <div className="text-sm text-gray-500">{row.subjectCode}</div>
        </div>
      )
    },
    {
      key: 'professor',
      label: '担当教員',
      hideOnMobile: true
    },
    {
      key: 'semester',
      label: '学期',
      render: (value: string, row: Grade) => `${row.year}年 ${row.semester}`
    },
    {
      key: 'credits',
      label: '単位',
    },
    {
      key: 'category',
      label: 'カテゴリ',
      hideOnMobile: true,
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'grade',
      label: '成績',
      render: (value: string) => (
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'gpa',
      label: 'GPA',
      render: (value: number, row: Grade) => 
        row.grade !== '履修中' ? value.toFixed(1) : '-'
    },
    {
      key: 'finalScore',
      label: '点数',
      hideOnMobile: true,
      render: (value: number, row: Grade) => 
        row.grade !== '履修中' ? value.toString() : '-'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">成績確認</h1>
          <p className="text-gray-600 text-sm sm:text-base">あなたの学習成果を確認できます</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="primary"
            onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
          >
            {viewMode === 'table' ? <BarChart3 size={16} className="mr-2" /> : <BookOpen size={16} className="mr-2" />}
            {viewMode === 'table' ? 'グラフ表示' : 'テーブル表示'}
          </Button>
          <Button variant="secondary">
            <Download size={16} className="mr-2" />
            <span className="hidden sm:inline">成績表出力</span>
            <span className="sm:hidden">出力</span>
          </Button>
        </div>
      </div>

      {/* 統計情報 */}
      <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={4}>
        <ResponsiveCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">通算GPA</h3>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{overallGPA.toFixed(2)}</div>
            </div>
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">取得単位数</h3>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{totalCredits}</div>
            </div>
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">履修科目数</h3>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{completedGrades.length}</div>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">平均点</h3>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {completedGrades.length > 0 
                  ? (completedGrades.reduce((sum, g) => sum + g.finalScore, 0) / completedGrades.length).toFixed(1)
                  : 0}
              </div>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* フィルター */}
      <ResponsiveCard className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={yearOptions}
          />
          <Select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            options={semesterOptions}
          />
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
          />
        </div>
      </ResponsiveCard>

      {viewMode === 'table' ? (
        /* 成績テーブル */
        <ResponsiveCard className="overflow-hidden">
          <ResponsiveTable
            columns={tableColumns}
            data={filteredGrades}
            onRowClick={handleGradeClick}
            emptyMessage="条件に一致する成績がありません"
          />
        </ResponsiveCard>
      ) : (
        /* チャート表示 */
        <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
          {/* 成績分布 */}
          <ResponsiveCard className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">成績分布</h3>
            <div className="space-y-3">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                count > 0 && (
                  <div key={grade} className="flex items-center">
                    <div className={`w-12 text-center py-1 text-sm font-medium rounded ${getGradeColor(grade)}`}>
                      {grade}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full"
                          style={{ width: `${(count / completedGrades.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-12 text-right">
                      {count}科目
                    </div>
                  </div>
                )
              ))}
            </div>
          </ResponsiveCard>

          {/* GPA推移 */}
          <ResponsiveCard className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GPA推移</h3>
            <div className="space-y-4">
              {semesterGPAData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{data.semester}</div>
                    <div className="text-sm text-gray-600">{data.credits}単位</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{data.gpa.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">GPA</div>
                  </div>
                </div>
              ))}
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>
      )}

      {/* 成績詳細モーダル */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="成績詳細"
        size="lg"
      >
        {selectedGrade && (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{selectedGrade.subjectName}</h3>
                <span className={`px-2 py-1 text-sm font-medium rounded ${getCategoryColor(selectedGrade.category)}`}>
                  {selectedGrade.category}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(selectedGrade.grade)}`}>
                  {selectedGrade.grade}
                </span>
              </div>
              <p className="text-gray-600">{selectedGrade.subjectCode} | {selectedGrade.professor}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">学期</div>
                  <div className="text-lg text-gray-900">{selectedGrade.year}年 {selectedGrade.semester}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">単位数</div>
                  <div className="text-lg text-gray-900">{selectedGrade.credits}単位</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">GPA</div>
                  <div className="text-lg text-gray-900">{selectedGrade.grade !== '履修中' ? selectedGrade.gpa.toFixed(1) : '未確定'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">最終点数</div>
                  <div className="text-lg text-gray-900">{selectedGrade.grade !== '履修中' ? selectedGrade.finalScore : '未確定'}点</div>
                </div>
              </div>
            </div>

            {selectedGrade.grade !== '履修中' && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">詳細評価</h4>
                <ResponsiveGrid cols={{ default: 1, sm: 3 }} gap={4}>
                  {selectedGrade.examScore && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedGrade.examScore}</div>
                      <div className="text-sm text-gray-600">試験</div>
                    </div>
                  )}
                  {selectedGrade.reportScore && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedGrade.reportScore}</div>
                      <div className="text-sm text-gray-600">レポート</div>
                    </div>
                  )}
                  {selectedGrade.attendanceScore && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedGrade.attendanceScore}</div>
                      <div className="text-sm text-gray-600">出席</div>
                    </div>
                  )}
                </ResponsiveGrid>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button fullWidth variant="primary">
                詳細レポート
              </Button>
              <Button fullWidth variant="secondary">
                成績証明書
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
};

export default GradesPage;