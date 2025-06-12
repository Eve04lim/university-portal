'use client';

import { ResponsiveModal } from '../../ui';
import { Grade } from '../types';
import { getGradeColor, getCategoryColor } from '../utils';

interface GradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGrade: Grade | null;
}

const GradeDetailModal = ({ isOpen, onClose, selectedGrade }: GradeDetailModalProps) => {
  if (!selectedGrade) return null;

  const scoreItems = [
    { label: '試験', score: selectedGrade.examScore, color: 'bg-blue-500' },
    { label: 'レポート', score: selectedGrade.reportScore, color: 'bg-green-500' },
    { label: '出席', score: selectedGrade.attendanceScore, color: 'bg-purple-500' }
  ].filter(item => item.score !== undefined);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="成績詳細"
      size="lg"
    >
      <div className="space-y-6">
        {/* 基本情報 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">基本情報</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">科目名</label>
              <p className="text-base font-medium text-gray-900">{selectedGrade.subjectName}</p>
              <p className="text-sm text-gray-500">{selectedGrade.subjectCode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">担当教員</label>
              <p className="text-base text-gray-900">{selectedGrade.professor}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">学期</label>
              <p className="text-base text-gray-900">{selectedGrade.year}年 {selectedGrade.semester}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">単位数</label>
              <p className="text-base text-gray-900">{selectedGrade.credits}単位</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">カテゴリ</label>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedGrade.category)}`}>
                {selectedGrade.category}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">学科</label>
              <p className="text-base text-gray-900">{selectedGrade.department}</p>
            </div>
          </div>
        </div>

        {/* 成績情報 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">成績情報</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">最終成績</label>
              <span className={`inline-block px-3 py-1 text-lg font-bold rounded-full ${getGradeColor(selectedGrade.grade)}`}>
                {selectedGrade.grade}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">GPA</label>
              <p className="text-xl font-bold text-gray-900">
                {selectedGrade.grade !== '履修中' ? selectedGrade.gpa.toFixed(1) : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">最終点数</label>
              <p className="text-xl font-bold text-gray-900">
                {selectedGrade.grade !== '履修中' ? `${selectedGrade.finalScore}点` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 点数内訳 */}
        {selectedGrade.grade !== '履修中' && scoreItems.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">点数内訳</h3>
            <div className="space-y-3">
              {scoreItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-sm font-medium text-gray-600">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className={`${item.color} h-6 rounded-full transition-all duration-300`}
                      style={{ width: `${item.score}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {item.score}点
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedGrade.grade === '履修中' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              この科目は現在履修中です。成績が確定次第、詳細情報が表示されます。
            </p>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};

export default GradeDetailModal;