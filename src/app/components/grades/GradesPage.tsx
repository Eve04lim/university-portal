'use client';

import { Award, BarChart3, BookOpen, Calendar, Download, Eye, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">成績確認</h1>
              <p className="text-gray-600">あなたの学習成果を確認できます</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {viewMode === 'table' ? <BarChart3 size={16} className="mr-2" /> : <BookOpen size={16} className="mr-2" />}
                {viewMode === 'table' ? 'グラフ表示' : 'テーブル表示'}
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download size={16} className="mr-2" />
                成績表出力
              </button>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">通算GPA</h3>
                <div className="text-3xl font-bold text-blue-600">{overallGPA.toFixed(2)}</div>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">取得単位数</h3>
                <div className="text-3xl font-bold text-green-600">{totalCredits}</div>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">履修科目数</h3>
                <div className="text-3xl font-bold text-purple-600">{completedGrades.length}</div>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">平均点</h3>
                <div className="text-3xl font-bold text-orange-600">
                  {completedGrades.length > 0 
                    ? (completedGrades.reduce((sum, g) => sum + g.finalScore, 0) / completedGrades.length).toFixed(1)
                    : 0}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべての年度</option>
              {years.map(year => (
                <option key={year} value={year}>{year}年度</option>
              ))}
            </select>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべての学期</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべてのカテゴリ</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {viewMode === 'table' ? (
          /* 成績テーブル */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">科目</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当教員</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単位</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成績</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{grade.subjectName}</div>
                          <div className="text-sm text-gray-500">{grade.subjectCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.professor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.year}年 {grade.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(grade.category)}`}>
                          {grade.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.grade !== '履修中' ? grade.gpa.toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.grade !== '履修中' ? grade.finalScore : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => handleGradeClick(grade)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* チャート表示 */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 成績分布 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
            </div>

            {/* GPA推移 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
            </div>
          </div>
        )}
      </div>

      {/* 成績詳細モーダル */}
      {isModalOpen && selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">成績詳細</h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
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

                <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    詳細レポート
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                    成績証明書
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPage;