'use client';

import { Clock, Edit3, MapPin, Plus, User } from 'lucide-react';
import { ResponsiveCard, ResponsiveGrid, ResponsiveModal } from '../ui';

// Custom hooks
import { useTimetableView, type TimetableItem } from '../../../hooks/useTimetableView';
import { useTimetableEvents } from '../../../hooks/useTimetableEvents';
import { useTimetableResponsive } from '../../../hooks/useTimetableResponsive';

const TimetablePage = () => {
  // サンプル時間割データ
  const initialTimetableData: TimetableItem[] = [
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

  // Custom hooks
  const timetableView = useTimetableView();
  const timetableEvents = useTimetableEvents(initialTimetableData);
  const timetableResponsive = useTimetableResponsive(
    timetableEvents.timetableData,
    timetableView.periods,
    timetableView.daysOfWeek
  );
  
  // Extract frequently used data and functions
  const { periods, daysOfWeek } = timetableView;
  const { timetableData, getClassForSlot, statistics } = timetableEvents;
  const { handleClassClick, modal, closeModal } = timetableResponsive;
  const { selectedClass, isModalOpen } = modal;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">時間割</h1>
          <p className="text-gray-600 text-sm sm:text-base">2024年度 前期</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target">
          <Plus size={20} className="mr-2" />
          <span className="text-sm sm:text-base">授業を追加</span>
        </button>
      </div>

      {/* デスクトップ用時間割テーブル */}
      <div className="hidden md:block">
        <ResponsiveCard className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                    時限
                  </th>
                  {daysOfWeek.map((day) => (
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
                              className={`w-full h-full ${classItem.color} text-white p-2 rounded-md hover:opacity-90 transition-opacity text-left touch-target`}
                            >
                              <div className="text-sm font-medium truncate">
                                {classItem.subject}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {classItem.room}
                              </div>
                            </button>
                          ) : (
                            <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer touch-target">
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
        </ResponsiveCard>
      </div>

      {/* モバイル用時間割（曜日別） */}
      <div className="md:hidden space-y-4">
        {daysOfWeek.map((day, dayIndex) => {
          const dayClasses = timetableResponsive.getDayClasses(dayIndex, timetableData);

          return (
            <ResponsiveCard key={day} className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  {day}
                </span>
                {day}曜日
              </h3>
              {dayClasses.length > 0 ? (
                <div className="space-y-2">
                  {dayClasses.map(({ period, class: classItem }) => (
                    <button
                      key={`${dayIndex}-${period.number}`}
                      onClick={() => classItem && handleClassClick(classItem)}
                      className={`w-full p-3 rounded-lg text-left transition-all hover:shadow-sm ${classItem?.color} text-white`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{classItem?.subject}</span>
                        <span className="text-xs opacity-90">{period.number}時限</span>
                      </div>
                      <div className="text-xs opacity-90 mb-1">{period.time}</div>
                      <div className="text-xs opacity-90">{classItem?.room} | {classItem?.professor}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">授業がありません</p>
                </div>
              )}
            </ResponsiveCard>
          );
        })}
      </div>

      {/* 統計情報 */}
      <ResponsiveGrid cols={{ default: 1, sm: 3 }} gap={4}>
        <ResponsiveCard className="p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">履修単位数</h3>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{statistics.totalCredits}単位</div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">今学期の履修単位</p>
        </ResponsiveCard>
        <ResponsiveCard className="p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">授業数</h3>
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{statistics.subjectCount}科目</div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">履修中の科目数</p>
        </ResponsiveCard>
        <ResponsiveCard className="p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">空きコマ</h3>
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">{statistics.emptySlots}コマ</div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">今週の空きコマ数</p>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* 授業詳細モーダル */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="授業詳細"
        size="md"
      >
        {selectedClass && (
          <div className="p-6 space-y-6">
            <div className={`${selectedClass.color} text-white p-4 rounded-lg`}>
              <h3 className="text-lg font-bold">{selectedClass.subject}</h3>
              <p className="opacity-90">{selectedClass.professor}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Clock size={18} className="mr-3 text-gray-500 flex-shrink-0" />
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
                <MapPin size={18} className="mr-3 text-gray-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">教室</div>
                  <div className="text-sm text-gray-600">{selectedClass.room}</div>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <User size={18} className="mr-3 text-gray-500 flex-shrink-0" />
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target">
                <Edit3 size={16} className="mr-2" />
                編集
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors touch-target">
                シラバス
              </button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
};

export default TimetablePage;