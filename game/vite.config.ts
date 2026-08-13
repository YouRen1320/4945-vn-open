import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import { version } from './package.json'

export default defineConfig({
  plugins: [vue()],
  // 应用版本号的唯一数据源是 package.json，构建与测试统一经此注入。
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 4096,
    manifest: true,
  }
})
