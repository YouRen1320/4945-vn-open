<script setup lang="ts">
import { BookOpen, Heart, Images, LogOut, Play, RotateCcw, Save, Settings as SettingsIcon, UserRound } from '@lucide/vue'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

import BaseModal from '@/components/BaseModal.vue'
import CollectionPanel from '@/components/CollectionPanel.vue'
import CommunityGroupPanel from '@/components/CommunityGroupPanel.vue'
import GameShell from '@/components/GameShell.vue'
import GoldenSlicePanel from '@/components/GoldenSlicePanel.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import OutcomeArchivePanel from '@/components/OutcomeArchivePanel.vue'
import ReleaseNotesPanel from '@/components/ReleaseNotesPanel.vue'
import RomancePanel from '@/components/RomancePanel.vue'
import SaveLoadPanel from '@/components/SaveLoadPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import SetupScreen from '@/components/SetupScreen.vue'
import StartScreen from '@/components/StartScreen.vue'
import StatusPanel from '@/components/StatusPanel.vue'
import ChapterReplayPanel from '@/components/ChapterReplayPanel.vue'
import Season2Panel from '@/components/Season2Panel.vue'
import Season3Panel from '@/components/Season3Panel.vue'
import SupplementPanel from '@/components/SupplementPanel.vue'
import TitleExtrasPanel from '@/components/TitleExtrasPanel.vue'
import { isSeason1RouteEnding } from '@/content/endingRegistry'
import { currentReleaseNotes } from '@/content/releaseNotes'
import { isSeason2Complete } from '@/content/season2/registry'
import { isSeason3Complete } from '@/content/season3/registry'
import { audioDirector } from '@/engine/audio'
import { importSave } from '@/engine/storage'
import { useGameStore } from '@/stores/game'

import type { GameSetup } from '@/engine/types'
import type { SaveSlot } from '@/engine/storage'
import type { ReplayCheckpoint, ReplayContext } from '@/engine/replay'

type Screen = 'title' | 'setup' | 'game'
type Panel = 'menu' | 'history' | 'saves' | 'status' | 'romance' | 'settings' | 'collection' | 'releaseNotes' | 'community' | 'chapterReplay' | 'supplement' | 'goldenSlice' | 'outcomeArchive' | 'season2' | 'season3' | 'titleExtras' | null

const RELEASE_NOTES_SEEN_KEY = '4945-vn:release-notes-seen'

const readSeenReleaseNotesVersion = () => {
  if (typeof window === 'undefined') return null
  try { return window.localStorage.getItem(RELEASE_NOTES_SEEN_KEY) }
  catch { return null }
}

const store = useGameStore()
const screen = ref<Screen>('title')
const panel = ref<Panel>(null)
const toast = ref('')
const online = ref(navigator.onLine)
const seenReleaseNotesVersion = ref(readSeenReleaseNotesVersion())
const collectionLightboxOpen = ref(false)
let toastTimer: number | null = null
const releaseNotesUnread = computed(() => seenReleaseNotesVersion.value !== currentReleaseNotes.version)
// 章节回放入口：全局收藏存在任一组织结局后显示（SOL-PLAN §5.4）。
const hasChapterReplay = computed(() =>
  store.collection.unlockedEndings.some((id) => isSeason1RouteEnding(id)))
// 事件一补遗入口：与章节回放同一解锁条件（完成任一组织结局后显示）。
const hasSupplement = hasChapterReplay
// 黄金样板是显式 URL 开关的内部入口，普通标题页和正式发布导航均不会展示。
const hasGoldenSlicePreview = computed(() =>
  new URLSearchParams(window.location.search).get('preview') === 'golden-slice')
// 已完成事件二的 v5 档仍展示在进度中心，但不再充当标题页“继续主线”的目标。
const resumableSeason2Saves = computed(() => store.season2Saves.filter((save) => (
  !isSeason2Complete(save.episodeCompletion)
)))
const resumableSeason3Saves = computed(() => store.season3Saves.filter((save) => (
  !isSeason3Complete(save.episodeCompletion)
)))
// v5 未完成进度优先于旧的 v4 自动档；事件一传承时会删除 stale auto，避免误退回片尾。
const canContinueMainline = computed(() => store.hasAutoSave || resumableSeason2Saves.value.length > 0 || resumableSeason3Saves.value.length > 0)

