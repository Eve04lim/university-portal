'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { usePWA, useOfflineData } from '../../../hooks/usePWA';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const { lastSyncTime } = useOfflineData();
  const [showDetails, setShowDetails] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // オンラインに復旧した時の処理
      setWasOffline(false);
      // 自動更新のロジックをここに追加可能
    }
  }, [isOnline, wasOffline]);

  const handleRefresh = () => {
    if (isOnline) {
      window.location.reload();
    }
  };

  const formatLastSyncTime = (date: Date | null) => {
    if (!date) return '未同期';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${diffDays}日前`;
  };

  // オンライン時は表示しない（オプション）
  if (isOnline && !showDetails) return null;

  return (
    <>
      {/* メインインジケーター */}
      <div 
        className={`fixed top-4 right-4 z-40 transition-all duration-300 ${
          isOnline ? 'transform translate-y-0' : 'transform translate-y-0'
        }`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
            isOnline 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
          onClick={() => setShowDetails(!showDetails)}
        >
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span className="hidden sm:inline">
            {isOnline ? 'オンライン' : 'オフライン'}
          </span>
        </div>
      </div>

      {/* 詳細情報パネル */}
      {showDetails && (
        <div className="fixed top-16 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">接続状態</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* 現在の状態 */}
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              isOnline ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={`font-medium ${
                  isOnline ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isOnline ? 'インターネット接続あり' : 'オフラインモード'}
                </p>
                <p className={`text-sm ${
                  isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isOnline 
                    ? '最新のデータにアクセスできます' 
                    : 'キャッシュされたデータを表示中'
                  }
                </p>
              </div>
            </div>

            {/* 最終同期時刻 */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">最終同期</p>
                <p className="text-sm text-gray-600">
                  {formatLastSyncTime(lastSyncTime)}
                </p>
              </div>
            </div>

            {/* オフライン時の警告 */}
            {!isOnline && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">制限事項</p>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• 新しいデータの取得不可</li>
                    <li>• データの保存・更新不可</li>
                    <li>• 一部機能が利用不可</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 利用可能な機能 */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">利用可能な機能</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  成績閲覧
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  時間割表示
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  学習分析
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  お知らせ
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            {isOnline && (
              <button
                onClick={handleRefresh}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                最新データを取得
              </button>
            )}
          </div>
        </div>
      )}

      {/* オフライン時のフローティング通知 */}
      {!isOnline && !showDetails && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:left-auto sm:w-80">
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">オフラインモード</p>
                <p className="text-sm text-red-600">
                  キャッシュされたデータを表示しています
                </p>
              </div>
              <button
                onClick={() => setShowDetails(true)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                詳細
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;