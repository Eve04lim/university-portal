// データ同期とキャッシュ管理サービス
import { Grade, TimetableItem, Notification, Subject } from '../lib/types';

export interface SyncConfig {
  endpoint: string;
  cacheKey: string;
  maxAge: number; // キャッシュの最大保持時間（ミリ秒）
  strategy: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
}

export interface SyncResult<T> {
  data: T;
  fromCache: boolean;
  timestamp: Date;
  error?: string;
}

export interface PendingSync {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: unknown;
  timestamp: Date;
  retryCount: number;
}

class SyncService {
  private static instance: SyncService;
  private pendingSyncs: PendingSync[] = [];
  private isOnline: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      // バックグラウンド同期の登録
      this.registerBackgroundSync();
    }
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // データ取得（キャッシュ戦略に応じて）
  async fetchData<T>(config: SyncConfig): Promise<SyncResult<T>> {
    const { endpoint, cacheKey, maxAge, strategy } = config;

    switch (strategy) {
      case 'cache-first':
        return this.cacheFirstStrategy<T>(endpoint, cacheKey, maxAge);
      case 'network-first':
        return this.networkFirstStrategy<T>(endpoint, cacheKey, maxAge);
      case 'cache-only':
        return this.cacheOnlyStrategy<T>(cacheKey);
      case 'network-only':
        return this.networkOnlyStrategy<T>(endpoint);
      default:
        return this.networkFirstStrategy<T>(endpoint, cacheKey, maxAge);
    }
  }

  // Cache First戦略
  private async cacheFirstStrategy<T>(
    endpoint: string, 
    cacheKey: string, 
    _maxAge: number
  ): Promise<SyncResult<T>> {
    const cached = this.getCachedData<T>(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp, _maxAge)) {
      // バックグラウンドでネットワーク更新を試行
      if (this.isOnline) {
        this.updateCacheInBackground(endpoint, cacheKey);
      }
      
      return {
        data: cached.data,
        fromCache: true,
        timestamp: cached.timestamp
      };
    }

    // キャッシュが無効またはない場合はネットワークから取得
    return this.networkFirstStrategy<T>(endpoint, cacheKey, _maxAge);
  }

  // Network First戦略
  private async networkFirstStrategy<T>(
    endpoint: string, 
    cacheKey: string, 
    maxAge: number
  ): Promise<SyncResult<T>> {
    if (this.isOnline) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          this.setCachedData(cacheKey, data);
          
          return {
            data,
            fromCache: false,
            timestamp: new Date()
          };
        }
      } catch (error) {
        console.warn('Network request failed, falling back to cache:', error);
      }
    }

    // ネットワークが失敗した場合はキャッシュにフォールバック
    const cached = this.getCachedData<T>(cacheKey);
    if (cached) {
      return {
        data: cached.data,
        fromCache: true,
        timestamp: cached.timestamp,
        error: 'ネットワークエラー - キャッシュデータを表示'
      };
    }

    throw new Error('データを取得できませんでした');
  }

  // Cache Only戦略
  private async cacheOnlyStrategy<T>(cacheKey: string): Promise<SyncResult<T>> {
    const cached = this.getCachedData<T>(cacheKey);
    if (!cached) {
      throw new Error('キャッシュデータが見つかりません');
    }

    return {
      data: cached.data,
      fromCache: true,
      timestamp: cached.timestamp
    };
  }

  // Network Only戦略
  private async networkOnlyStrategy<T>(endpoint: string): Promise<SyncResult<T>> {
    if (!this.isOnline) {
      throw new Error('オフラインのため、データを取得できません');
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`ネットワークエラー: ${response.status}`);
    }

    const data = await response.json();
    return {
      data,
      fromCache: false,
      timestamp: new Date()
    };
  }

  // データ更新（オフライン時は保留）
  async updateData(endpoint: string, data: unknown, method: 'POST' | 'PUT' | 'DELETE' = 'POST'): Promise<boolean> {
    const syncItem: PendingSync = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'delete',
      endpoint,
      data,
      timestamp: new Date(),
      retryCount: 0
    };

    if (this.isOnline) {
      try {
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          return true;
        } else {
          // 失敗した場合は保留キューに追加
          this.pendingSyncs.push(syncItem);
          this.savePendingSyncs();
          return false;
        }
      } catch (error) {
        // ネットワークエラーの場合は保留キューに追加
        this.pendingSyncs.push(syncItem);
        this.savePendingSyncs();
        return false;
      }
    } else {
      // オフラインの場合は保留キューに追加
      this.pendingSyncs.push(syncItem);
      this.savePendingSyncs();
      return false;
    }
  }

  // バックグラウンドでキャッシュを更新
  private async updateCacheInBackground(endpoint: string, cacheKey: string): Promise<void> {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        this.setCachedData(cacheKey, data);
      }
    } catch (error) {
      console.warn('Background cache update failed:', error);
    }
  }

  // キャッシュデータの取得
  private getCachedData<T>(key: string): { data: T; timestamp: Date } | null {
    try {
      const cached = localStorage.getItem(`sync_cache_${key}`);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      return {
        data: parsed.data,
        timestamp: new Date(parsed.timestamp)
      };
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  // キャッシュデータの保存
  private setCachedData<T>(key: string, data: T): void {
    try {
      const cacheItem = {
        data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`sync_cache_${key}`, JSON.stringify(cacheItem));
      localStorage.setItem('lastDataUpdate', new Date().toISOString());
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // キャッシュの有効性チェック
  private isCacheValid(timestamp: Date, maxAge: number): boolean {
    const now = new Date();
    const age = now.getTime() - timestamp.getTime();
    return age < maxAge;
  }

  // オンライン復旧時の処理
  private async handleOnline(): Promise<void> {
    this.isOnline = true;
    console.log('Device went online, processing pending syncs...');
    
    await this.processPendingSyncs();
    this.notifyClientsOfConnectivity(true);
  }

  // オフライン時の処理
  private handleOffline(): void {
    this.isOnline = false;
    console.log('Device went offline');
    this.notifyClientsOfConnectivity(false);
  }

  // 保留中の同期処理
  private async processPendingSyncs(): Promise<void> {
    const maxRetries = 3;
    const syncsToProcess = [...this.pendingSyncs];
    
    for (const sync of syncsToProcess) {
      try {
        const response = await fetch(sync.endpoint, {
          method: sync.type === 'create' ? 'POST' : sync.type === 'update' ? 'PUT' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sync.data)
        });

        if (response.ok) {
          // 成功した場合は保留キューから削除
          this.pendingSyncs = this.pendingSyncs.filter(s => s.id !== sync.id);
          console.log(`Sync completed for ${sync.endpoint}`);
        } else if (sync.retryCount < maxRetries) {
          // リトライ回数が上限に達していない場合は再試行
          sync.retryCount++;
        } else {
          // 最大リトライ回数に達した場合は失敗として削除
          this.pendingSyncs = this.pendingSyncs.filter(s => s.id !== sync.id);
          console.error(`Sync failed permanently for ${sync.endpoint}`);
        }
      } catch (_error) {
        console.error(`Sync error for ${sync.endpoint}:`, _error);
        if (sync.retryCount < maxRetries) {
          sync.retryCount++;
        } else {
          this.pendingSyncs = this.pendingSyncs.filter(s => s.id !== sync.id);
        }
      }
    }

    this.savePendingSyncs();
  }

  // 保留中の同期をローカルストレージに保存
  private savePendingSyncs(): void {
    try {
      localStorage.setItem('pendingSyncs', JSON.stringify(this.pendingSyncs));
    } catch (error) {
      console.error('Failed to save pending syncs:', error);
    }
  }

  // バックグラウンド同期の登録
  private async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-expect-error - Background Sync API is experimental
        await registration.sync.register('background-sync-grades');
        // @ts-expect-error - Background Sync API is experimental
        await registration.sync.register('background-sync-notifications');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // クライアントに接続状態を通知
  private notifyClientsOfConnectivity(isOnline: boolean): void {
    const event = new CustomEvent('connectivity-change', {
      detail: { isOnline }
    });
    window.dispatchEvent(event);
  }

  // キャッシュクリア
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('sync_cache_'));
      keys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('pendingSyncs');
      localStorage.removeItem('lastDataUpdate');
      console.log('Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // 統計情報取得
  getCacheStats(): {
    totalItems: number;
    totalSize: number;
    lastUpdate: Date | null;
    pendingSyncs: number;
  } {
    if (typeof window === 'undefined') {
      return {
        totalItems: 0,
        totalSize: 0,
        lastUpdate: null,
        pendingSyncs: 0
      };
    }
    
    try {
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('sync_cache_'));
      let totalSize = 0;
      
      cacheKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });

      const lastUpdate = localStorage.getItem('lastDataUpdate');
      
      return {
        totalItems: cacheKeys.length,
        totalSize,
        lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
        pendingSyncs: this.pendingSyncs.length
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        lastUpdate: null,
        pendingSyncs: 0
      };
    }
  }
}

