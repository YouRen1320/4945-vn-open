<script setup lang="ts">
import { Activity, Bell, ChevronRight, Coins, Crown, Shield, Sparkles, Swords, Users } from '@lucide/vue'
import { computed, ref, watch } from 'vue'

import { organizations } from '@/content/organizations'
import {
  organizationDisplayName,
  organizationDisplaySubtitle,
  season2OrganizationNamesPublished,
} from '@/content/season2/augustContinuity'
import { renderText } from '@/engine/state'

import type { GameState, SceneUiSkin, StoryChoice, StoryNode } from '@/engine/types'

const props = defineProps<{
  node: StoryNode
  state: GameState
  visibleText: string
  revealComplete: boolean
  canAdvance: boolean
  choices: StoryChoice[]
  sceneRevision: number
  ui: Extract<SceneUiSkin, 'game-client' | 'organization' | 'reward'>
}>()

const emit = defineEmits<{
  interact: []
  choose: [choiceId: string]
  submitEntry: [value: string]
}>()

const routeOrganization = computed(() => props.state.organization
  ? {
      ...organizations[props.state.organization],
      name: organizationDisplayName(props.state, props.state.organization),
    }
  : null)
const organizationNamesPublished = computed(() => season2OrganizationNamesPublished(props.state))
const progress = computed(() => Math.min(100, Math.max(8, props.state.stats.level / 20 * 100)))
const entryValue = ref('')
const entryLength = computed(() => [...entryValue.value.trim()].length)
const entryValid = computed(() => Boolean(
  props.node.textEntry
  && entryLength.value > 0
  && entryLength.value <= props.node.textEntry.maxLength,
))

watch(() => props.sceneRevision, () => {
  const key = props.node.textEntry?.key
  const stored = key ? props.state.variables[key] : ''
  entryValue.value = typeof stored === 'string' ? stored : ''
}, { immediate: true })

const submit = () => {
  if (entryValid.value) emit('submitEntry', entryValue.value)
}

// SystemStage owns client actions and text entry so game UI never competes with an external choice panel.
</script>

