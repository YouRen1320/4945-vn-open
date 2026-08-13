// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { projectAssetUrls } from '@/content/assets'

import { cacheSeasonAssets } from './offline'

import type { OfflineProgress } from './offline'

interface TestPort {
  deliver: (data: { cached?: number; failed?: number }) => void
}

class TestMessageChannel {
  port1 = {
    onmessage: null as ((event: MessageEvent<{ cached?: number; failed?: number }>) => void) | null,
    close: vi.fn(),
  }

  port2: TestPort = {
    deliver: (data) => queueMicrotask(() => {
      this.port1.onmessage?.({ data } as MessageEvent<{ cached?: number; failed?: number }>)
    }),
  }
}

const installWorker = (
  reply: (urls: string[], batchIndex: number) => { cached?: number; failed?: number },
) => {
  let batchIndex = 0
  const worker = {
    postMessage: vi.fn((message: { urls: string[] }, ports: TestPort[]) => {
      ports[0]?.deliver(reply(message.urls, batchIndex))
      batchIndex += 1
    }),
  }
  vi.stubGlobal('navigator', {
    serviceWorker: {
      ready: Promise.resolve({ active: worker, waiting: null, installing: null }),
    },
  })
  return worker
}

beforeEach(() => {
  vi.stubGlobal('MessageChannel', TestMessageChannel)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('完整季离线缓存', () => {
  it('所有批次真实成功后才报告 complete', async () => {
    const worker = installWorker((urls) => ({ cached: urls.length, failed: 0 }))
    const updates: OfflineProgress[] = []

    const result = await cacheSeasonAssets((progress) => updates.push(progress))

    expect(result).toEqual({ cached: projectAssetUrls.length, total: projectAssetUrls.length, complete: true })
    expect(updates.at(-1)).toEqual(result)
    expect(updates.slice(0, -1).every((progress) => !progress.complete)).toBe(true)
    expect(worker.postMessage).toHaveBeenCalledTimes(Math.ceil(projectAssetUrls.length / 8))
  })

  it('任一批次包含 HTML fallback 等失败资源时保留可重试状态', async () => {
    installWorker((urls, batchIndex) => (
      batchIndex === 0
        ? { cached: urls.length - 1, failed: 1 }
        : { cached: urls.length, failed: 0 }
    ))
    const updates: OfflineProgress[] = []

    await expect(cacheSeasonAssets((progress) => updates.push(progress)))
      .rejects.toThrow(`离线素材仅缓存 ${projectAssetUrls.length - 1}/${projectAssetUrls.length}，点击重试`)
    expect(updates.at(-1)).toEqual({
      cached: projectAssetUrls.length - 1,
      total: projectAssetUrls.length,
      complete: false,
    })
  })

  it('兼容旧 Service Worker 仅返回 cached 的协议，并推断未缓存数量', async () => {
    installWorker((urls, batchIndex) => ({
      cached: batchIndex === 0 ? urls.length - 1 : urls.length,
    }))

    await expect(cacheSeasonAssets())
      .rejects.toThrow(`${projectAssetUrls.length - 1}/${projectAssetUrls.length}`)
  })

  it('浏览器不支持 Service Worker 时不会误报完成', async () => {
    vi.stubGlobal('navigator', {})

    await expect(cacheSeasonAssets()).resolves.toEqual({
      cached: 0,
      total: projectAssetUrls.length,
      complete: false,
    })
  })
})
