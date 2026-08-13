<script setup lang="ts">
import { Check, Copy, ExternalLink, MessageCircleMore } from '@lucide/vue'
import { ref } from 'vue'

const QQ_GROUP_NUMBER = '1075594288'
const QQ_GROUP_INVITE_URL = 'https://qm.qq.com/q/eHUS6rTboI'

const status = ref('')

// Clipboard is the dependable join path; the DOM fallback keeps older mobile browsers usable.
const copyGroupNumber = async () => {
  let copied = false
  try {
    await navigator.clipboard.writeText(QQ_GROUP_NUMBER)
    copied = true
  } catch {
    const input = document.createElement('textarea')
    input.value = QQ_GROUP_NUMBER
    input.readOnly = true
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.append(input)
    input.select()
    try { copied = document.execCommand('copy') }
    catch { copied = false }
    input.remove()
  }
  status.value = copied ? '群号已复制，打开QQ搜索即可加入' : '复制受限，请长按上方群号复制'
}

</script>

<template>
  <section class="community-panel" aria-labelledby="community-panel-title">
    <div class="community-mark" aria-hidden="true"><MessageCircleMore :size="28" /></div>
    <div class="community-heading">
      <p>4945 SERVER COMMUNITY</p>
      <h3 id="community-panel-title">4945区玩家集结</h3>
      <span>剧情写的是过去，群聊负责制造下一季。</span>
    </div>

    <div class="group-number" aria-label="QQ群号 1075594288">
      <small>QQ群</small>
      <strong>{{ QQ_GROUP_NUMBER }}</strong>
    </div>

    <div class="community-actions">
      <a class="qq-action" :href="QQ_GROUP_INVITE_URL" target="_blank" rel="noopener noreferrer">
        <ExternalLink :size="19" />一键加入QQ群
      </a>
      <button class="copy-action" type="button" @click="copyGroupNumber">
        <Copy :size="19" />复制群号
      </button>
    </div>

    <p class="join-guide">链接无法唤起QQ时，复制群号后在QQ内搜索加入。</p>
    <p class="copy-status" role="status" aria-live="polite">
      <Check v-if="status.startsWith('群号已复制')" :size="16" />{{ status }}
    </p>

    <figure class="group-qr">
      <img src="/assets/ui/qq-group-1075594288-v1.webp" width="1045" height="1325" alt="4945区QQ群二维码，群号1075594288" />
      <figcaption>电脑端可使用手机QQ扫码加入</figcaption>
    </figure>
  </section>
</template>

<style scoped>
.community-panel { display: grid; justify-items: center; gap: 1rem; padding: .3rem 0 .15rem; text-align: center; }
.community-mark { display: grid; width: 3.6rem; height: 3.6rem; border: 1px solid rgba(238,193,126,.42); border-radius: 50%; background: radial-gradient(circle, rgba(238,193,126,.18), rgba(238,193,126,.04)); color: #f3c989; place-items: center; }
.community-heading p { margin: 0 0 .4rem; color: #d6ad75; font-family: var(--font-mono); font-size: .62rem; letter-spacing: .16em; }
.community-heading h3 { margin: 0; font-family: var(--font-display); font-size: clamp(1.35rem, 6vw, 1.75rem); letter-spacing: .06em; }
.community-heading span { display: block; margin-top: .55rem; color: var(--color-text-muted); font-size: .86rem; line-height: 1.6; }
.group-number { display: grid; width: min(100%, 25rem); gap: .25rem; padding: .85rem 1rem; border: 1px solid rgba(238,193,126,.3); border-radius: .9rem; background: rgba(238,193,126,.075); }
.group-number small { color: #d6ad75; font-size: .72rem; letter-spacing: .14em; }
.group-number strong { color: #fff4df; font-family: var(--font-mono); font-size: clamp(1.65rem, 9vw, 2.2rem); letter-spacing: .08em; line-height: 1.1; user-select: all; }
.community-actions { display: grid; width: min(100%, 25rem); gap: .6rem; grid-template-columns: 1fr 1fr; }
.community-actions button,
.community-actions a { display: flex; min-height: 3rem; align-items: center; justify-content: center; gap: .5rem; padding: .65rem .8rem; border-radius: .7rem; font-size: .86rem; font-weight: 650; text-decoration: none; touch-action: manipulation; }
.qq-action { border: 1px solid rgba(239,185,205,.55); background: rgba(143,61,91,.78); color: #fff; }
.copy-action { border: 1px solid rgba(238,193,126,.32); background: rgba(238,193,126,.08); color: #f5d6a7; }
.community-actions button:active,
.community-actions a:active { opacity: .78; }
.community-actions button:focus-visible,
.community-actions a:focus-visible { outline: 2px solid #fff1d9; outline-offset: 3px; }
.join-guide { margin: -.15rem 0 0; color: var(--color-text-muted); font-size: .74rem; line-height: 1.55; }
.copy-status { display: flex; min-height: 1.5rem; align-items: center; justify-content: center; gap: .35rem; margin: -.4rem 0 0; color: #f1cca0; font-size: .74rem; }
.group-qr { display: grid; width: min(100%, 17rem); gap: .55rem; margin: .15rem 0 0; }
.group-qr img { width: 100%; height: auto; border: 1px solid rgba(255,255,255,.12); border-radius: .8rem; background: #222; }
.group-qr figcaption { color: var(--color-text-muted); font-size: .72rem; }

@media (max-width: 380px) {
  .community-actions { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .group-qr { display: none; }
}
</style>