// 各データタイプ用の設定
export const SYNC_CONFIGS = {
  grades: {
    endpoint: '/api/grades',
    cacheKey: 'grades',
    maxAge: 30 * 60 * 1000, // 30分
    strategy: 'cache-first' as const
  },
  timetable: {
    endpoint: '/api/timetable',
    cacheKey: 'timetable',
    maxAge: 24 * 60 * 60 * 1000, // 24時間
    strategy: 'cache-first' as const
  },
  notifications: {
    endpoint: '/api/notifications',
    cacheKey: 'notifications',
    maxAge: 5 * 60 * 1000, // 5分
    strategy: 'network-first' as const
  },
  subjects: {
    endpoint: '/api/subjects',
    cacheKey: 'subjects',
    maxAge: 60 * 60 * 1000, // 1時間
    strategy: 'cache-first' as const
  },
  analytics: {
    endpoint: '/api/analytics',
    cacheKey: 'analytics',
    maxAge: 15 * 60 * 1000, // 15分
    strategy: 'cache-first' as const
  }
};

// シングルトンインスタンスをエクスポート
export const syncService = SyncService.getInstance();

// ヘルパー関数
export const syncGrades = () => syncService.fetchData<Grade[]>(SYNC_CONFIGS.grades);
export const syncTimetable = () => syncService.fetchData<TimetableItem[]>(SYNC_CONFIGS.timetable);
export const syncNotifications = () => syncService.fetchData<Notification[]>(SYNC_CONFIGS.notifications);
export const syncSubjects = () => syncService.fetchData<Subject[]>(SYNC_CONFIGS.subjects);