/* 픽셀 슬라임 클리커 서비스워커: 캐시 우선 + 런타임 캐싱.
   버전을 올리면 구 캐시가 정리된다. */
'use strict';

const CACHE = 'slime-clicker-v1';

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/generated/sprites/slime-friends-ai/sprite-sheet-alpha.png',
  './assets/generated/sprites/slime-items-ai/sprite-sheet-alpha.png',
  './assets/generated/sprites/slime-achievements-ai/sprite-sheet-alpha.png',
  './assets/generated/sprites/slime-decor-ai/sprite-sheet-alpha.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // 하나 실패해도 설치는 진행되게 개별 add
      Promise.allSettled(CORE.map(url => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // 정상 응답(폰트 CDN 포함)은 런타임 캐시에 저장
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
