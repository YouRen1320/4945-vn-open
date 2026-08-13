import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import './styles/tokens.css'
import './styles/global.css'

createApp(App).use(createPinia()).mount('#app')

// 生产环境注册轻量离线缓存；开发环境保持实时刷新，不让旧缓存干扰调试。
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}
