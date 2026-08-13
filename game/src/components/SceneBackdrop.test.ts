// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'

import SceneBackdrop from './SceneBackdrop.vue'

interface MediaFixture {
  media: MediaQueryList
  listeners: Set<(event: MediaQueryListEvent) => void>
}

let unmount: (() => void) | undefined

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

const installResponsiveMedia = () => {
  const fixtures: MediaFixture[] = []
  const matches = (query: string) => (
    query.includes('max-width: 600px')
    && window.innerWidth <= 600
    && window.innerHeight > window.innerWidth
  )

  vi.stubGlobal('matchMedia', vi.fn((query: string) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    const media = {
      get matches() { return matches(query) },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList
    fixtures.push({ media, listeners })
    return media
  }))

  return (width: number, height: number) => {
    setViewport(width, height)
    for (const fixture of fixtures) {
      const event = {
        matches: fixture.media.matches,
        media: fixture.media.media,
      } as MediaQueryListEvent
      fixture.listeners.forEach((listener) => listener(event))
    }
  }
}

const installImmediateImage = () => {
  class ImmediateImage {
    complete = true
    naturalWidth = 1
    onload: ((event: Event) => void) | null = null
    onerror: ((event: Event) => void) | null = null
    private value = ''

    get src() { return this.value }
    set src(value: string) {
      this.value = value
      queueMicrotask(() => this.onload?.(new Event('load')))
    }

    decode() { return Promise.resolve() }
  }

  vi.stubGlobal('Image', ImmediateImage as unknown as typeof Image)
}

const settleImage = async () => {
  await Promise.resolve()
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await Promise.resolve()
  await nextTick()
}

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('SceneBackdrop 响应式CG', () => {
  it('390×844选择竖屏图，切换到桌面后恢复横屏图', async () => {
    setViewport(390, 844)
    const resize = installResponsiveMedia()
    installImmediateImage()

    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h(SceneBackdrop, {
        sceneKey: 'portrait-contract',
        src: '/assets/backgrounds/galgame/login-v1.webp',
        gradient: 'linear-gradient(#000, #111)',
        alt: '响应式CG测试',
        cg: '/assets/cg/ending-route2-v1.webp',
        cgPortrait: '/assets/cg/invitation-phone-v1.webp',
        placeholderFor: '/assets/cg/future-event-v1.webp',
        promptRef: 'V18-CG-99',
        camera: 'hold',
        transition: 'cut',
        focus: 'center',
      }),
    })
    app.mount(host)
    unmount = () => app.unmount()

    await settleImage()
    expect(host.querySelector('.scene-image[data-image-url="/assets/cg/invitation-phone-v1.webp"]'))
      .not.toBeNull()
    expect(host.querySelector('.scene-image')?.getAttribute('data-placeholder-for'))
      .toBe('/assets/cg/future-event-v1.webp')
    expect(host.querySelector('.visual-placeholder-mark')?.textContent).toContain('V18-CG-99')

    resize(1440, 900)
    await settleImage()
    expect(host.querySelector('.scene-image[data-image-url="/assets/cg/ending-route2-v1.webp"]'))
      .not.toBeNull()
  })
})
