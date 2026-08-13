<script setup lang="ts">
import { ChevronLeft, ChevronRight, MoreHorizontal, Signal, Users } from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'

import { characters } from '@/content/characters'
import { getActor } from '@/content/storyActors'
import { getSpriteAsset } from '@/content/sprites'
import { storyById } from '@/content/story'
import { renderText } from '@/engine/state'

import type { GameState, HistoryEntry, SceneUiSkin, SpriteCue, StoryChoice, StoryNode } from '@/engine/types'

const props = defineProps<{
  node: StoryNode
  state: GameState
  history: HistoryEntry[]
  visibleText: string
  revealComplete: boolean
  canAdvance: boolean
  choices: StoryChoice[]
  sprites: SpriteCue[]
  ui: Extract<SceneUiSkin, 'private-chat' | 'group-chat' | 'world-chat'>
}>()

const emit = defineEmits<{
  interact: []
  choose: [choiceId: string]
}>()

const messageList = ref<HTMLElement | null>(null)
const isReviewingHistory = ref(false)
const bottomTolerance = 32

const previousMessages = computed(() => props.history
  .filter((entry) => entry.nodeId !== props.node.id)
  .filter((entry) => {
    const previousNode = storyById[entry.nodeId]
    return previousNode?.mode === 'chat' && previousNode.location === props.node.location
  })
  .slice(-5))

const currentCharacter = computed(() => getActor(props.node.speaker))
const currentName = computed(() => props.node.speaker === 'player'
  ? props.state.playerName
  : currentCharacter.value.name)
const currentAvatar = computed(() => currentCharacter.value.avatar)
// Explicit story cues become a cinematic chat header; ordinary chats retain the compact phone layout.
const featuredCue = computed(() => (
  props.sprites.find((cue) => cue.character === props.node.speaker) ?? props.sprites[0]
))
const featuredCharacter = computed(() => (
  featuredCue.value ? characters[featuredCue.value.character] : undefined
))
const featuredAsset = computed(() => {
  const cue = featuredCue.value
  return cue ? getSpriteAsset(cue.character, cue.expression, cue.pose) : undefined
})
const channelLabel = computed(() => ({
  'private-chat': '私聊',
  'group-chat': '组织群',
  'world-chat': '4945 · 世界频道',
}[props.ui]))

const avatarFor = (speaker: HistoryEntry['speaker']) => getActor(speaker).avatar

const isNearLatestMessage = (element: HTMLElement) => (
  element.scrollHeight - element.scrollTop - element.clientHeight <= bottomTolerance
)

// Typing follows the latest bubble until the player deliberately scrolls up to reread.
const handleMessageScroll = () => {
  const element = messageList.value
  if (!element) return
  isReviewingHistory.value = !isNearLatestMessage(element)
}

const scrollToLatestMessage = async (force = false) => {
  if (force) isReviewingHistory.value = false
  await nextTick()

  const element = messageList.value
  if (!element || (!force && isReviewingHistory.value)) return
  element.scrollTop = element.scrollHeight
}

const historyRevision = computed(() => {
  const latest = props.history.at(-1)
  return [
    props.history.length,
    latest?.nodeId ?? '',
    latest?.choiceLabel ?? '',
    latest?.timestamp ?? 0,
  ].join(':')
})

const chooseReply = (choiceId: string) => {
  // A reply starts a new conversational beat, so it intentionally exits history review.
  isReviewingHistory.value = false
  emit('choose', choiceId)
  void scrollToLatestMessage(true)
}

watch(() => props.node.id, () => { void scrollToLatestMessage(true) }, { immediate: true })
watch(historyRevision, () => { void scrollToLatestMessage(true) })
watch(() => props.visibleText, () => { void scrollToLatestMessage() })

// ChatStage owns every chat interaction so no second dialogue or choice layer competes with the phone.
</script>

