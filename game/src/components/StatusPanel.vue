<script setup lang="ts">
import { Heart, Shield, Sparkles, Swords, Users } from '@lucide/vue'
import { computed } from 'vue'

import { characters, romanceCandidates } from '@/content/characters'
import { organizations } from '@/content/organizations'
import { organizationDisplayName } from '@/content/season2/augustContinuity'
import { supportAbilities } from '@/content/supportAbilities'
import type { CharacterId, GameState, OrganizationId } from '@/engine/types'

const props = defineProps<{ state: GameState }>()

const statLabels = {
  level: '等级', power: '战力', skill: '操作', money: '余额', reputation: '声望',
  cohesion: '凝聚', resources: '资源', evidence: '证据', contribution: '贡献',
} as const

const relationText = (value: number) => value >= 2 ? '盟友' : value === 1 ? '友好' : value === 0 ? '中立' : value === -1 ? '紧张' : '敌对'
const currentOrganizationName = computed(() => props.state.organization
  ? organizationDisplayName(props.state, props.state.organization)
  : props.state.organizationName)

// 能力说明与引擎共用同一数据表，避免状态页写死“心跳”或具体加成。
const unlockedSupports = computed(() => (Object.entries(supportAbilities) as Array<[CharacterId, (typeof supportAbilities)[CharacterId]]>)
  .flatMap(([character, definition]) => {
    const ability = props.state.supportAbilities[character]
    return definition && ability?.unlocked ? [{ character, definition, ability }] : []
  }))

// StatusPanel 公开玩家可合理获知的数值；隐藏 flag 和结局阈值不会泄露给界面。
</script>

