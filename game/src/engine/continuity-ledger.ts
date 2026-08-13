/**
 * ContinuityDebtLedger — 连续性债务总账
 *
 * 每条债务对应 S2-POSTMORTEM 中的一个发现项，
 * 在 V3.1 中逐条处理并分类标记。
 */

// ── 类型定义 ──

/** 债务处理类别 */
export type ContinuityDebtCategory =
  | 'fix-only'       // 纯修错，不扩展叙事
  | 'retire'         // 归档/清理，不承载叙事
  | 'promote-to-s3'  // 提升为第三季 canon 冻结时的待决项
  | 'close-in-3.1'   // 在 3.1 中当场关闭
  | 'reject'         // 明确拒绝（记录理由）

/** 债务来源 */
export type ContinuityDebtSource =
  | 's2-postmortem-1'  // §1 叙事缺口
  | 's2-postmortem-2'  // §2 可选线索
  | 's2-postmortem-3'  // §3 修错项
  | 's2-postmortem-4'  // §4 封闭结局
  | 's2-postmortem-5'  // §5 结构验证
  | 's2-postmortem-6'  // §6 资产
  | 's2-postmortem-7'  // §7 技术债
  | 's2-canon-gap'     // S2-CANON 标记的设计预留缺口

/** 单条连续性债务 */
export interface ContinuityDebtEntry {
  /** 唯一标识 */
  id: string
  /** 处理类别 */
  category: ContinuityDebtCategory
  /** 来源章节 */
  source: ContinuityDebtSource
  /** 简短标题 */
  title: string
  /** 详细描述 */
  description: string
  /** 处理决议 */
  resolution: string
  /** 关联 ID（结局/路线/角色等） */
  relatedIds?: string[]
  /** 处理人/日期 */
  resolvedAt?: string
  /** 仅在 resolveAt 之后生效 */
  effectiveFrom?: string
}

/** 连续性债务总账 */
export interface ContinuityDebtLedger {
  version: string
  createdAt: string
  totalDebts: number
  byCategory: Record<ContinuityDebtCategory, number>
  entries: ContinuityDebtEntry[]
}

// ── 债务总账数据 ──

