import type { CharacterId, NumericStat } from '@/engine/types'

export interface SupportAbilityDefinition {
  character: CharacterId
  name: string
  shortDescription: string
  unlockAt: number
  bonuses: Partial<Record<NumericStat, number>>
}

/**
 * Support abilities are data-driven so later romance routes can add their own
 * active skill without adding character-specific branches to the engine.
 */
export const supportAbilities: Partial<Record<CharacterId, SupportAbilityDefinition>> = {
  heartbeat: {
    character: 'heartbeat',
    name: '心跳支援',
    shortDescription: '让心跳成瘾协助下一次回应，稳住群聊节奏',
    unlockAt: 100,
    bonuses: { reputation: 1, cohesion: 1 },
  },
}