const modalTitle = computed(() => ({
  menu: '暂停菜单', history: '历史记录', saves: '存档记录', status: '玩家与组织',
  romance: '羁绊 · 幻想夜市', settings: '设置', collection: '鉴赏', releaseNotes: '本次更新',
  community: '加入4945区区群', chapterReplay: '章节回放', supplement: '事件一补遗',
  goldenSlice: '剧情黄金样板 · 内测',
  outcomeArchive: '多季结局档案', season2: '主线进度 · 事件一与事件二', season3: '主线进度 · 事件三', titleExtras: '更多内容',
}[panel.value ?? 'menu']))

const notify = (message: string) => {
  toast.value = message
  if (toastTimer !== null) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toast.value = '' }, 2400)
}

const startGame = (setup: GameSetup) => {
  store.start(setup)
  audioDirector.unlock(store.settings)
  screen.value = 'game'
}

const continueMainline = () => {
  try {
    const latestEventThree = [...resumableSeason3Saves.value].sort((a, b) => b.savedAt - a.savedAt)[0]
    if (latestEventThree) {
      store.loadSeason3(latestEventThree.slot)
      screen.value = 'game'
      return
    }
    const latestEventTwo = [...resumableSeason2Saves.value].sort((a, b) => b.savedAt - a.savedAt)[0]
    if (latestEventTwo) {
      store.loadSeason2(latestEventTwo.slot)
      screen.value = 'game'
      return
    }
    store.continueAutoSave()
    screen.value = 'game'
  } catch (error) {
    notify(error instanceof Error ? error.message : '读取失败')
  }
}

const saveGame = (slot: SaveSlot) => {
  try { store.save(slot); notify('记录已保存') }
  catch (error) { notify(error instanceof Error ? error.message : '保存失败') }
}

const loadGame = (slot: SaveSlot) => {
  try {
    store.load(slot)
    screen.value = 'game'
    panel.value = null
    notify('记录已读取')
  } catch (error) {
    notify(error instanceof Error ? error.message : '读取失败')
  }
}

const importGame = (slot: SaveSlot, raw: string) => {
  try {
    if (store.inReplay) throw new Error('回放中不能导入或修改正式存档。')
    importSave(raw, slot); store.refreshSaves(); notify(`已导入记录 ${slot}`)
  }
  catch (error) { notify(error instanceof Error ? error.message : '导入失败') }
}

const returnToTitle = () => {
  if (store.inSeason2 || store.inSeason3) {
    // 事件二/三返回标题前先落独立存档，保证主线可续玩（store.returnToTitle 已处理）。
    store.returnToTitle()
  } else {
    if (store.inReplay) store.exitReplay()
    else if (store.state) store.save('auto')
    store.returnToTitle()
  }
  panel.value = null
  screen.value = 'title'
}

const openPanel = (value: Exclude<Panel, null>) => { panel.value = value }
// 主线进度始终进入统一中心；无旧档玩家也需要在这里看到事件二回顾建档入口。
const openMainlineProgress = () => { panel.value = 'season2' }
const openReleaseNotes = () => {
  panel.value = 'releaseNotes'
  seenReleaseNotesVersion.value = currentReleaseNotes.version
  // Opening the changelog marks only this release as read; storage failures remain non-blocking.
  try { window.localStorage.setItem(RELEASE_NOTES_SEEN_KEY, currentReleaseNotes.version) }
  catch { /* Private browsing may deny storage while the panel remains usable. */ }
}
const startRomanceEpisode = (episodeId: string) => {
  try {
    store.startRomanceEpisode(episodeId)
    panel.value = null
  } catch (error) {
    notify(error instanceof Error ? error.message : '暂时无法赴约')
  }
}
const startRomanceReplay = (episodeId: string) => {
  try {
    store.startRomanceReplay(episodeId)
    panel.value = null
  } catch (error) {
    notify(error instanceof Error ? error.message : '暂时无法重温这段回忆')
  }
}
const exitRomanceReplay = () => {
  if (store.cancelRomanceReplay()) notify('已退出关系回忆，当前存档保持不变')
  panel.value = null
}
const startChapterReplay = (checkpoint: ReplayCheckpoint, context: ReplayContext) => {
  try {
    store.startChapterReplay(checkpoint, context)
    lastReplayPanel.value = 'chapterReplay'
    panel.value = null
    screen.value = 'game'
  } catch (error) {
    notify(error instanceof Error ? error.message : '暂时无法开始章节回放')
  }
}
const startSupplementReplay = (checkpoint: ReplayCheckpoint, context: ReplayContext) => {
  try {
    store.startSupplementReplay(checkpoint, context)
    lastReplayPanel.value = 'supplement'
    panel.value = null
    screen.value = 'game'
  } catch (error) {
    notify(error instanceof Error ? error.message : '暂时无法开始事件一补遗')
  }
}
const startGoldenSliceReplay = (checkpoint: ReplayCheckpoint, context: ReplayContext) => {
  try {
    store.startGoldenSliceReplay(checkpoint, context)
    lastReplayPanel.value = 'goldenSlice'
    panel.value = null
    screen.value = 'game'
  } catch (error) {
    notify(error instanceof Error ? error.message : '暂时无法开始黄金样板试玩')
  }
}
// ── 主线事件二入口（内部仍沿用 v5/season2 标识以兼容现有存档） ──
const startS2 = (params: Parameters<typeof store.startSeason2>[0]) => {
  try {
    store.startSeason2(params)
    panel.value = null
    screen.value = 'game'
  } catch (error) {
    notify(error instanceof Error ? error.message : '无法开始事件二')
  }
}
const continueS2 = (slot: Parameters<typeof store.loadSeason2>[0]) => {
  try {
    store.loadSeason2(slot)
    panel.value = null
    screen.value = 'game'
  } catch (error) {
    notify(error instanceof Error ? error.message : '无法继续事件二')
  }
}
const playS2Episode = (slot: Parameters<typeof store.playSeason2Episode>[0], episodeId: string) => {
  try {
    store.playSeason2Episode(slot, episodeId)
    panel.value = null
    screen.value = 'game'
  } catch (error) {
    notify(error instanceof Error ? error.message : '无法进入该集')
  }
}
const startS3 = (params: Parameters<typeof store.startSeason3>[0]) => {
  try { store.startSeason3(params); panel.value = null; screen.value = 'game' }
  catch (error) { notify(error instanceof Error ? error.message : '无法开始事件三') }
}
const startS3Recap = (params: Parameters<typeof store.startSeason3Recap>[0]) => {
  try { store.startSeason3Recap(params); panel.value = null; screen.value = 'game' }
  catch (error) { notify(error instanceof Error ? error.message : '无法建立事件三回顾档') }
}
const continueS3 = (slot: Parameters<typeof store.loadSeason3>[0]) => {
  try { store.loadSeason3(slot); panel.value = null; screen.value = 'game' }
  catch (error) { notify(error instanceof Error ? error.message : '无法继续事件三') }
}

// 回放期统一退出：导航交给下面的 inReplay 监听；这里负责清场与提示。
const exitReplay = () => {
  // 事件二返回标题需先落 v5 存档，不能走纯沙盒退出。
  if (store.inSeason2 || store.inSeason3) {
    store.returnToTitle()
    notify(`已保存${store.inSeason3 ? '事件三' : '事件二'}进度并返回标题`)
    panel.value = null
    screen.value = 'title'
    return
  }
  const wasChapter = store.inChapterReplay
  const wasSupplement = store.inSupplementReplay
  const wasGoldenSlice = store.inGoldenSliceReplay
  if (store.exitReplay()) {
    notify(
      wasSupplement
        ? '已退出事件一补遗，回到补遗列表'
        : wasGoldenSlice
          ? '已退出黄金样板，回到内测入口'
        : wasChapter
          ? '已退出章节回放，回到章节选择'
          : '已退出关系回忆，当前存档保持不变',
    )
  }
  panel.value = null
}
// 回放正常结束（抵达季终 / 补遗返回哨兵）或主动退出后，回到对应回放列表；刷新则回到标题页（内存回放清除）。
const lastReplayPanel = ref<Panel>(null)
// 事件二激活时标记落地页，使章节完成后回到主线进度中心而非标题页。
watch(() => store.inSeason2, (v) => { if (v) lastReplayPanel.value = 'season2' })
watch(() => store.inSeason3, (v) => { if (v) lastReplayPanel.value = 'season3' })
watch(() => store.inReplay, (now, prev) => {
  if (prev && !now && screen.value === 'game') {
    screen.value = 'title'
    panel.value = lastReplayPanel.value
  }
})
const connectivity = () => { online.value = navigator.onLine }