<template>
  <div class="status-header">
    <div class="avatar"><Shield :size="24" /></div>
    <div>
      <p>{{ state.date }} · {{ state.role === 'leader' ? '首领' : '玩家' }}</p>
      <h3>{{ state.playerName }}</h3>
      <span>{{ currentOrganizationName }}</span>
    </div>
  </div>

  <section>
    <h4><Sparkles :size="16" />成长</h4>
    <div class="stat-grid">
      <div v-for="(value, key) in state.stats" :key="key">
        <span>{{ statLabels[key] }}</span><strong>{{ key === 'money' ? `¥${value}` : value }}</strong>
      </div>
    </div>
  </section>

  <section>
    <h4><Users :size="16" />正式高层 <small>{{ state.highCouncil.length }}/2</small></h4>
    <div class="council">
      <div v-for="member in state.highCouncil" :key="member">
        <img v-if="characters[member].avatar" :src="characters[member].avatar" alt="" />
        <span>{{ characters[member].name }}</span>
      </div>
      <p v-if="!state.highCouncil.length">尚未任命</p>
    </div>
  </section>

  <section>
    <h4><Swords :size="16" />组织关系</h4>
    <div class="relation-list">
      <div v-for="id in (Object.keys(organizations) as OrganizationId[])" :key="id">
        <span><i :style="{ background: organizations[id].color }" />{{ organizationDisplayName(state, id) }}</span>
        <strong :class="`v-${state.organizationRelations[id]}`">{{ id === state.organization ? '本组' : relationText(state.organizationRelations[id]) }}</strong>
      </div>
    </div>
  </section>

  <section>
    <h4><Heart :size="16" />关系 <small>攻略值·信任/好感</small></h4>
    <div class="bond-list">
      <div v-for="id in romanceCandidates" :key="id">
        <img :src="characters[id].avatar" alt="" />
        <span>
          <b>{{ characters[id].shortName ?? characters[id].name }}</b>
          <i
            class="progress-track"
            role="progressbar"
            :aria-label="`${characters[id].name}攻略值`"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="state.relationships[id].progress"
          ><i :style="{ width: `${state.relationships[id].progress}%` }" /></i>
        </span>
        <strong>{{ state.relationships[id].progress }}% <small>{{ state.relationships[id].trust }}/{{ state.relationships[id].affinity }}</small></strong>
      </div>
    </div>
  </section>

  <section v-if="unlockedSupports.length">
    <h4><Sparkles :size="16" />角色支援 <small>攻略值100%解锁</small></h4>
    <div class="support-list">
      <div v-for="support in unlockedSupports" :key="support.character">
        <span><b>{{ support.definition.name }}</b><small>{{ support.definition.shortDescription }}</small></span>
        <strong>{{ support.ability.active ? '已就绪' : support.ability.charges > 0 ? `本幕 ${support.ability.charges}/1` : '本幕已用' }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.status-header { display: flex; align-items: center; gap: .85rem; padding: .25rem 0 1rem; }
.avatar { display: grid; width: 3.3rem; height: 3.3rem; border: 1px solid rgba(232,188,120,.42); border-radius: 50%; background: rgba(232,188,120,.08); color: var(--color-accent); place-items: center; }
.status-header p, .status-header h3, .status-header span { margin: 0; }
.status-header p { color: var(--color-text-muted); font-family: var(--font-mono); font-size: .7rem; }
.status-header h3 { font-family: var(--font-display); font-size: 1.25rem; }
.status-header span { color: var(--color-secondary); font-size: .82rem; }
section { padding: 1rem 0; border-top: 1px solid var(--color-border); }
h4 { display: flex; align-items: center; gap: .5rem; margin: 0 0 .75rem; color: var(--color-accent); font-size: .78rem; letter-spacing: .08em; }
h4 small { margin-left: auto; color: var(--color-text-muted); font-family: var(--font-mono); font-weight: 400; }
.stat-grid { display: grid; gap: .45rem; grid-template-columns: repeat(3, 1fr); }
.stat-grid div { display: grid; padding: .55rem; border-radius: .6rem; background: rgba(255,255,255,.035); }
.stat-grid span { color: var(--color-text-muted); font-size: .66rem; }
.stat-grid strong { font-family: var(--font-mono); font-size: .95rem; }
.council { display: flex; gap: .65rem; }
.council div { display: flex; align-items: center; gap: .45rem; padding: .35rem .6rem .35rem .35rem; border: 1px solid var(--color-border); border-radius: 2rem; font-size: .76rem; }
.council img { width: 1.8rem; height: 1.8rem; border-radius: 50%; object-fit: cover; }
.council p { margin: 0; color: var(--color-text-muted); font-size: .78rem; }
.relation-list, .bond-list { display: grid; gap: .3rem; }
.relation-list > div, .bond-list > div { display: flex; min-height: 2.25rem; align-items: center; gap: .5rem; padding: .25rem .45rem; border-radius: .45rem; background: rgba(255,255,255,.025); font-size: .75rem; }
.relation-list span { display: flex; align-items: center; gap: .45rem; }
.relation-list i { width: .45rem; height: .45rem; border-radius: 50%; }
.relation-list strong, .bond-list strong { margin-left: auto; font-family: var(--font-mono); font-size: .68rem; }
.relation-list .v-2, .relation-list .v-1 { color: var(--color-success); }
.relation-list .v--2, .relation-list .v--1 { color: var(--color-danger); }
.bond-list img { width: 1.8rem; height: 1.8rem; border-radius: 50%; object-fit: cover; }
.bond-list span { display: grid; flex: 1; gap: .2rem; min-width: 0; }
.bond-list span b { overflow: hidden; font-size: .72rem; font-style: normal; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
.bond-list strong { display: grid; min-width: 3.4rem; color: var(--color-secondary); text-align: right; }
.bond-list strong small { color: var(--color-text-muted); font-size: .55rem; font-weight: 400; }
.progress-track { display: block; overflow: hidden; height: .28rem; border-radius: 1rem; background: rgba(255,255,255,.08); }
.progress-track > i { display: block; width: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #cf6f96, #ef9dbc); transition: width .24s var(--ease-out); }
.support-list { display: grid; gap: .4rem; }
.support-list > div { display: flex; align-items: center; gap: .75rem; padding: .65rem .7rem; border: 1px solid rgba(239,157,188,.2); border-radius: .65rem; background: rgba(207,111,150,.07); }
.support-list span { display: grid; min-width: 0; }
.support-list b { color: var(--color-text); font-size: .76rem; }
.support-list small { color: var(--color-text-muted); font-size: .64rem; line-height: 1.45; }
.support-list strong { margin-left: auto; color: var(--color-secondary); font-family: var(--font-mono); font-size: .66rem; white-space: nowrap; }
</style>