<template>
  <section class="system-stage" :class="`skin-${ui}`" aria-label="剧中游戏客户端">
    <div class="client" @click="emit('interact')">
      <header>
        <div class="brand"><i>火</i><span><strong>4945区</strong><small>新区客户端</small></span></div>
        <div class="status"><b />运行中</div>
      </header>

      <template v-if="ui === 'game-client'">
        <div class="player-summary">
          <div class="rank-ring"><span>Lv.</span><strong>{{ state.stats.level }}</strong></div>
          <div>
            <small>{{ state.playerName }}</small>
            <strong>{{ routeOrganization?.name ?? '尚未加入组织' }}</strong>
            <div class="level-track"><i :style="{ width: `${progress}%` }" /></div>
          </div>
          <Bell :size="21" />
        </div>
        <div class="stat-grid">
          <article><Swords :size="19" /><small>战力</small><strong>{{ state.stats.power }}级</strong></article>
          <article><Activity :size="19" /><small>技术</small><strong>{{ state.stats.skill }}</strong></article>
          <article><Coins :size="19" /><small>预算</small><strong>{{ state.stats.money }}元</strong></article>
        </div>
        <div class="task-list">
          <article><Sparkles :size="20" /><div><strong>{{ renderText(node.title ?? '新区任务', state) }}</strong><small>{{ node.location }}</small></div><ChevronRight :size="18" /></article>
          <article><Shield :size="20" /><div><strong>组织入口</strong><small>{{ routeOrganization?.name ?? '20级后开放首领席位' }}</small></div><ChevronRight :size="18" /></article>
        </div>
      </template>

      <template v-else-if="ui === 'organization'">
        <div class="section-title"><Crown :size="21" /><div><strong>组织席位</strong><small>{{ organizationNamesPublished ? '8月重组后 · 成员按本人去向登记' : '开服格局 · 状态随路线变化' }}</small></div></div>
        <div class="organization-list">
          <article
            v-for="organization in organizations"
            :key="organization.id"
            :class="{ active: state.organization === organization.id }"
            :style="{ '--org-color': organization.color }"
          >
            <span>{{ String(organization.index).padStart(2, '0') }}</span>
            <div><strong>{{ organizationDisplayName(state, organization.id) }}</strong><small>{{ organizationDisplaySubtitle(state, organization.id) }}</small></div>
            <b>{{ organizationNamesPublished ? '已更新' : organization.initialPower }}</b>
          </article>
        </div>
      </template>

      <template v-else>
        <div class="section-title"><Sparkles :size="21" /><div><strong>奖励分配记录</strong><small>每一次确认都会留下时间与责任人</small></div></div>
        <div class="reward-grid">
          <article class="reward-item rare"><i /><div><strong>要塞稀有饰品</strong><small>{{ routeOrganization?.name ?? '待加入组织' }}</small></div><span>待确认</span></article>
          <article class="reward-item"><i /><div><strong>组织贡献</strong><small>当前累计</small></div><span>{{ state.stats.contribution }}</span></article>
          <article class="reward-item"><i /><div><strong>战略资源</strong><small>可用于组织决策</small></div><span>{{ state.stats.resources }}</span></article>
        </div>
        <div class="audit-line"><Users :size="17" />公开记录会改变凝聚、声望和成员信任。</div>
      </template>

      <section class="system-interaction">
        <p aria-hidden="true">{{ visibleText }}<i v-if="!revealComplete" /></p>
        <span v-if="revealComplete" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {{ renderText(node.text, state) }}
        </span>

        <form v-if="revealComplete && node.textEntry" class="entry-form" @click.stop @submit.prevent="submit">
          <label :for="`entry-${node.id}`">
            <span>{{ node.textEntry.label }}</span>
            <small>{{ entryLength }}/{{ node.textEntry.maxLength }}</small>
          </label>
          <div>
            <input
              :id="`entry-${node.id}`"
              v-model="entryValue"
              :maxlength="node.textEntry.maxLength"
              :placeholder="node.textEntry.placeholder"
              autofocus
            />
            <button type="submit" :disabled="!entryValid">{{ node.textEntry.submitLabel }}</button>
          </div>
        </form>

        <div v-else-if="revealComplete && choices.length" class="system-actions" aria-label="可执行操作" @click.stop>
          <button v-for="choice in choices" :key="choice.id" type="button" @click="emit('choose', choice.id)">
            <span>{{ renderText(choice.label, state) }}</span><ChevronRight :size="17" />
          </button>
        </div>

        <button v-else-if="revealComplete && canAdvance" class="system-continue" type="button" @click.stop="emit('interact')">
          继续 <ChevronRight :size="17" />
        </button>
      </section>
    </div>
  </section>
</template>

