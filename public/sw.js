// University Portal Service Worker
// PWAオフライン対応とキャッシュ管理

const CACHE_NAME = 'university-portal-v1.0.0';
const OFFLINE_URL = '/offline';

// キャッシュするリソースを定義
const PRECACHE_RESOURCES = [
  '/',
  '/offline',
  '/grades',
  '/timetable', 
  '/notifications',
  '/analytics',
  '/subjects',
  '/manifest.json',
  
  // 静的アセット
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main-app.js',
  
  // アイコンとフォント
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  
  // 基本的なAPIエンドポイント（オフライン用）
  '/api/health'
];

// API リクエストパターン
const API_CACHE_PATTERNS = [
  /^\/api\/grades/,
  /^\/api\/timetable/,
  /^\/api\/notifications/,
  /^\/api\/analytics/,
  /^\/api\/subjects/
];

// インストールイベント - リソースをプリキャッシュ
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('[SW] Skip waiting on install');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// アクティベーションイベント - 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// フェッチイベント - ネットワークリクエストの処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chrome拡張機能のリクエストを無視
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // GET リクエストのみ処理
  if (request.method !== 'GET') {
    return;
  }

  // ナビゲーションリクエスト（ページ遷移）の処理
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  // APIリクエストの処理
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 静的リソースの処理
  event.respondWith(handleStaticResource(request));
});

// ナビゲーション（ページ遷移）の処理
async function handleNavigate(request) {
  try {
    // まずネットワークから取得を試行
    const networkResponse = await fetch(request);
    
    // 成功した場合はキャッシュに保存してレスポンス
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed for navigation, falling back to cache');
  }

  // ネットワークが失敗した場合はキャッシュから取得
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // キャッシュにもない場合はオフラインページを表示
  return caches.match(OFFLINE_URL);
}

// APIリクエストの処理（Network First戦略）
async function handleApiRequest(request) {
  try {
    // まずネットワークから取得
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);

    if (networkResponse.ok) {
      // 成功した場合はキャッシュに保存
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed for API request:', error);
  }

  // ネットワークが失敗した場合はキャッシュから取得
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[SW] Serving API request from cache');
    
    // キャッシュからのレスポンスにヘッダーを追加
    const response = cachedResponse.clone();
    response.headers.set('X-Served-By', 'ServiceWorker-Cache');
    response.headers.set('X-Cache-Date', new Date().toISOString());
    
    return response;
  }

  // キャッシュにもない場合はエラーレスポンス
  return new Response(
    JSON.stringify({ 
      error: 'オフラインのため、データを取得できません',
      offline: true,
      timestamp: new Date().toISOString()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'X-Served-By': 'ServiceWorker-Offline'
      }
    }
  );
}

// 静的リソースの処理（Cache First戦略）
async function handleStaticResource(request) {
  // まずキャッシュから確認
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // キャッシュにない場合はネットワークから取得
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 成功した場合はキャッシュに保存
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Failed to fetch static resource:', error);
  }

  // ネットワークもキャッシュも失敗した場合
  return new Response('リソースが見つかりません', {
    status: 404,
    statusText: 'Not Found'
  });
}

// APIリクエストかどうかを判定
function isApiRequest(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

// プッシュ通知イベント
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'あなたへの新しいお知らせがあります',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: '確認する',
        icon: '/icons/checkmark-24x24.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/close-24x24.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.title = data.title || 'University Portal';
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  } else {
    options.title = 'University Portal';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// 通知クリックイベント
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');

  event.notification.close();

  if (event.action === 'explore') {
    // 通知を確認するアクション
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  } else if (event.action === 'close') {
    // 何もしない（通知を閉じるだけ）
    console.log('[SW] Notification dismissed');
  } else {
    // デフォルトアクション（通知全体をクリック）
    event.waitUntil(
      clients.matchAll().then((clientsList) => {
        for (const client of clientsList) {
          if (client.url === self.location.origin + '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// バックグラウンド同期イベント
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-grades') {
    event.waitUntil(syncGrades());
  } else if (event.tag === 'background-sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// 成績データの同期
async function syncGrades() {
  try {
    console.log('[SW] Syncing grades data...');
    const response = await fetch('/api/grades');
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/api/grades', response.clone());
      console.log('[SW] Grades data synced successfully');
      
      // 更新があればクライアントに通知
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'GRADES_SYNCED',
          timestamp: new Date().toISOString()
        });
      });
    }
  } catch (error) {
    console.error('[SW] Failed to sync grades:', error);
  }
}

// お知らせデータの同期
async function syncNotifications() {
  try {
    console.log('[SW] Syncing notifications data...');
    const response = await fetch('/api/notifications');
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/api/notifications', response.clone());
      console.log('[SW] Notifications data synced successfully');
      
      // 更新があればクライアントに通知
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATIONS_SYNCED',
          timestamp: new Date().toISOString()
        });
      });
    }
  } catch (error) {
    console.error('[SW] Failed to sync notifications:', error);
  }
}

// エラーイベント
self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully');