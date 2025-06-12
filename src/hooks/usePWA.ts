'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: PWAInstallPrompt | null;
}

interface PWAActions {
  installApp: () => Promise<boolean>;
  updateApp: () => Promise<void>;
  dismissInstallPrompt: () => void;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<boolean>;
}

export interface UsePWAReturn extends PWAState, PWAActions {
  isSupported: boolean;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
}

export const usePWA = (): UsePWAReturn => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    isUpdateAvailable: false,
    installPrompt: null
  });

  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Service Worker の登録とPWA機能の初期化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // PWAサポートチェック
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (!supported) return;

    // インストール状態の確認
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = (window.navigator as any).standalone === true;
      setState(prev => ({ ...prev, isInstalled: isStandalone || isInWebApp }));
    };

    checkInstallStatus();

    // オンライン状態の監視
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    setState(prev => ({ ...prev, isOnline: navigator.onLine }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // インストールプロンプトの監視
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installPrompt = e as PWAInstallPrompt;
      setState(prev => ({ 
        ...prev, 
        isInstallable: true,
        installPrompt 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // アプリがインストールされた時のイベント
    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker の登録
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        setServiceWorkerRegistration(registration);

        // Service Worker の更新チェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });

        // Service Worker からのメッセージを受信
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { data }: { data: { type: string; timestamp: string } } = event;
          
          switch (data.type) {
            case 'GRADES_SYNCED':
              console.log('Grades data synced:', data.timestamp);
              // UI更新のロジックをここに追加
              break;
            case 'NOTIFICATIONS_SYNCED':
              console.log('Notifications data synced:', data.timestamp);
              // UI更新のロジックをここに追加
              break;
          }
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // アプリのインストール
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!state.installPrompt) return false;

    try {
      await state.installPrompt.prompt();
      const { outcome } = await state.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({ 
          ...prev, 
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to install app:', error);
      return false;
    }
  }, [state.installPrompt]);

  // アプリの更新
  const updateApp = useCallback(async (): Promise<void> => {
    if (!serviceWorkerRegistration?.waiting) return;

    serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }, [serviceWorkerRegistration]);

  // インストールプロンプトの却下
  const dismissInstallPrompt = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isInstallable: false,
      installPrompt: null
    }));
  }, []);

  // プッシュ通知の登録
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    if (!serviceWorkerRegistration || !('PushManager' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // サブスクリプション情報をサーバーに送信
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return false;
    }
  }, [serviceWorkerRegistration]);

  // プッシュ通知の解除
  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    if (!serviceWorkerRegistration) return false;

    try {
      const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
      if (!subscription) return true;

      await subscription.unsubscribe();

      // サーバーにも解除を通知
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      return false;
    }
  }, [serviceWorkerRegistration]);

  return {
    ...state,
    isSupported,
    serviceWorkerRegistration,
    installApp,
    updateApp,
    dismissInstallPrompt,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
};

// データキャッシュ用のカスタムフック
export const useOfflineData = () => {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastDataUpdate');
    if (stored) {
      setLastSyncTime(new Date(stored));
    }
  }, []);

  const cacheData = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(`cached-${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      localStorage.setItem('lastDataUpdate', new Date().toISOString());
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  const getCachedData = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(`cached-${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      return { data, timestamp: new Date(timestamp) };
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cached-'));
      keys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('lastDataUpdate');
      setLastSyncTime(null);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, []);

  return {
    lastSyncTime,
    cacheData,
    getCachedData,
    clearCache
  };
};