// A teleported CG viewer temporarily owns modal semantics; reset the bridge whenever its gallery closes.
watch(panel, (value) => {
  if (value !== 'collection') collectionLightboxOpen.value = false
})

onMounted(() => {
  window.addEventListener('online', connectivity)
  window.addEventListener('offline', connectivity)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', connectivity)
  window.removeEventListener('offline', connectivity)
  if (toastTimer !== null) window.clearTimeout(toastTimer)
})

// App 只编排标题、建档、游戏和全局面板；剧情状态与持久化保持在 store/engine 边界内。
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>

  <StartScreen
    v-if="screen === 'title'"
    :can-continue="canContinueMainline"
    @start="screen = 'setup'"
    @continue="continueMainline"
    @progress="openMainlineProgress"
    @community="openPanel('community')"
    @more="openPanel('titleExtras')"
  />
  <SetupScreen v-else-if="screen === 'setup'" @back="screen = 'title'" @confirm="startGame" />
  <GameShell
    v-else
    :paused="Boolean(panel)"
    @open="openPanel"
    @title="returnToTitle"
    @toast="notify"
  />

  <div class="network-pill" :class="{ offline: !online }" aria-live="polite">
    <i />{{ online ? '在线' : '离线模式' }}
  </div>

  <Transition name="toast">
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </Transition>

  <BaseModal
    v-if="panel"
    :title="modalTitle"
    :wide="panel === 'saves' || panel === 'collection' || panel === 'romance' || panel === 'season2' || panel === 'season3'"
    :obscured="panel === 'collection' && collectionLightboxOpen"
    :mobile-sheet="panel === 'community'"
    @close="panel = null"
  >
    <div v-if="panel === 'menu'" class="pause-menu">
      <button type="button" @click="panel = null"><Play :size="20" />继续游戏</button>
      <button v-if="store.inChapterReplay || store.inSupplementReplay || store.inGoldenSliceReplay" type="button" @click="exitReplay"><RotateCcw :size="20" />退出当前回放</button>
      <button v-else-if="!store.inRomanceReplay" type="button" @click="saveGame('quick')"><Save :size="20" />快速保存</button>
      <button v-else type="button" @click="exitRomanceReplay"><RotateCcw :size="20" />退出关系回忆</button>
      <button v-if="!store.inReplay" type="button" @click="panel = 'saves'"><BookOpen :size="20" />存档与读取</button>
      <button v-if="!store.inRomanceScene && !store.inChapterReplay && !store.inSupplementReplay && !store.inGoldenSliceReplay" type="button" @click="panel = 'romance'">
        <Heart :size="20" />
        羁绊与约会
        <span v-if="store.hasRomanceInvitation" class="invite-dot">新邀约</span>
      </button>
      <button v-if="!store.inRomanceScene" type="button" @click="panel = 'status'"><UserRound :size="20" />玩家与组织</button>
      <button type="button" @click="panel = 'collection'"><Images :size="20" />鉴赏</button>
      <button type="button" @click="panel = 'settings'"><SettingsIcon :size="20" />设置</button>
      <button v-if="store.inSeason2 || store.inSeason3" class="danger" type="button" @click="returnToTitle"><LogOut :size="20" />保存并返回标题</button>
      <button v-else-if="store.inReplay" class="danger" type="button" @click="exitReplay"><LogOut :size="20" />退出回放</button>
      <button v-else class="danger" type="button" @click="returnToTitle"><LogOut :size="20" />保存并返回标题</button>
    </div>

    <CommunityGroupPanel v-else-if="panel === 'community'" />
    <TitleExtrasPanel
      v-else-if="panel === 'titleExtras'"
      :has-chapter-replay="hasChapterReplay"
      :has-supplement="hasSupplement"
      :has-golden-slice-preview="hasGoldenSlicePreview"
      :release-notes-unread="releaseNotesUnread"
      @chapter-replay="panel = 'chapterReplay'"
      @supplement="panel = 'supplement'"
      @golden-slice="panel = 'goldenSlice'"
      @outcome-archive="panel = 'outcomeArchive'"
      @collection="panel = 'collection'"
      @settings="panel = 'settings'"
      @release-notes="openReleaseNotes"
    />
    <HistoryPanel v-else-if="panel === 'history' && store.state" :entries="store.state.history" />
    <SaveLoadPanel
      v-else-if="panel === 'saves'"
      :in-game="screen === 'game'"
      @save="saveGame"
      @load="loadGame"
      @imported="importGame"
      @deleted="store.refreshSaves"
    />
    <StatusPanel v-else-if="panel === 'status' && store.state" :state="store.state" />
    <p v-else-if="panel === 'status'" class="empty-panel">开始游戏后可查看玩家与组织状态。</p>
    <RomancePanel
      v-else-if="panel === 'romance' && store.state"
      :state="store.state"
      @start="startRomanceEpisode"
      @replay="startRomanceReplay"
    />
    <ChapterReplayPanel
      v-else-if="panel === 'chapterReplay'"
      @start="startChapterReplay"
      @back="panel = null"
    />
    <SupplementPanel
      v-else-if="panel === 'supplement'"
      @start="startSupplementReplay"
      @back="panel = null"
    />
    <GoldenSlicePanel
      v-else-if="panel === 'goldenSlice'"
      @start="startGoldenSliceReplay"
      @back="panel = null"
    />
    <p v-else-if="panel === 'romance'" class="empty-panel">开始游戏后，羁绊与邀约会记录在这里。</p>
    <SettingsPanel
      v-else-if="panel === 'settings'"
      :settings="store.settings"
      @update="store.updateSettings"
      @reset="store.resetSettings"
    />
    <CollectionPanel
      v-else-if="panel === 'collection'"
      :seen-nodes="store.collection.seenNodes"
      :unlocked-cgs="store.collection.unlockedCgs"
      :unlocked-endings="store.collection.unlockedEndings"
      @lightbox-change="collectionLightboxOpen = $event"
    />
    <ReleaseNotesPanel v-else-if="panel === 'releaseNotes'" />
    <OutcomeArchivePanel v-else-if="panel === 'outcomeArchive'" />
    <Season2Panel
      v-else-if="panel === 'season2'"
      @start="startS2"
      @continue="continueS2"
      @play-episode="playS2Episode"
      @open-season3="panel = 'season3'"
      @open-event-one-saves="panel = 'saves'"
      @back="panel = null"
    />
    <Season3Panel
      v-else-if="panel === 'season3'"
      @start="startS3"
      @start-recap="startS3Recap"
      @continue="continueS3"
      @back="panel = 'season2'"
    />
  </BaseModal>
