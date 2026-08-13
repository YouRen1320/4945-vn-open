// Bump this release key whenever the public bundle changes so returning players
// do not keep the pre-release shell or artwork in their offline cache.
const CACHE_VERSION = '4945-v4.0.0'
const BUILD_ASSETS = []
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/backgrounds/cg00-invitation.webp',
  ...BUILD_ASSETS,
]
const IMAGE_ASSET_PATTERN = /\.(?:webp|png|jpe?g|gif|svg)$/i

// Same-origin SPA fallback responses are successful HTML; image URLs must additionally prove their media type.
const isCacheableResponse = (url, response) => {
  if (!response.ok) return false
  const pathname = new URL(url, self.location.origin).pathname
  if (!IMAGE_ASSET_PATTERN.test(pathname)) return true
  return (response.headers.get('content-type')?.toLowerCase() ?? '').startsWith('image/')
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_ASSETS' || !Array.isArray(event.data.urls)) return
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      let cached = 0
      let failed = 0
      for (const url of event.data.urls) {
        try {
          const response = await fetch(url)
          const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
          // The SPA fallback returns 200 text/html for a missing asset; never cache or count it as artwork.
          if (!isCacheableResponse(url, response)) {
            throw new Error(`invalid asset response: ${response.status} ${contentType}`)
          }
          await cache.put(url, response)
          cached += 1
        } catch {
          // 单个可选资源失败不应阻止其他章节进入离线缓存。
          failed += 1
        }
      }
      event.ports[0]?.postMessage({ cached, failed })
    }),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html', { ignoreVary: true }).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const copy = response.clone()
          void caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', copy))
          return response
        })
      }),
    )
    return
  }

  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (isCacheableResponse(request.url, response)) {
          const copy = response.clone()
          void caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
