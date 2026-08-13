import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

// 复用 vite.config 的插件、别名与 define（含 __APP_VERSION__），测试与构建不再各维护一份。
export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  }
}))
