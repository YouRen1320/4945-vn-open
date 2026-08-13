import { describe, expect, it } from 'vitest'

import serviceWorkerSource from '../../public/sw.js?raw'
import { GAME_APP_VERSION } from '../engine/state'
import { currentReleaseNotes } from './releaseNotes'

// Release metadata and the offline cache key must advance together so returning players receive the new bundle.
describe('发布版本合同', () => {
  it('更新说明与应用版本一致', () => {
    expect(currentReleaseNotes.version).toBe(GAME_APP_VERSION)
  })

  it('离线缓存版本与应用版本一致', () => {
    expect(serviceWorkerSource).toContain(`const CACHE_VERSION = '4945-v${GAME_APP_VERSION}'`)
  })
})
