'use client';

import { BookOpen, Clock, Edit3, MapPin, Plus, Star, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { Button, Input, ResponsiveCard, ResponsiveGrid, ResponsiveModal, Select } from '../ui/ResponsiveComponents';

// 履修科目データの型定義
interface Subject {
  id: string;
  name: string;
  code: string;
  professor: string;
  credits: number;
  semester: 'spring' | 'fall' | 'intensive';
  category: '必修' | '選択必修' | '選択' | '自由';
  department: string;
  grade: number; // 対象学年
  dayOfWeek: number;
  period: number;
  room: string;
  maxStudents: number;
  currentStudents: number;
  description: string;
  status: 'enrolled' | 'available' | 'waitlist' | 'completed';
  rating: number; // 1-5
}

const SubjectsPage = () => {
  const [selectedTab, setSelectedTab] = useState<'enrolled' | 'available' | 'completed'>('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // サンプル履修科目データ
  const subjectsData: Subject[] = [
    {
      id: '1',
      name: 'データベース論',
      code: 'CS301',
      professor: '田中教授',
      credits: 2,
      semester: 'spring',
      category: '必修',
      department: '情報科学科',
      grade: 3,
      dayOfWeek: 1,
      period: 1,
      room: 'A302',
      maxStudents: 100,
      currentStudents: 85,
      description: 'データベースの基本概念から設計、実装まで幅広く学習します。SQLの基礎から応用まで実践的に学べます。',
      status: 'enrolled',
      rating: 4.2
    },
    {
      id: '2',
      name: '統計学',
      code: 'MATH201',
      professor: '佐藤教授',
      credits: 2,
      semester: 'spring',
      category: '選択必修',
      department: '数学科',
      grade: 2,
      dayOfWeek: 1,
      period: 2,
      room: 'B201',
      maxStudents: 80,
      currentStudents: 72,
      description: '統計学の基礎理論から実用的な統計解析手法まで学習します。',
      status: 'enrolled',
      rating: 3.8
    },
    {
      id: '3',
      name: 'プログラミング演習',
      code: 'CS201',
      professor: '山田教授',
      credits: 3,
      semester: 'spring',
      category: '必修',
      department: '情報科学科',
      grade: 2,
      dayOfWeek: 1,
      period: 3,
      room: 'PC室1',
      maxStudents: 40,
      currentStudents: 38,
      description: 'Java言語を使用したプログラミングの実践的演習を行います。',
      status: 'enrolled',
      rating: 4.5
    },
    {
      id: '4',
      name: '機械学習',
      code: 'CS401',
      professor: '井上教授',
      credits: 3,
      semester: 'spring',
      category: '選択',
      department: '情報科学科',
      grade: 4,
      dayOfWeek: 4,
      period: 2,
      room: 'F402',
      maxStudents: 60,
      currentStudents: 45,
      description: '機械学習の基礎理論から実装まで、PythonとTensorFlowを使用して学習します。',
      status: 'available',
      rating: 4.7
    },
    {
      id: '5',
      name: 'ソフトウェア工学',
      code: 'CS302',
      professor: '高橋教授',
      credits: 2,
      semester: 'spring',
      category: '選択必修',
      department: '情報科学科',
      grade: 3,
      dayOfWeek: 3,
      period: 3,
      room: 'E301',
      maxStudents: 70,
      currentStudents: 68,
      description: 'ソフトウェア開発のライフサイクル、設計パターン、プロジェクト管理について学習します。',
      status: 'available',
      rating: 4.0
    },
    {
      id: '6',
      name: '線形代数',
      code: 'MATH101',
      professor: '鈴木教授',
      credits: 2,
      semester: 'fall',
      category: '必修',
      department: '数学科',
      grade: 1,
      dayOfWeek: 2,
      period: 1,
      room: 'D203',
      maxStudents: 120,
      currentStudents: 115,
      description: 'ベクトル空間、行列、固有値など線形代数の基礎理論を学習します。',
      status: 'completed',
      rating: 3.9
    }
  ];

  const categories = ['必修', '選択必修', '選択', '自由'];
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリ' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  // フィルタリング
  const filteredSubjects = subjectsData.filter(subject => {
    if (subject.status !== selectedTab) return false;
    if (searchQuery && !subject.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !subject.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !subject.professor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && subject.category !== selectedCategory) return false;
    return true;
  });

  // 統計情報の計算
  const enrolledSubjects = subjectsData.filter(s => s.status === 'enrolled');
  const totalCredits = enrolledSubjects.reduce((sum, subject) => sum + subject.credits, 0);
  const averageRating = enrolledSubjects.length > 0 
    ? enrolledSubjects.reduce((sum, subject) => sum + subject.rating, 0) / enrolledSubjects.length 
    : 0;

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">履修中</span>;
      case 'available':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">履修可能</span>;
      case 'waitlist':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">待機中</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">履修済み</span>;
      default:
        return null;
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

  const tabs = [
    { key: 'enrolled', label: '履修中', count: subjectsData.filter(s => s.status === 'enrolled').length },
    { key: 'available', label: '履修可能', count: subjectsData.filter(s => s.status === 'available').length },
    { key: 'completed', label: '履修済み', count: subjectsData.filter(s => s.status === 'completed').length }
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">履修科目管理</h1>
        <p className="text-gray-600 text-sm sm:text-base">2024年度の履修科目を管理できます</p>
      </div>

      {/* 統計情報 */}
      <ResponsiveGrid cols={{ default: 2, md: 4 }} gap={4}>
        <ResponsiveCard className="p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">履修単位数</h3>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalCredits}単位</div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">履修科目数</h3>
          <div className="text-xl sm:text-2xl font-bold text-green-600">{enrolledSubjects.length}科目</div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">平均評価</h3>
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
        </ResponsiveCard>
        <ResponsiveCard className="p-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">履修上限</h3>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">20単位</div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* タブとフィルター */}
      <ResponsiveCard className="p-4 sm:p-6">
        {/* タブ */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-target ${
                selectedTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">{tab.label} ({tab.count})</span>
              <span className="sm:hidden">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 検索とフィルター */}
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="科目名、科目コード、教員名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categoryOptions}
              />
            </div>
            {selectedTab === 'available' && (
              <Button variant="primary" className="sm:w-auto">
                <Plus size={16} className="mr-2" />
                科目を追加
              </Button>
            )}
          </div>
        </div>
      </ResponsiveCard>

      {/* 科目リスト */}
      <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
        {filteredSubjects.map((subject) => (
          <ResponsiveCard key={subject.id} hover clickable onClick={() => handleSubjectClick(subject)} className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{subject.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(subject.category)}`}>
                    {subject.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{subject.code} | {subject.professor}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Star size={14} />
                    {subject.credits}単位
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {daysOfWeek[subject.dayOfWeek]}{subject.period}限
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {subject.room}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                {getStatusBadge(subject.status)}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{subject.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-gray-600">{subject.rating}</span>
                </div>
                <div className="text-gray-500">
                  {subject.currentStudents}/{subject.maxStudents}人
                </div>
              </div>
              <div className="flex gap-2">
                {subject.status === 'enrolled' && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-target"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                {subject.status === 'available' && (
                  <Button 
                    size="sm"
                    variant="primary"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    履修登録
                  </Button>
                )}
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">科目が見つかりません</h3>
          <p className="text-gray-600">検索条件を変更してみてください。</p>
        </div>
      )}

      {/* 科目詳細モーダル */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="科目詳細"
        size="lg"
      >
        {selectedSubject && (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{selectedSubject.name}</h3>
                <span className={`px-2 py-1 text-sm font-medium rounded ${getCategoryColor(selectedSubject.category)}`}>
                  {selectedSubject.category}
                </span>
                {getStatusBadge(selectedSubject.status)}
              </div>
              <p className="text-gray-600 mb-4">{selectedSubject.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">科目コード</div>
                    <div className="text-sm text-gray-600">{selectedSubject.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">担当教員</div>
                    <div className="text-sm text-gray-600">{selectedSubject.professor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">開講時間</div>
                    <div className="text-sm text-gray-600">
                      {daysOfWeek[selectedSubject.dayOfWeek]}曜日 {selectedSubject.period}時限
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">教室</div>
                    <div className="text-sm text-gray-600">{selectedSubject.room}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star size={18} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">単位数</div>
                    <div className="text-sm text-gray-600">{selectedSubject.credits}単位</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[18px] h-[18px] bg-gray-500 rounded text-white text-xs flex items-center justify-center flex-shrink-0">
                    #
                  </div>
                  <div>
                    <div className="font-medium">履修者数</div>
                    <div className="text-sm text-gray-600">
                      {selectedSubject.currentStudents}/{selectedSubject.maxStudents}人
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">授業情報</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>学期: {selectedSubject.semester === 'spring' ? '前期' : selectedSubject.semester === 'fall' ? '後期' : '集中'}</p>
                <p>対象学年: {selectedSubject.grade}年生以上</p>
                <p>所属学科: {selectedSubject.department}</p>
                <p>評価: ★{selectedSubject.rating}/5.0</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {selectedSubject.status === 'available' && (
                <Button fullWidth variant="primary">
                  履修登録
                </Button>
              )}
              {selectedSubject.status === 'enrolled' && (
                <>
                  <Button fullWidth variant="primary">
                    編集
                  </Button>
                  <Button fullWidth variant="danger">
                    履修取消
                  </Button>
                </>
              )}
              <Button fullWidth variant="secondary">
                シラバス
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
};

export default SubjectsPage;