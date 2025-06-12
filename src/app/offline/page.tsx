'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, Clock } from 'lucide-react';
import Link from 'next/link';

const OfflinePage: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // オンライン状態の監視
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 最後の更新時刻を取得
    const stored = localStorage.getItem('lastDataUpdate');
    if (stored) {
      setLastUpdate(new Date(stored).toLocaleString('ja-JP'));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    if (isOnline) {
      window.location.reload();
    }
  };

  const getCachedData = () => {
    if (typeof window === 'undefined') {
      return {
        hasGrades: false,
        hasTimetable: false,
        hasNotifications: false
      };
    }
    
    const cachedGrades = localStorage.getItem('cached-grades');
    const cachedTimetable = localStorage.getItem('cached-timetable');
    const cachedNotifications = localStorage.getItem('cached-notifications');

    return {
      hasGrades: !!cachedGrades,
      hasTimetable: !!cachedTimetable,
      hasNotifications: !!cachedNotifications
    };
  };

  const cachedData = getCachedData();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* オフライン/オンライン状態のアイコン */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
          isOnline ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isOnline ? (
            <RefreshCw className={`w-8 h-8 text-green-600`} />
          ) : (
            <WifiOff className="w-8 h-8 text-red-600" />
          )}
        </div>

        {/* メインメッセージ */}
        <h1 className={`text-2xl font-bold mb-4 ${
          isOnline ? 'text-green-700' : 'text-gray-700'
        }`}>
          {isOnline ? '接続が復旧しました' : 'オフラインモード'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isOnline 
            ? 'インターネット接続が復旧しました。最新のデータを取得できます。'
            : 'インターネット接続がありません。キャッシュされたデータを表示しています。'
          }
        </p>

        {/* 最終更新時刻 */}
        {lastUpdate && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>最終更新: {lastUpdate}</span>
            </div>
          </div>
        )}

        {/* 利用可能な機能 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">利用可能な機能</h3>
          <div className="space-y-2">
            {cachedData.hasGrades && (
              <Link 
                href="/grades"
                className="block w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📊 成績データ（キャッシュ済み）
              </Link>
            )}
            {cachedData.hasTimetable && (
              <Link 
                href="/timetable"
                className="block w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                📅 時間割（キャッシュ済み）
              </Link>
            )}
            {cachedData.hasNotifications && (
              <Link 
                href="/notifications"
                className="block w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                📢 お知らせ（キャッシュ済み）
              </Link>
            )}
            
            <Link 
              href="/analytics"
              className="block w-full p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              📈 学習分析（オフライン対応）
            </Link>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          {isOnline ? (
            <button
              onClick={handleRefresh}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              最新データを取得
            </button>
          ) : (
            <div className="bg-gray-100 text-gray-500 py-3 px-4 rounded-lg">
              接続が復旧するまでお待ちください
            </div>
          )}

          <Link
            href="/"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            ホームに戻る
          </Link>
        </div>

        {/* オフライン使用時の注意事項 */}
        {!isOnline && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">ご注意</h4>
            <ul className="text-sm text-yellow-700 space-y-1 text-left">
              <li>• 表示されるデータは最後に取得した時点のものです</li>
              <li>• 新しいデータの保存や変更はできません</li>
              <li>• 接続復旧後に最新データと同期されます</li>
            </ul>
          </div>
        )}
      </div>

      {/* ネットワーク状態の表示 */}
      <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isOnline 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? '🟢 オンライン' : '🔴 オフライン'}
      </div>
    </div>
  );
};

export default OfflinePage;