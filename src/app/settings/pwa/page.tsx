'use client';

import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Database,
  Wifi,
  Trash2,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { usePWA, useOfflineData } from '../../../hooks/usePWA';
import { syncService } from '../../../services/syncService';
import NotificationSettings from '../../components/pwa/NotificationSettings';

const PWASettingsPage: React.FC = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isUpdateAvailable,
    isSupported,
    installApp,
    updateApp 
  } = usePWA();
  
  const { lastSyncTime, clearCache } = useOfflineData();
  const [isClearing, setIsClearing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCacheStats, setShowCacheStats] = useState(false);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      alert('アプリのインストールが完了しました！');
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('キャッシュをクリアしますか？オフライン時にデータが利用できなくなります。')) {
      setIsClearing(true);
      try {
        clearCache();
        syncService.clearCache();
        alert('キャッシュをクリアしました。');
      } catch (error) {
        console.error('Failed to clear cache:', error);
        alert('キャッシュのクリアに失敗しました。');
      } finally {
        setIsClearing(false);
      }
    }
  };

  const cacheStats = syncService.getCacheStats();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return '未同期';
    return date.toLocaleString('ja-JP');
  };

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h1 className="text-xl font-bold text-yellow-800">PWA非対応</h1>
          </div>
          <p className="text-yellow-700">
            お使いのブラウザはProgressive Web App（PWA）機能に対応していません。
            最新のChrome、Firefox、Safari、またはEdgeをご利用ください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">PWA設定</h1>
        <p className="text-gray-600">
          Progressive Web App機能の設定とオフライン対応の管理
        </p>
      </div>

      {/* インストール状況 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">アプリインストール</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={`p-4 rounded-lg border-2 ${
            isInstalled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">インストール状況</h3>
              {isInstalled ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Download className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className={`text-sm ${isInstalled ? 'text-green-700' : 'text-gray-600'}`}>
              {isInstalled ? 'アプリがインストール済みです' : 'アプリはインストールされていません'}
            </p>
            
            {isInstallable && !isInstalled && (
              <button
                onClick={handleInstall}
                className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                アプリをインストール
              </button>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            isUpdateAvailable ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">アップデート</h3>
              {isUpdateAvailable ? (
                <RefreshCw className="w-5 h-5 text-orange-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <p className={`text-sm ${isUpdateAvailable ? 'text-orange-700' : 'text-green-700'}`}>
              {isUpdateAvailable ? '新しいバージョンが利用可能です' : '最新バージョンです'}
            </p>
            
            {isUpdateAvailable && (
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="mt-3 w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    今すぐ更新
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* オフライン機能 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wifi className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">オフライン機能</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className={`p-4 rounded-lg border ${
            isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <h3 className="font-medium text-gray-900 mb-2">接続状況</h3>
            <p className={`text-sm ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
              {isOnline ? '🟢 オンライン' : '🔴 オフライン'}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-2">最終同期</h3>
            <p className="text-sm text-gray-600">
              {formatLastSync(lastSyncTime)}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-2">保留中の同期</h3>
            <p className="text-sm text-gray-600">
              {cacheStats.pendingSyncs}件
            </p>
          </div>
        </div>
      </div>

      {/* キャッシュ管理 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">キャッシュ管理</h2>
          </div>
          <button
            onClick={() => setShowCacheStats(!showCacheStats)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            <Info size={16} />
            {showCacheStats ? '詳細を隠す' : '詳細を表示'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">キャッシュアイテム数:</span>
              <span className="font-medium">{cacheStats.totalItems}個</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">使用容量:</span>
              <span className="font-medium">{formatBytes(cacheStats.totalSize)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">最終更新:</span>
              <span className="font-medium">
                {cacheStats.lastUpdate ? formatLastSync(cacheStats.lastUpdate) : '未同期'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isClearing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  クリア中...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  キャッシュをクリア
                </>
              )}
            </button>
          </div>
        </div>

        {showCacheStats && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">キャッシュ詳細</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="text-sm">
                <span className="text-gray-600">成績データ:</span>
                <span className="ml-2 text-gray-900">キャッシュ済み</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">時間割データ:</span>
                <span className="ml-2 text-gray-900">キャッシュ済み</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">お知らせ:</span>
                <span className="ml-2 text-gray-900">キャッシュ済み</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">履修科目:</span>
                <span className="ml-2 text-gray-900">キャッシュ済み</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* プッシュ通知設定 */}
      <NotificationSettings />

      {/* PWA機能説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">PWA機能について</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>オフライン対応</strong>: インターネット接続がなくてもアプリを利用できます</p>
          <p>• <strong>高速読み込み</strong>: キャッシュにより素早くアプリが起動します</p>
          <p>• <strong>プッシュ通知</strong>: 重要なお知らせをリアルタイムで受信します</p>
          <p>• <strong>ネイティブ体験</strong>: アプリのようなユーザーエクスペリエンスを提供します</p>
          <p>• <strong>自動更新</strong>: 新機能やバグ修正が自動的に適用されます</p>
        </div>
      </div>
    </div>
  );
};

export default PWASettingsPage;