export const CONTINUITY_DEBT_LEDGER: ContinuityDebtLedger = {
  version: '3.1.0',
  createdAt: '2026-08-06',
  totalDebts: 10,
  byCategory: {
    'fix-only': 3,
    'retire': 2,
    'promote-to-s3': 2,
    'close-in-3.1': 2,
    'reject': 1,
  },
  entries: [
    // ── fix-only ──
    {
      id: 'cd-001',
      category: 'fix-only',
      source: 's2-postmortem-3',
      title: 'S2 主线结局未登记到 ENDING_REGISTRY',
      description:
        'S2 的 10 个主线结局（s2-ending-org*-triumph/compromise）及 s2-finale-complete 未登记到 ENDING_REGISTRY，若结局画廊依赖 registry 则不可见。',
      resolution:
        '已在 endingRegistry.ts 第 88-101 行补登 10 个主线结局 + 1 个季终标记，含标题/副标题/skin/route。',
      relatedIds: [
        's2-ending-org2-triumph', 's2-ending-org2-compromise',
        's2-ending-org3-triumph', 's2-ending-org3-compromise',
        's2-ending-org4-triumph', 's2-ending-org4-compromise',
        's2-ending-org5-triumph', 's2-ending-org5-compromise',
        's2-ending-org6-triumph', 's2-ending-org6-compromise',
        's2-finale-complete',
      ],
      resolvedAt: '2026-08-06',
    },
    {
      id: 'cd-002',
      category: 'fix-only',
      source: 's2-postmortem-3',
      title: '12 个羁绊结局仅有 ID 无详细信息',
      description:
        'bond-* 结局在 registry 中缺少 title/subtitle/skin 字段，画廊展示受影响。',
      resolution:
        '已在 endingRegistry.ts 第 67-79 行补全 12 个羁绊结局的 title/subtitle/skin（均为 cinematic 皮肤 + 羁绊 subtitle）。',
      relatedIds: [
        'bond-shana', 'bond-heartbeat', 'bond-qifu', 'bond-yanqiu',
        'bond-wenxian', 'bond-huayue', 'bond-xilufei', 'bond-chenyi',
        'bond-swordheart', 'bond-takemehand', 'bond-avucii', 'bond-yyt',
      ],
      resolvedAt: '2026-08-06',
    },
    {
      id: 'cd-003',
      category: 'fix-only',
      source: 's2-postmortem-3',
      title: 's2EpilogueEnding 变量未在 S2-2.9-exit 写入',
      description:
        'postmortem 提到季终节点可能遗漏 s2EpilogueEnding 变量写入，影响 Outcome Archive 的 epilogueEnding 字段。',
      resolution:
        '已验证 s2-2.9.ts 中 10 个尾声节点各自写入 s2EpilogueEnding 变量（第 54-199 行），s2-2.9-exit 写入 s2Complete + s2EpilogueComplete flag，无遗漏。',
      relatedIds: ['s2-2.9-exit'],
      resolvedAt: '2026-08-06',
    },

    // ── retire ──
    {
      id: 'cd-004',
      category: 'retire',
      source: 's2-postmortem-7',
      title: 'V18 托管视觉资产到期清理',
      description:
        '36 条 @v18 标记的视觉资产（v1.8 托管图片）到期日 2026-11-30。到期前不得删除（V3.0-ACCEPTANCE 明确要求不做任何视觉清理），到期后需迁移到正式路径或归档。',
      resolution:
        '2026-11-30 后执行清理脚本：将 @v18 路径中仍在用的图片迁移到正式路径，已替代的图片归档到 cold-storage/。当前标记 pending = 0（V3.0 资产审计通过）。',
      effectiveFrom: '2026-11-30',
      resolvedAt: '2026-08-06',
    },
    {
      id: 'cd-005',
      category: 'retire',
      source: 's2-postmortem-7',
      title: '@v18 临时路径别名清理',
      description:
        '代码中 `@/assets/v18/` 路径别名和 `import.meta.glob` 的 v18 通配引用的清理。与 cd-004 关联，同一时间表。',
      resolution:
        '与 cd-004 同步清理（2026-11-30）：移除不再需要的 import.meta.glob 引用，清理 v18 路径别名中的死链接。',
      effectiveFrom: '2026-11-30',
      resolvedAt: '2026-08-06',
    },

    // ── promote-to-s3 ──
    {
      id: 'cd-006',
      category: 'promote-to-s3',
      source: 's2-postmortem-1',
      title: '评议委员会领导者身份',
      description:
        'S2 中多次提到"评议委员会"（review council），但其领导者/发起者身份未在剧情中明确揭示。S2-CANON 标记为设计预留（非遗漏），不得在第二季自行补写。',
      resolution:
        '提升为 S3 canon 冻结时的待决项。第三季 canon 设计中需为该角色分配身份、动机和出场时机。在 S3 策划文档 SOL-PLAN-3.x 中列为 P0 canon 决策。',
      relatedIds: ['review-council-leader'],
      resolvedAt: '2026-08-06',
    },
    {
      id: 'cd-007',
      category: 'promote-to-s3',
      source: 's2-postmortem-1',
      title: '2026-12-31 之后的事实定义',
      description:
        'S2 的时间范围结束于 2026-12-31。此后各组织状态、人物去向、世界线收敛等事实全部空白。S2-CANON 标记为设计预留。',
      resolution:
        '提升为 S3 canon 冻结时的待决项。第三季开始前需冻结 post-2026-12-31 的 canon 事实集，包括：各组织状态、核心人物去向、第三季时间起点。',
      resolvedAt: '2026-08-06',
    },

    // ── close-in-3.1 ──
    {
      id: 'cd-008',
      category: 'close-in-3.1',
      source: 's2-postmortem-7',
      title: 'KNOWN_DURABLE_FACTS 空白名单',
      description:
        'season2-outcome.ts 中已定义 10 个 KNOWN_DURABLE_FACTS（7 structural + 3 flavor），但 postmortem 写完后未将此项标记为已关闭。',
      resolution:
        '已在 season2-outcome.ts 中定义 KNOWN_DURABLE_FACTS 白名单（第 16-25 行），含第一组织成立顺序、核心五组织结构、第二时间线、将进酒/小夜/温陷 flavor 事实。此债务关闭。',
      relatedIds: ['KNOWN_DURABLE_FACTS'],
      resolvedAt: '2026-08-06',
    },
    {
      id: 'cd-009',
      category: 'close-in-3.1',
      source: 's2-postmortem-2',
      title: 's2-org2-triumph-line 伏笔线索',
      description:
        '第二组织 triumph 结局：一句 "等你赢到第三季，他们回来"——这是 S2 唯一可能承载第三季桥接叙事的一句文本。postmortem 判断：不构成完整剧情单元，不应单独撑一篇 S2X 补遗。',
      resolution:
        '作为线索提升到第三季 canon 讨论。在第三季策划阶段判断该伏笔是否启用、如何回收。在 Solo 文案（第三季序章或早期 episode）中作为可选回呼。本债务在 3.1 关闭，不产生补遗内容。',
      relatedIds: ['s2-org2-triumph-line', 's2-ending-org2-triumph'],
      resolvedAt: '2026-08-06',
    },

    // ── reject ──
    {
      id: 'cd-010',
      category: 'reject',
      source: 's2-postmortem-6',
      title: 'S2 结局专属 CG 分配',
      description:
        '10 个 S2 主线结局没有独立的 CG 图片，结尾场景仅使用对应路线的 climax CG（如 org2-triumph 使用江南决战 CG）。postmortem 提出可分配独立 CG。',
      resolution:
        '拒绝。当前 10 个 S2 结局均沿路线 climax CG，视觉已闭合且不违和。独立 CG 属于资产创作（非修错），排在第三季新素材优先级之后。V3.1 不做资产新增。',
      relatedIds: [
        's2-ending-org2-triumph', 's2-ending-org3-triumph',
        's2-ending-org4-triumph', 's2-ending-org5-triumph',
        's2-ending-org6-triumph',
      ],
      resolvedAt: '2026-08-06',
    },
  ],
}

