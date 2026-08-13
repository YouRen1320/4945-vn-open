<script setup lang="ts">
import { ArrowLeft, ArrowRight, Bell, Check, MessageCircleMore, Send, Wifi } from '@lucide/vue'
import { computed, ref } from 'vue'

import type { GameSetup } from '@/engine/types'

const emit = defineEmits<{ back: []; confirm: [setup: GameSetup] }>()
const step = ref<0 | 1 | 2>(0)
const playerName = ref('')

const nameLength = computed(() => [...playerName.value].length)
const valid = computed(() => nameLength.value <= 12)

const goBack = () => {
  if (step.value === 0) emit('back')
  else step.value = (step.value - 1) as 0 | 1
}

// 建档只收集会真实进入剧情的昵称；其他身份信息留给角色在故事中的行动表达。
const submit = () => {
  if (!valid.value) return
  emit('confirm', { playerName: playerName.value.trim() || '新手' })
}
</script>

<template>
  <main id="main-content" class="setup-screen">
    <div class="setup-bg" aria-hidden="true" />
    <div class="setup-grade" aria-hidden="true" />

    <button class="back" type="button" :aria-label="step === 0 ? '返回标题' : '返回上一条消息'" @click="goBack">
      <ArrowLeft :size="20" />
    </button>

    <section v-if="step === 0" class="notification-stage" aria-labelledby="notification-title">
      <div class="lock-time">
        <strong>23:47</strong>
        <span>7月16日 · 星期四</span>
      </div>
      <button class="notice-card" type="button" @click="step = 1">
        <img src="/assets/avatars/mentor.webp" alt="" />
        <span>
          <small><Bell :size="13" />游戏好友 · 刚刚</small>
          <strong id="notification-title">老朋友发来一条消息</strong>
          <em>“4945，新区。来不来？”</em>
        </span>
        <ArrowRight :size="20" />
      </button>
      <button class="stage-action" type="button" @click="step = 1">
        查看消息 <ArrowRight :size="18" />
      </button>
    </section>

    <section v-else class="chat-stage" aria-labelledby="chat-title">
      <div class="phone-window">
        <div class="phone-status"><span>23:47</span><Wifi :size="14" /><span>86%</span></div>
        <header>
          <img src="/assets/avatars/mentor.webp" alt="老朋友头像" />
          <div><strong id="chat-title">老朋友</strong><small>手机在线</small></div>
          <MessageCircleMore :size="21" />
        </header>

        <div class="message-list">
          <div class="message-day">7月16日 23:47</div>
          <div class="bubble incoming">4945，新区。明天开。</div>
          <div class="bubble incoming">影·银角。来不来？</div>

          <template v-if="step === 1">
            <div class="bubble incoming">先上号，别的进去再说。</div>
            <div class="invite-ticket">
              <span>新区邀请</span>
              <strong>影·银角 · 4945区</strong>
              <small>7月18日开服</small>
            </div>
          </template>

          <template v-else>
            <div class="bubble self"><Check :size="14" /> 已接受邀请</div>
            <div class="bubble incoming">对了，这次准备叫什么？</div>
          </template>
        </div>

        <button v-if="step === 1" class="accept" type="button" @click="step = 2">
          <Check :size="19" />接受邀请
        </button>

        <form v-else class="nickname-composer" @submit.prevent="submit">
          <label for="player-name">这次准备叫什么？</label>
          <div class="composer-row">
            <input
              id="player-name"
              v-model="playerName"
              maxlength="12"
              autocomplete="nickname"
              autofocus
              placeholder="新手"
            />
            <button type="submit" :disabled="!valid" aria-label="进入4945区">
              <Send :size="19" />
            </button>
          </div>
          <small>{{ nameLength }}/12 · 之后会以这个名字出现在聊天和存档里</small>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.setup-screen {
  position: relative;
  display: grid;
  min-height: 100dvh;
  overflow: hidden;
  padding: max(4.5rem, calc(env(safe-area-inset-top) + 4rem)) max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  background: #1e1720;
  place-items: center;
  isolation: isolate;
}
.setup-bg { position: absolute; z-index: -3; inset: -2%; background: url('/assets/cg/invitation-phone-v1.webp') 58% center / cover no-repeat; animation: bg-breathe 18s ease-in-out infinite alternate; }
.setup-grade { position: absolute; z-index: -2; inset: 0; background: linear-gradient(90deg, rgba(22,16,24,.62), rgba(22,16,24,.08) 56%), linear-gradient(0deg, rgba(20,14,22,.72), transparent 52%); }
.back {
  position: fixed;
  z-index: 20;
  top: max(.75rem, env(safe-area-inset-top));
  left: max(1rem, env(safe-area-inset-left));
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgba(255,255,255,.3);
  border-radius: 50%;
  background: rgba(49,29,43,.55);
  color: white;
  place-items: center;
  backdrop-filter: blur(9px);
}
.notification-stage { display: grid; width: min(100%, 32rem); justify-items: center; align-self: start; margin-top: clamp(1rem, 8vh, 5rem); }
.lock-time { display: grid; justify-items: center; margin-bottom: 1.5rem; color: white; text-shadow: 0 .2rem .8rem rgba(0,0,0,.45); }
.lock-time strong { font-family: var(--font-display); font-size: clamp(3rem, 12vw, 5rem); font-weight: 400; line-height: 1; }
.lock-time span { margin-top: .45rem; color: rgba(255,255,255,.76); font-size: .76rem; letter-spacing: .1em; }
.notice-card {
  display: grid;
  width: 100%;
  min-height: 6rem;
  align-items: center;
  gap: .75rem;
  padding: .85rem;
  border: 1px solid rgba(255,255,255,.28);
  border-radius: 1.15rem;
  background: rgba(255,249,247,.9);
  color: #422d39;
  text-align: left;
  box-shadow: 0 1.3rem 3rem rgba(30,14,27,.36);
  backdrop-filter: blur(16px);
  grid-template-columns: auto 1fr auto;
}
.notice-card img { width: 3rem; height: 3rem; border-radius: .85rem; object-fit: cover; }
.notice-card > span { display: grid; min-width: 0; gap: .12rem; }
.notice-card small { display: flex; align-items: center; gap: .3rem; color: #9a7184; font-size: .63rem; }
.notice-card strong { font-size: .9rem; }
.notice-card em { overflow: hidden; color: #755767; font-size: .76rem; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.stage-action, .accept {
  display: flex;
  min-height: 3.1rem;
  align-items: center;
  justify-content: center;
  gap: .55rem;
  border: 1px solid rgba(255,225,232,.36);
  border-radius: 2rem;
  background: rgba(105,49,75,.78);
  color: white;
  box-shadow: 0 .8rem 2rem rgba(34,14,29,.28);
}
.stage-action { min-width: 10rem; margin-top: 1.25rem; }
.chat-stage { width: min(100%, 38rem); }
.phone-window {
  display: grid;
  max-height: min(44rem, calc(100dvh - 5.5rem));
  overflow: hidden;
  border: 1px solid rgba(92,54,74,.2);
  border-radius: 1.55rem;
  background: linear-gradient(180deg, rgba(255,251,248,.98), rgba(248,235,238,.97));
  color: #402d39;
  box-shadow: 0 1.8rem 4.5rem rgba(29,12,26,.44);
  grid-template-rows: auto auto minmax(0, 1fr) auto;
}
.phone-status { display: flex; min-height: 2rem; align-items: center; justify-content: flex-end; gap: .45rem; padding: .35rem .9rem 0; color: #8a6a7b; font-size: .62rem; }
.phone-status span:first-child { margin-right: auto; }
.phone-window > header { display: grid; min-height: 4.1rem; align-items: center; gap: .7rem; padding: .55rem .9rem .8rem; border-bottom: 1px solid rgba(91,53,73,.12); grid-template-columns: auto 1fr auto; }
.phone-window > header img { width: 2.6rem; height: 2.6rem; border-radius: .75rem; object-fit: cover; }
.phone-window > header div { display: grid; }
.phone-window > header strong { font-size: .92rem; }
.phone-window > header small { color: #8f7181; font-size: .63rem; }
.message-list { display: flex; min-height: 16rem; flex-direction: column; gap: .55rem; overflow: auto; padding: .85rem 1rem 1rem; }
.message-day { margin: .15rem auto .35rem; color: #a18493; font-size: .61rem; }
.bubble { display: flex; width: fit-content; max-width: 84%; align-items: center; gap: .3rem; padding: .55rem .7rem; border: 1px solid rgba(94,55,76,.1); background: white; font-size: .82rem; line-height: 1.5; box-shadow: 0 .25rem .8rem rgba(62,31,48,.06); }
.bubble.incoming { border-radius: .25rem .9rem .9rem .9rem; }
.bubble.self { align-self: flex-end; border-radius: .9rem .25rem .9rem .9rem; background: #f4cfdb; color: #725064; }
.invite-ticket { display: grid; gap: .2rem; margin-top: .25rem; padding: .85rem; border: 1px solid rgba(192,90,128,.28); border-left: .24rem solid #c85f83; border-radius: .35rem .9rem .9rem .35rem; background: rgba(255,246,246,.9); }
.invite-ticket span { color: #bd6887; font-size: .62rem; letter-spacing: .1em; }
.invite-ticket strong { font-family: var(--font-display); font-size: 1.08rem; }
.invite-ticket small { color: #937384; font-size: .68rem; }
.accept { margin: .25rem .9rem .9rem; border-radius: .75rem; background: #b55379; }
.nickname-composer { display: grid; gap: .45rem; padding: .75rem .9rem .9rem; border-top: 1px solid rgba(91,53,73,.12); background: rgba(255,255,255,.72); }
.nickname-composer label { color: #755869; font-size: .7rem; font-weight: 600; }
.composer-row { display: grid; gap: .55rem; grid-template-columns: 1fr 3rem; }
.composer-row input { min-width: 0; min-height: 3rem; padding: .65rem .8rem; border: 1px solid rgba(167,83,116,.28); border-radius: .75rem; background: white; color: #402d39; font-size: 1rem; outline: none; }
.composer-row input:focus { border-color: #c85f83; box-shadow: 0 0 0 3px rgba(200,95,131,.12); }
.composer-row button { display: grid; min-height: 3rem; border: 0; border-radius: .75rem; background: #b55379; color: white; place-items: center; }
.composer-row button:disabled { cursor: not-allowed; opacity: .45; }
.nickname-composer > small { color: #9a7b8b; font-size: .61rem; }
@keyframes bg-breathe { to { transform: scale(1.025) translateX(-.25%); } }

@media (max-width: 600px) {
  .setup-screen { align-items: stretch; padding: max(4.2rem, calc(env(safe-area-inset-top) + 3.8rem)) .55rem max(.55rem, env(safe-area-inset-bottom)); }
  .notification-stage { align-self: center; margin-top: 0; }
  .phone-window { height: 100%; max-height: none; border-radius: 1.15rem; }
  .message-list { min-height: 0; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .setup-screen { padding: .45rem 5rem .45rem; }
  .back { top: .45rem; left: .55rem; }
  .notification-stage { align-self: center; margin-top: 0; }
  .lock-time { margin-bottom: .7rem; }
  .lock-time strong { font-size: 2.6rem; }
  .chat-stage { width: min(100%, 42rem); }
  .phone-window { height: calc(100dvh - .9rem); max-height: none; border-radius: 1rem; }
  .message-list { min-height: 0; padding-block: .45rem; }
  .phone-window > header { min-height: 3rem; padding-block: .35rem; }
  .phone-status { min-height: 1.4rem; }
}
</style>