</template>

<style scoped>
.network-pill { position: fixed; z-index: 30; right: max(.65rem, env(safe-area-inset-right)); top: max(.5rem, env(safe-area-inset-top)); display: none; align-items: center; gap: .35rem; padding: .25rem .5rem; border-radius: 1rem; background: rgba(4,6,20,.56); color: var(--color-text-muted); font-size: .62rem; backdrop-filter: blur(8px); pointer-events: none; }
.network-pill.offline { display: flex; color: var(--color-accent); }
.network-pill i { width: .42rem; height: .42rem; border-radius: 50%; background: currentColor; }
.toast { position: fixed; z-index: 200; right: 50%; bottom: max(5rem, calc(env(safe-area-inset-bottom) + 4.5rem)); min-width: 10rem; padding: .7rem 1rem; border: 1px solid rgba(232,188,120,.35); border-radius: 2rem; background: rgba(8,11,32,.94); color: var(--color-text); font-size: .82rem; text-align: center; box-shadow: 0 15px 45px rgba(0,0,0,.45); transform: translateX(50%); backdrop-filter: blur(14px); }
.toast-enter-active, .toast-leave-active { transition: opacity .2s ease, transform .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(50%, .7rem); }
.pause-menu { display: grid; gap: .55rem; }
.pause-menu button { display: flex; min-height: 3.15rem; align-items: center; gap: .75rem; padding: .65rem .85rem; border: 1px solid var(--color-border); border-radius: .75rem; background: rgba(255,255,255,.035); color: var(--color-text); text-align: left; }
.pause-menu button:first-child { border-color: rgba(232,188,120,.4); background: rgba(232,188,120,.08); }
.pause-menu button.danger { margin-top: .5rem; color: var(--color-danger); }
.invite-dot { margin-left: auto; padding: .15rem .45rem; border-radius: 1rem; background: rgba(217,126,159,.18); color: #f3afc7; font-size: .68rem; }
.empty-panel { color: var(--color-text-muted); text-align: center; }
</style>