// ── 工具函数 ──

/** 按类别筛选债务 */
export function filterDebtsByCategory(
  ledger: ContinuityDebtLedger,
  category: ContinuityDebtCategory,
): ContinuityDebtEntry[] {
  return ledger.entries.filter((e) => e.category === category)
}

/** 获取已处理的债务 */
export function getResolvedDebts(ledger: ContinuityDebtLedger): ContinuityDebtEntry[] {
  return ledger.entries.filter((e) => e.resolvedAt !== undefined)
}

/** 获取未处理的债务 */
export function getUnresolvedDebts(ledger: ContinuityDebtLedger): ContinuityDebtEntry[] {
  return ledger.entries.filter((e) => e.resolvedAt === undefined)
}

/** 获取生效日期已到的债务 */
export function getEffectiveDebts(
  ledger: ContinuityDebtLedger,
  asOf: string,
): ContinuityDebtEntry[] {
  return ledger.entries.filter((e) => {
    if (!e.effectiveFrom) return true
    return e.effectiveFrom <= asOf
  })
}

/** 验证总账完整性 */
export function validateLedger(ledger: ContinuityDebtLedger): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 1. 总计数与实际条目数一致
  const countedByCategory: Record<string, number> = {}
  for (const entry of ledger.entries) {
    countedByCategory[entry.category] = (countedByCategory[entry.category] || 0) + 1
  }
  for (const cat of Object.keys(ledger.byCategory) as ContinuityDebtCategory[]) {
    if (ledger.byCategory[cat] !== (countedByCategory[cat] || 0)) {
      errors.push(
        `byCategory.${cat} 计数不匹配：声明 ${ledger.byCategory[cat]}，实际 ${countedByCategory[cat] || 0}`,
      )
    }
  }
  if (ledger.totalDebts !== ledger.entries.length) {
    errors.push(`totalDebts 不匹配：声明 ${ledger.totalDebts}，实际 ${ledger.entries.length}`)
  }

  // 2. 无重复 id
  const ids = new Set<string>()
  for (const entry of ledger.entries) {
    if (ids.has(entry.id)) {
      errors.push(`重复 ID: ${entry.id}`)
    }
    ids.add(entry.id)
  }

  // 3. 必须有 resolution 字段
  for (const entry of ledger.entries) {
    if (!entry.resolution || entry.resolution.trim().length === 0) {
      errors.push(`${entry.id}: resolution 字段为空`)
    }
  }

  return { valid: errors.length === 0, errors }
}
