/**
 * 蝴蝶效应变量注册表
 *
 * 每个维度蓄积到阈值时自动设置对应 flag，内容作者可在后续节点用 condition 读取。
 * 变量值存储在 GameState.variables 中，自动被存档持久化。
 *
 * 使用方式（在 choice.effects 中）：
 *   { type: 'butterflyDelta', key: 'bf_cruelty', delta: 2 }
 */

export interface ButterflyThreshold {
  /** 到达此值（delta 累积 >= | <=）时触发 */
  value: number
  /** 触发后自动写入 state.flags 的键 */
  flag: string
  /** 人类可读标签（调试/日志用） */
  label: string
}

export interface ButterflyDimension {
  key: string
  label: string
  /** 阈值列表；正值表示 >=value 触发，负值表示 <=value 触发 */
  thresholds: ButterflyThreshold[]
}

export const BUTTERFLY_DIMENSIONS: ButterflyDimension[] = [
  {
    key: 'bf_cruelty',
    label: '冷酷度',
    thresholds: [
      { value: 4, flag: 'bf_ruthless', label: '冷酷无情' },
      { value: -3, flag: 'bf_merciful', label: '宽宏大量' },
    ],
  },
  {
    key: 'bf_loyalty',
    label: '凝聚力',
    thresholds: [
      { value: 5, flag: 'bf_devoted', label: '忠心耿耿' },
      { value: -4, flag: 'bf_opportunist', label: '见风使舵' },
    ],
  },
  {
    key: 'bf_chaos',
    label: '混沌值',
    thresholds: [
      { value: 6, flag: 'bf_anarchy', label: '秩序崩坏' },
      { value: 3, flag: 'bf_unstable', label: '暗流涌动' },
    ],
  },
  {
    key: 'bf_diplomacy',
    label: '外交值',
    thresholds: [
      { value: 4, flag: 'bf_peacemaker', label: '纵横捭阖' },
      { value: -4, flag: 'bf_warmonger', label: '四面树敌' },
    ],
  },
  {
    key: 'bf_shadow',
    label: '暗面值',
    thresholds: [
      { value: 5, flag: 'bf_shadow_master', label: '影子主宰' },
      { value: 3, flag: 'bf_schemer', label: '幕后棋手' },
    ],
  },
  {
    key: 'bf_heart',
    label: '真心值',
    thresholds: [
      { value: 4, flag: 'bf_devoted_heart', label: '真心不负' },
      { value: -3, flag: 'bf_cold_heart', label: '心如铁石' },
    ],
  },
]

/** 所有被蝴蝶变量注册表管理的键名常量，用于运行时遍历。 */
export const BUTTERFLY_VAR_KEYS = BUTTERFLY_DIMENSIONS.map((d) => d.key)

/**
 * 在 delta 值（已夹紧到 [-10, 10]）上检查阈值。
 * - 正值阈值：val >= threshold.value 时设置 flag
 * - 负值阈值：val <= threshold.value 时设置 flag
 * 返回本次新设置的 flag 列表。
 */
export const settleButterflyThresholds = (
  variables: Record<string, string | number>,
  flags: Record<string, boolean>,
): string[] => {
  const newlySet: string[] = []
  for (const dim of BUTTERFLY_DIMENSIONS) {
    const val = (variables[dim.key] as number) ?? 0
    for (const t of dim.thresholds) {
      if (flags[t.flag]) continue // 已设置则跳过
      if (t.value > 0 && val >= t.value) {
        flags[t.flag] = true
        newlySet.push(t.flag)
      } else if (t.value < 0 && val <= t.value) {
        flags[t.flag] = true
        newlySet.push(t.flag)
      }
    }
  }
  return newlySet
}

// ──────────────── 世界线异变系统 ────────────────

/**
 * 世界线偏差值 = 所有蝴蝶维度绝对值之和。
 * 代表玩家选择偏离"默认世界线"的总程度，偏差越大越可能触发异变事件。
 */
export const computeWorldlineDeviation = (variables: Record<string, string | number>): number => {
  let sum = 0
  for (const dim of BUTTERFLY_DIMENSIONS) {
    sum += Math.abs((variables[dim.key] as number) ?? 0)
  }
  return sum
}

export interface WorldlineThreshold {
  /** 偏差值达到此值时触发 */
  value: number
  flag: string
  label: string
}

export const WORLDLINE_THRESHOLDS: WorldlineThreshold[] = [
  { value: 10, flag: 'wl_ripple', label: '涟漪' },
  { value: 20, flag: 'wl_shift', label: '偏转' },
  { value: 30, flag: 'wl_divergence', label: '分歧' },
  { value: 40, flag: 'wl_aberration', label: '异变' },
]

/**
 * 检查世界线偏差值是否触发新阈值 flag。
 * 返回本次新设置的 flag 列表。
 */
export const settleWorldlineThresholds = (
  deviation: number,
  flags: Record<string, boolean>,
): string[] => {
  const newlySet: string[] = []
  for (const t of WORLDLINE_THRESHOLDS) {
    if (flags[t.flag]) continue
    if (deviation >= t.value) {
      flags[t.flag] = true
      newlySet.push(t.flag)
    }
  }
  return newlySet
}
