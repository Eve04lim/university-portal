'use client';

import { Clock, Edit3, MapPin, Plus, User, X } from 'lucide-react';
import { useState } from 'react';

// 時間割データの型定義
interface TimetableItem {
  id: string;
  subject: string;
  professor: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 0: 日, 1: 月, 2: 火, 3: 水, 4: 木, 5: 金, 6: 土
  period: number; // 1-7時限
  color: string;
}

const TimetablePage = () => {
  const [selectedClass, setSelectedClass] = useState<TimetableItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // サンプル時間割データ
  const timetableData: TimetableItem[] = [
    {
      id: '1',
      subject: 'データベース論',
      professor: '田中教授',
      room: 'A302',
      startTime: '09:00',
      endTime: '10:30',
      dayOfWeek: 1, // 月曜日
      period: 1,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      subject: '統計学',
      professor: '佐藤教授',
      room: 'B201',
      startTime: '10:40',
      endTime: '12:10',
      dayOfWeek: 1, // 月曜日
      period: 2,
      color: 'bg-green-500'
    },
    {
      id: '3',
      subject: 'プログラミング演習',
      professor: '山田教授',
      room: 'PC室1',
      startTime: '13:00',
      endTime: '14:30',
      dayOfWeek: 1, // 月曜日
      period: 3,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      subject: '英語コミュニケーション',
      professor: 'Smith教授',
      room: 'C105',
      startTime: '14:40',
      endTime: '16:10',
      dayOfWeek: 1, // 月曜日
      period: 4,
      color: 'bg-orange-500'
    },
    {
      id: '5',
      subject: '線形代数',
      professor: '鈴木教授',
      room: 'D203',
      startTime: '09:00',
      endTime: '10:30',
      dayOfWeek: 2, // 火曜日
      period: 1,
      color: 'bg-red-500'
    },
    {
      id: '6',
      subject: 'ソフトウェア工学',
      professor: '高橋教授',
      room: 'E301',
      startTime: '13:00',
      endTime: '14:30',
      dayOfWeek: 3, // 水曜日
      period: 3,
      color: 'bg-indigo-500'
    },
    {
      id: '7',
      subject: '機械学習',
      professor: '井上教授',
      room: 'F402',
      startTime: '10:40',
      endTime: '12:10',
      dayOfWeek: 4, // 木曜日
      period: 2,
      color: 'bg-pink-500'
    },
    {
      id: '8',
      subject: '卒業研究',
      professor: '渡辺教授',
      room: '研究室A',
      startTime: '14:40',
      endTime: '17:50',
      dayOfWeek: 5, // 金曜日
      period: 4,
      color: 'bg-yellow-500'
    }
  ];

  // 曜日と時限の定義
  const daysOfWeek = ['月', '火', '水', '木', '金'];
  const periods = [
    { number: 1, time: '09:00-10:30' },
    { number: 2, time: '10:40-12:10' },
    { number: 3, time: '13:00-14:30' },
    { number: 4, time: '14:40-16:10' },
    { number: 5, time: '16:20-17:50' },
    { number: 6, time: '18:00-19:30' },
    { number: 7, time: '19:40-21:10' }
  ];

  // 特定の曜日・時限の授業を取得
  const getClassForSlot = (dayOfWeek: number, period: number) => {
    return timetableData.find(item => 
      item.dayOfWeek === dayOfWeek + 1 && item.period === period
    );
  };

  // 授業詳細を表示
  const handleClassClick = (classItem: TimetableItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">時間割</h1>
              <p className="text-gray-600">2024年度 前期</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={20} className="mr-2" />
              授業を追加
            </button>
          </div>
        </div>

        {/* 時間割テーブル */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                    時限
                  </th>
                  {daysOfWeek.map((day, index) => (
                    <th key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-l">
                      {day}曜日
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.number} className="border-b">
                    <td className="px-4 py-3 bg-gray-50 border-r">
                      <div className="text-sm font-medium text-gray-900">
                        {period.number}時限
                      </div>
                      <div className="text-xs text-gray-500">
                        {period.time}
                      </div>
                    </td>
                    {daysOfWeek.map((day, dayIndex) => {
                      const classItem = getClassForSlot(dayIndex, period.number);
                      return (
                        <td key={dayIndex} className="px-2 py-2 border-l h-24 align-top">
                          {classItem ? (
                            <button
                              onClick={() => handleClassClick(classItem)}
                              className={`w-full h-full ${classItem.color} text-white p-2 rounded-md hover:opacity-90 transition-opacity text-left`}
                            >
                              <div className="text-sm font-medium truncate">
                                {classItem.subject}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {classItem.room}
                              </div>
                            </button>
                          ) : (
                            <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer">
                              <Plus size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">履修単位数</h3>
            <div className="text-3xl font-bold text-blue-600">24単位</div>
            <p className="text-sm text-gray-600 mt-1">今学期の履修単位</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">授業数</h3>
            <div className="text-3xl font-bold text-green-600">{timetableData.length}科目</div>
            <p className="text-sm text-gray-600 mt-1">履修中の科目数</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">空きコマ</h3>
            <div className="text-3xl font-bold text-orange-600">7コマ</div>
            <p className="text-sm text-gray-600 mt-1">今週の空きコマ数</p>
          </div>
        </div>
      </div>

      {/* 授業詳細モーダル */}
      {isModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">授業詳細</h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`${selectedClass.color} text-white p-4 rounded-lg`}>
                  <h3 className="text-lg font-bold">{selectedClass.subject}</h3>
                  <p className="opacity-90">{selectedClass.professor}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Clock size={18} className="mr-3 text-gray-500" />
                    <div>
                      <div className="font-medium">
                        {daysOfWeek[selectedClass.dayOfWeek - 1]}曜日 {selectedClass.period}時限
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedClass.startTime} - {selectedClass.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <MapPin size={18} className="mr-3 text-gray-500" />
                    <div>
                      <div className="font-medium">教室</div>
                      <div className="text-sm text-gray-600">{selectedClass.room}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <User size={18} className="mr-3 text-gray-500" />
                    <div>
                      <div className="font-medium">担当教員</div>
                      <div className="text-sm text-gray-600">{selectedClass.professor}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">授業情報</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>単位数: 2単位</p>
                    <p>授業形態: 講義</p>
                    <p>評価方法: 期末試験(60%) + レポート(40%)</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit3 size={16} className="mr-2" />
                    編集
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                    シラバス
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

export default TimetablePage;