<style scoped>
.system-stage {
  position: absolute;
  z-index: 4;
  top: max(4.8rem, calc(env(safe-area-inset-top) + 3.8rem));
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(3.2rem, calc(env(safe-area-inset-bottom) + 3rem));
  left: max(1rem, env(safe-area-inset-left));
  display: grid;
  place-items: center;
  pointer-events: none;
}
.client {
  display: grid;
  width: min(100%, 48rem);
  max-height: 100%;
  overflow: hidden auto;
  border: 1px solid rgba(91, 50, 72, .24);
  border-radius: 1.35rem;
  background: linear-gradient(145deg, rgba(255,252,248,.97), rgba(247,232,234,.96));
  color: #402b37;
  box-shadow: 0 1.7rem 4rem rgba(28, 12, 25, .4);
  pointer-events: auto;
}
header { display: flex; min-height: 3.8rem; align-items: center; justify-content: space-between; padding: .7rem .9rem; border-bottom: 1px solid rgba(91,50,72,.12); background: rgba(255,255,255,.62); }
.brand { display: flex; align-items: center; gap: .62rem; }
.brand > i { display: grid; width: 2.35rem; height: 2.35rem; border-radius: .72rem; background: linear-gradient(135deg, #c85f7e, #ed9b88); color: white; font-family: var(--font-display); font-size: 1.1rem; font-style: normal; place-items: center; }
.brand span { display: grid; line-height: 1.2; }
.brand small, .section-title small, .player-summary small, .task-list small, .organization-list small, .reward-item small { color: #927487; font-size: .65rem; }
.status { display: flex; align-items: center; gap: .35rem; color: #6b967b; font-size: .68rem; }
.status b { width: .46rem; height: .46rem; border-radius: 50%; background: #6fb48a; }
.player-summary { display: grid; align-items: center; gap: .85rem; padding: 1rem; grid-template-columns: auto 1fr auto; }
.rank-ring { display: grid; width: 4rem; height: 4rem; border: 3px solid #d97899; border-radius: 50%; place-content: center; text-align: center; }
.rank-ring span { color: #a36f84; font-size: .58rem; line-height: 1; }
.rank-ring strong { font-size: 1.35rem; line-height: 1.1; }
.player-summary > div:nth-child(2) { display: grid; gap: .18rem; }
.level-track { height: .28rem; margin-top: .25rem; overflow: hidden; border-radius: 1rem; background: #ead8df; }
.level-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #c85f82, #e69e82); }
.stat-grid { display: grid; gap: .55rem; padding: 0 1rem .9rem; grid-template-columns: repeat(3, 1fr); }
.stat-grid article { display: grid; min-width: 0; gap: .1rem; padding: .7rem; border: 1px solid rgba(98,56,77,.1); border-radius: .85rem; background: white; box-shadow: 0 .35rem 1rem rgba(69,33,51,.06); }
.stat-grid svg { margin-bottom: .3rem; color: #be6687; }
.stat-grid small { color: #96788a; font-size: .62rem; }
.task-list { display: grid; gap: .5rem; padding: 0 1rem 1rem; }
.task-list article { display: grid; align-items: center; gap: .65rem; padding: .65rem .75rem; border-radius: .85rem; background: rgba(255,255,255,.72); grid-template-columns: auto 1fr auto; }
.task-list article > svg:first-child { color: #bd6886; }
.task-list div { display: grid; }
.section-title { display: flex; align-items: center; gap: .65rem; padding: 1rem; }
.section-title > svg { color: #c46788; }
.section-title div { display: grid; }
.organization-list { display: grid; gap: .45rem; padding: 0 1rem 1rem; }
.organization-list article { --org-color: #c46788; display: grid; align-items: center; gap: .65rem; padding: .62rem .72rem; border: 1px solid rgba(98,56,77,.1); border-left: .26rem solid var(--org-color); border-radius: .65rem; background: rgba(255,255,255,.68); grid-template-columns: auto 1fr auto; }
.organization-list article.active { background: color-mix(in srgb, var(--org-color) 16%, white); box-shadow: 0 .35rem 1rem color-mix(in srgb, var(--org-color) 18%, transparent); }
.organization-list article > span { color: var(--org-color); font-family: var(--font-mono); font-size: .67rem; }
.organization-list div { display: grid; min-width: 0; }
.organization-list b { color: #7e6372; font-size: .68rem; }
.reward-grid { display: grid; gap: .55rem; padding: 0 1rem 1rem; }
.reward-item { display: grid; align-items: center; gap: .7rem; padding: .72rem; border: 1px solid rgba(98,56,77,.11); border-radius: .8rem; background: rgba(255,255,255,.72); grid-template-columns: auto 1fr auto; }
.reward-item > i { width: 2.35rem; height: 2.35rem; border-radius: 50%; background: radial-gradient(circle, #f4d9bd 0 24%, #b9738c 27% 36%, #f8ede5 39% 100%); box-shadow: inset 0 0 0 1px rgba(90,45,65,.15); }
.reward-item.rare > i { background: radial-gradient(circle, #fff1ae 0 20%, #cf8b44 22% 35%, #9c66b0 38% 52%, #f8ede5 55%); }
.reward-item div { display: grid; }
.reward-item > span { color: #a15b77; font-family: var(--font-mono); font-size: .7rem; }
.audit-line { display: flex; align-items: center; gap: .5rem; margin: 0 1rem 1rem; padding: .6rem .7rem; border-radius: .65rem; background: #f2dde4; color: #79596b; font-size: .7rem; }
.system-interaction { display: grid; gap: .65rem; padding: .8rem 1rem 1rem; border-top: 1px solid rgba(91,50,72,.12); background: rgba(255,255,255,.64); }
.system-interaction > p { margin: 0; color: #503643; font-size: .82rem; line-height: 1.55; white-space: pre-line; }
.system-interaction > p i { display: inline-block; width: .38em; height: .95em; margin-left: .18rem; background: #c56789; vertical-align: -.12em; animation: blink .7s step-end infinite; }
.system-actions { display: grid; gap: .42rem; }
.system-actions button,
.system-continue { display: flex; min-height: 2.85rem; align-items: center; justify-content: space-between; gap: .65rem; padding: .5rem .7rem; border: 1px solid rgba(177,81,119,.25); border-radius: .72rem; background: linear-gradient(105deg, #fff, #fae9ef); color: #503643; text-align: left; }
.system-actions button:hover, .system-actions button:focus-visible, .system-continue:hover { border-color: #c46388; background: #f8dbe5; }
.system-actions button span { font-size: .78rem; line-height: 1.45; }
.system-continue { justify-self: end; min-width: 7rem; }
.entry-form { display: grid; gap: .4rem; }
.entry-form label { display: flex; justify-content: space-between; color: #765767; font-size: .7rem; font-weight: 600; }
.entry-form label small { color: #a18392; font-weight: 400; }
.entry-form > div { display: grid; gap: .5rem; grid-template-columns: 1fr auto; }
.entry-form input { min-width: 0; min-height: 2.9rem; padding: .55rem .7rem; border: 1px solid rgba(167,83,116,.3); border-radius: .7rem; background: white; color: #402d39; font-size: .92rem; outline: none; }
.entry-form input:focus { border-color: #c85f83; box-shadow: 0 0 0 3px rgba(200,95,131,.12); }
.entry-form button { min-height: 2.9rem; padding: .5rem 1rem; border: 0; border-radius: .7rem; background: #b55379; color: white; }
.entry-form button:disabled { cursor: not-allowed; opacity: .45; }
@keyframes blink { 50% { opacity: 0; } }

@media (max-width: 600px) and (orientation: portrait) {
  .system-stage {
    top: max(4.2rem, calc(env(safe-area-inset-top) + 3.65rem));
    right: max(.55rem, env(safe-area-inset-right));
    bottom: max(3.1rem, calc(env(safe-area-inset-bottom) + 3rem));
    left: max(.55rem, env(safe-area-inset-left));
    align-items: stretch;
  }
  .client { border-radius: 1.05rem; }
  .organization-list { gap: .35rem; padding-inline: .7rem; }
  .organization-list article { padding: .5rem .58rem; }
  .stat-grid { padding-inline: .7rem; }
  .task-list { padding-inline: .7rem; }
}

@media (max-height: 500px) and (orientation: landscape) {
  .system-stage {
    top: max(3rem, calc(env(safe-area-inset-top) + 2.9rem));
    right: max(9.5rem, calc(env(safe-area-inset-right) + 9rem));
    bottom: max(2.75rem, calc(env(safe-area-inset-bottom) + 2.75rem));
    left: max(1rem, calc(env(safe-area-inset-left) + .75rem));
  }
  .client { border-radius: .9rem; }
  header { min-height: 2.9rem; padding: .4rem .7rem; }
  .player-summary { padding: .55rem .75rem; }
  .rank-ring { width: 3rem; height: 3rem; }
  .stat-grid { padding: 0 .75rem .5rem; }
  .task-list { padding: 0 .75rem .6rem; }
  .system-interaction { padding: .55rem .75rem .65rem; }
  .system-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