<template>
  <section class="chat-stage" :class="`skin-${ui}`" aria-label="剧中聊天界面">
    <div class="phone-shell" :class="{ 'has-featured-character': featuredAsset }" @click="emit('interact')">
      <header @click.stop>
        <ChevronLeft class="header-ornament" :size="21" aria-hidden="true" focusable="false" />
        <div>
          <strong>{{ node.location || channelLabel }}</strong>
          <span><i />{{ channelLabel }} · 在线</span>
        </div>
        <Users
          v-if="ui !== 'private-chat'"
          class="header-ornament"
          :size="20"
          aria-hidden="true"
          focusable="false"
        />
        <MoreHorizontal
          v-else
          class="header-ornament"
          :size="21"
          aria-hidden="true"
          focusable="false"
        />
      </header>

      <div
        v-if="featuredAsset && featuredCue && featuredCharacter"
        class="featured-character"
        :style="{ '--featured-color': featuredCharacter.color }"
        aria-label="聊天角色演出"
      >
        <div>
          <small>SCENE CHARACTER</small>
          <strong>{{ featuredCharacter.name }}</strong>
        </div>
        <img
          :src="featuredAsset"
          :alt="`${featuredCharacter.name}${featuredCue.expression ?? 'neutral'}表情聊天演出立绘`"
        />
      </div>

      <div ref="messageList" class="message-list" @scroll.passive="handleMessageScroll">
        <template
          v-for="message in previousMessages"
          :key="`${message.nodeId}:${message.timestamp}`"
        >
          <article class="message" :class="{ self: message.speaker === 'player' }">
            <img v-if="avatarFor(message.speaker)" :src="avatarFor(message.speaker)" alt="" />
            <span v-else class="avatar-fallback">{{ message.speakerName.slice(0, 1) }}</span>
            <div>
              <small>{{ message.speakerName }}</small>
              <p>{{ message.text }}</p>
            </div>
          </article>
          <article v-if="message.choiceLabel" class="message self selected-reply">
            <span class="avatar-fallback">{{ state.playerName.slice(0, 1) }}</span>
            <div>
              <small>{{ state.playerName }}</small>
              <p>{{ message.choiceLabel }}</p>
            </div>
          </article>
        </template>

        <article class="message current" :class="{ self: node.speaker === 'player' }">
          <img v-if="currentAvatar" :src="currentAvatar" alt="" />
          <span v-else class="avatar-fallback">{{ currentName.slice(0, 1) }}</span>
          <div>
            <small>{{ currentName }}</small>
            <p>{{ visibleText }}<i v-if="!revealComplete" class="typing-dot" /></p>
          </div>
        </article>
        <p v-if="revealComplete" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {{ currentName }}：{{ renderText(node.text, state) }}
        </p>
      </div>

      <footer class="composer" @click.stop>
        <div v-if="revealComplete && choices.length" class="reply-list" aria-label="选择回复">
          <button
            v-for="choice in choices"
            :key="choice.id"
            type="button"
            @click="chooseReply(choice.id)"
          >
            <span>{{ renderText(choice.label, state) }}</span><ChevronRight :size="17" />
          </button>
        </div>
        <button v-else-if="revealComplete && canAdvance" class="continue-message" type="button" @click="emit('interact')">
          <span>继续</span><ChevronRight :size="17" />
        </button>
        <div v-else class="typing-placeholder">
          <span>{{ revealComplete ? '等待新消息……' : '消息正在输入……' }}</span><Signal :size="16" />
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.chat-stage {
  position: absolute;
  z-index: 4;
  top: max(4.6rem, calc(env(safe-area-inset-top) + 3.8rem));
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(3.2rem, calc(env(safe-area-inset-bottom) + 3rem));
  left: max(1rem, env(safe-area-inset-left));
  display: grid;
  place-items: center;
  pointer-events: none;
}
.phone-shell {
  display: grid;
  width: min(100%, 42rem);
  min-width: 0;
  height: 100%;
  min-height: 0;
  max-height: 40rem;
  overflow: hidden;
  border: 1px solid rgba(84, 48, 69, .24);
  border-radius: 1.45rem;
  background: linear-gradient(180deg, rgba(255, 250, 248, .97), rgba(249, 238, 238, .96));
  color: #402d39;
  box-shadow: 0 1.7rem 4rem rgba(30, 13, 28, .42);
  grid-template-rows: auto minmax(0, 1fr) auto;
  pointer-events: auto;
}
.phone-shell.has-featured-character {
  grid-template-rows: auto minmax(7.5rem, 28%) minmax(0, 1fr) auto;
}
.featured-character {
  --featured-color: #cf9db1;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid color-mix(in srgb, var(--featured-color) 28%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--featured-color) 22%, #211725), rgba(31, 22, 35, .52) 55%, rgba(18, 15, 27, .82)),
    radial-gradient(circle at 72% 35%, color-mix(in srgb, var(--featured-color) 35%, transparent), transparent 58%);
}
.featured-character::after {
  position: absolute;
  inset: auto 0 0;
  height: 36%;
  background: linear-gradient(transparent, rgba(25, 17, 28, .72));
  content: '';
}
.featured-character > div {
  position: absolute;
  z-index: 2;
  left: 1rem;
  bottom: .75rem;
  display: grid;
  color: white;
  text-shadow: 0 .15rem .5rem rgba(20, 10, 18, .72);
}
.featured-character small { color: rgba(255,255,255,.64); font-family: var(--font-mono); font-size: .58rem; letter-spacing: .12em; }
.featured-character strong { font-family: var(--font-display); font-size: 1rem; }
.featured-character img {
  position: absolute;
  z-index: 1;
  top: -8%;
  right: -1%;
  width: 54%;
  height: 245%;
  object-fit: contain;
  object-position: center top;
  filter: drop-shadow(0 .8rem 1.2rem rgba(18, 8, 16, .46));
}
header {
  display: grid;
  min-width: 0;
  min-height: 3.65rem;
  align-items: center;
  gap: .65rem;
  padding: .62rem .8rem;
  border-bottom: 1px solid rgba(89, 49, 72, .12);
  background: rgba(255,255,255,.72);
  grid-template-columns: auto 1fr auto;
}
header > div { display: grid; min-width: 0; }
header .header-ornament {
  color: rgba(95, 67, 84, .48);
  pointer-events: none;
  user-select: none;
}
header strong { overflow: hidden; font-size: .9rem; text-overflow: ellipsis; white-space: nowrap; }
header span { color: #927487; font-size: .65rem; }
header span i { display: inline-block; width: .42rem; height: .42rem; margin-right: .28rem; border-radius: 50%; background: #70b997; }
.message-list {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: .6rem;
  overflow: hidden auto;
  padding: .8rem;
  overflow-anchor: none;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}
.message-list::before { flex: 0 0 auto; margin-top: auto; content: ''; }
.message { display: flex; min-width: 0; max-width: 88%; flex: 0 0 auto; align-items: flex-start; gap: .5rem; }
.message > img,
.avatar-fallback { width: 2rem; height: 2rem; flex: 0 0 auto; border-radius: .55rem; object-fit: cover; }
.avatar-fallback { display: grid; background: #cf9db1; color: white; font-weight: 700; place-items: center; }
.message > div { display: grid; min-width: 0; gap: .18rem; }
.message small { padding-left: .18rem; color: #94788a; font-size: .62rem; }
.message p {
  margin: 0;
  padding: .52rem .68rem;
  border: 1px solid rgba(92, 54, 75, .11);
  border-radius: .25rem .85rem .85rem .85rem;
  background: white;
  font-size: .82rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
  box-shadow: 0 .25rem .75rem rgba(56, 28, 45, .07);
}
.message.self { align-self: flex-end; flex-direction: row-reverse; }
.message.self small { text-align: right; }
.message.self p { border-radius: .85rem .25rem .85rem .85rem; background: #f8d9e3; }
.message.current p { border-color: rgba(193, 91, 130, .28); box-shadow: 0 .35rem 1rem rgba(130, 61, 91, .12); }
.skin-world-chat .phone-shell { background: linear-gradient(180deg, rgba(244, 246, 255, .97), rgba(232, 235, 249, .97)); }
.skin-world-chat .message.self p { background: #d9e2fb; }
.typing-dot { display: inline-block; width: .34rem; height: .34rem; margin-left: .3rem; border-radius: 50%; background: #c05f87; animation: pulse .8s infinite alternate; }
.composer { min-width: 0; max-width: 100%; padding: .55rem .7rem; overflow: hidden; border-top: 1px solid rgba(89,49,72,.12); background: rgba(255,255,255,.78); }
.reply-list { display: grid; min-width: 0; max-width: 100%; max-height: 12.5rem; gap: .4rem; overflow: auto; overscroll-behavior: contain; }
.reply-list button,
.continue-message {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 2.9rem;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .55rem .7rem;
  border: 1px solid rgba(177,81,119,.25);
  border-radius: .72rem;
  background: linear-gradient(105deg, #fff, #fae9ef);
  color: #533746;
  text-align: left;
}
.reply-list button:hover, .reply-list button:focus-visible, .continue-message:hover { border-color: #c46388; background: #f8dbe5; }
.reply-list span, .continue-message span { min-width: 0; font-size: .8rem; line-height: 1.45; overflow-wrap: anywhere; }
.typing-placeholder { display: flex; min-height: 2.7rem; align-items: center; justify-content: space-between; padding: .45rem .6rem; border-radius: .72rem; background: rgba(88,51,72,.06); color: #a88c9d; font-size: .72rem; }
@keyframes pulse { to { opacity: .25; } }

@media (prefers-reduced-motion: reduce) {
  .typing-dot { animation: none; opacity: .55; }
}

@media (max-width: 600px) and (orientation: portrait) {
  .chat-stage {
    top: max(4.2rem, calc(env(safe-area-inset-top) + 3.65rem));
    right: max(.55rem, env(safe-area-inset-right));
    bottom: max(3.1rem, calc(env(safe-area-inset-bottom) + 3rem));
    left: max(.55rem, env(safe-area-inset-left));
    align-items: stretch;
  }
  .phone-shell { max-height: none; border-radius: 1.1rem; }
  .message-list { padding: .65rem; }
  .message { max-width: 94%; }
  .message p { font-size: .8rem; }
  .reply-list { max-height: 10.5rem; }
  .phone-shell.has-featured-character { grid-template-rows: auto minmax(7.8rem, 27%) minmax(0, 1fr) auto; }
  .featured-character img { right: -6%; width: 64%; height: 235%; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .chat-stage {
    top: max(3.15rem, calc(env(safe-area-inset-top) + 3rem));
    right: max(9.5rem, calc(env(safe-area-inset-right) + 9rem));
    bottom: max(2.75rem, calc(env(safe-area-inset-bottom) + 2.75rem));
    left: max(1rem, calc(env(safe-area-inset-left) + .75rem));
  }
  .phone-shell { max-height: none; border-radius: 1rem; }
  header { min-height: 2.7rem; padding: .35rem .65rem; }
  .message-list { gap: .38rem; padding: .48rem .65rem; }
  .message > img, .avatar-fallback { width: 1.65rem; height: 1.65rem; }
  .message p { padding: .38rem .55rem; font-size: .7rem; }
  .composer { padding: .35rem .5rem; }
  .reply-list { max-height: 8rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .reply-list button { min-height: 2.75rem; }
}
</style>
