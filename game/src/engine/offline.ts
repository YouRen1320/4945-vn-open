import { projectAssetUrls } from '@/content/assets'

export interface OfflineProgress {
  cached: number
  total: number
  complete: boolean
}

interface OfflineBatchResult {
  cached: number
  failed: number
}

const cacheBatch = (worker: ServiceWorker, urls: string[]) => new Promise<OfflineBatchResult>((resolve, reject) => {
  const channel = new MessageChannel()
  const timeout = window.setTimeout(() => {
    channel.port1.close()
    reject(new Error('离线缓存响应超时。'))
  }, 20_000)
  channel.port1.onmessage = (event: MessageEvent<{ cached?: number; failed?: number }>) => {
    window.clearTimeout(timeout)
    channel.port1.close()
    const reportedCached = Number.isInteger(event.data.cached) ? event.data.cached! : 0
    const cached = Math.min(urls.length, Math.max(0, reportedCached))
    // Older workers only return `cached`; infer failures so an upgrade never reports false completion.
    const reportedFailed = Number.isInteger(event.data.failed)
      ? event.data.failed!
      : urls.length - cached
    const failed = Math.min(urls.length - cached, Math.max(0, reportedFailed))
    resolve({ cached, failed })
  }
  worker.postMessage({ type: 'CACHE_ASSETS', urls }, [channel.port2])
})

// 将完整事件一素材交给 Service Worker；只有全部资源真实缓存后才报告离线就绪。
export const cacheSeasonAssets = async (
  onProgress?: (progress: OfflineProgress) => void,
): Promise<OfflineProgress> => {
  const total = projectAssetUrls.length
  const unavailable = { cached: 0, total, complete: false }
  if (!('serviceWorker' in navigator)) return unavailable
  const registration = await navigator.serviceWorker.ready
  const worker = registration.active ?? registration.waiting ?? registration.installing
  if (!worker) return unavailable

  const batchSize = 8
  let cached = 0
  let failed = 0
  for (let index = 0; index < projectAssetUrls.length; index += batchSize) {
    const result = await cacheBatch(worker, projectAssetUrls.slice(index, index + batchSize))
    cached += result.cached
    failed += result.failed
    const progress = { cached, total, complete: cached === total && failed === 0 }
    onProgress?.(progress)
  }

  const finalProgress = { cached, total, complete: cached === total && failed === 0 }
  if (!finalProgress.complete) {
    throw new Error(`离线素材仅缓存 ${cached}/${total}，点击重试`)
  }
  return finalProgress
}
