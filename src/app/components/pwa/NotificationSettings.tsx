'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Check, X, AlertTriangle } from 'lucide-react';
import { usePWA } from '../../../hooks/usePWA';

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

const NotificationSettings: React.FC = () => {
  const { subscribeToNotifications, unsubscribeFromNotifications, isSupported } = usePWA();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'grades',
      name: '成績通知',
      description: '新しい成績が登録された時',
      enabled: true,
      icon: '📊'
    },
    {
      id: 'announcements',
      name: '重要なお知らせ',
      description: '大学からの重要な連絡',
      enabled: true,
      icon: '📢'
    },
    {
      id: 'schedule',
      name: '授業・予定',
      description: '授業の変更や重要な予定',
      enabled: true,
      icon: '📅'
    },
    {
      id: 'deadlines',
      name: '課題・締切',
      description: 'レポートや課題の締切前',
      enabled: false,
      icon: '⏰'
    },
    {
      id: 'events',
      name: 'イベント',
      description: '学内イベントやセミナー',
      enabled: false,
      icon: '🎓'
    },
    {
      id: 'system',
      name: 'システム',
      description: 'メンテナンスやシステム障害',
      enabled: true,
      icon: '🔧'
    }
  ]);

  useEffect(() => {
    checkNotificationStatus();
    loadUserPreferences();
  }, []);

  const checkNotificationStatus = async () => {
    if (!isSupported) return;

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      // Service Workerのsubscriptionをチェック
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsEnabled(!!subscription);
      } catch (error) {
        console.error('Failed to check notification status:', error);
      }
    }
  };

  const loadUserPreferences = () => {
    try {
      const saved = localStorage.getItem('notificationPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setCategories(prev => prev.map(cat => ({
          ...cat,
          enabled: preferences[cat.id] !== undefined ? preferences[cat.id] : cat.enabled
        })));
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const saveUserPreferences = (newCategories: NotificationCategory[]) => {
    try {
      const preferences = newCategories.reduce((acc, cat) => {
        acc[cat.id] = cat.enabled;
        return acc;
      }, {} as Record<string, boolean>);
      
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setIsSubscribing(true);
    try {
      const success = await subscribeToNotifications();
      if (success) {
        setIsEnabled(true);
        setPermission('granted');
        
        // 成功時にテスト通知を送信
        showTestNotification();
      } else {
        alert('通知の設定に失敗しました。ブラウザの設定を確認してください。');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('通知の設定中にエラーが発生しました。');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      const success = await unsubscribeFromNotifications();
      if (success) {
        setIsEnabled(false);
      }
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    }
  };

  const showTestNotification = () => {
    if (permission === 'granted') {
      new Notification('University Portal', {
        body: 'プッシュ通知が正常に設定されました！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
    );
    setCategories(newCategories);
    saveUserPreferences(newCategories);
  };

  const getPermissionStatusColor = () => {
    switch (permission) {
      case 'granted': return 'text-green-600';
      case 'denied': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getPermissionStatusText = () => {
    switch (permission) {
      case 'granted': return '許可済み';
      case 'denied': return '拒否済み';
      default: return '未設定';
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">プッシュ通知非対応</h3>
            <p className="text-sm text-yellow-700">
              お使いのブラウザはプッシュ通知に対応していません。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 通知ステータス */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <Bell className="w-6 h-6 text-blue-600" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">プッシュ通知</h3>
              <p className={`text-sm ${getPermissionStatusColor()}`}>
                状態: {getPermissionStatusText()}
              </p>
            </div>
          </div>

          {permission === 'granted' ? (
            <div className="flex gap-2">
              {!isEnabled ? (
                <button
                  onClick={handleEnableNotifications}
                  disabled={isSubscribing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      設定中...
                    </>
                  ) : (
                    <>
                      <Bell size={16} />
                      有効にする
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisableNotifications}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <BellOff size={16} />
                  無効にする
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleEnableNotifications}
              disabled={isSubscribing || permission === 'denied'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubscribing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  許可を求めています...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  通知を許可
                </>
              )}
            </button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">通知が拒否されています</h4>
                <p className="text-sm text-red-700 mt-1">
                  ブラウザの設定から通知を許可してください：
                </p>
                <ol className="text-sm text-red-700 mt-2 ml-4 list-decimal space-y-1">
                  <li>アドレスバーの鍵アイコンをクリック</li>
                  <li>「通知」を「許可」に変更</li>
                  <li>ページを再読み込み</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {isEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">通知が有効です</h4>
                <p className="text-sm text-green-700">
                  重要なお知らせをリアルタイムで受信できます。
                </p>
              </div>
              <button
                onClick={showTestNotification}
                className="ml-auto px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                テスト通知
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 通知カテゴリ設定 */}
      {isEnabled && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">通知の種類</h3>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={category.enabled}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer transition-colors ${
                    category.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      category.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">通知について</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 通知は重要度に応じて送信されます</li>
              <li>• 夜間（22:00-8:00）は緊急時のみ送信</li>
              <li>• いつでも設定を変更できます</li>
              <li>• プライバシーは保護されています</li>
            </ul>
          </div>
        </div>
      )}

      {/* 使用状況 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通知履歴</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-sm text-gray-600">今月の通知</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">3</div>
            <div className="text-sm text-gray-600">今週の通知</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
            <div className="text-sm text-gray-600">配信成功率</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">1</div>
            <div className="text-sm text-gray-600">未読通知</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;