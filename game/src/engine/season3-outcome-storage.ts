import { isSeason3OutcomeRecord, type Season3OutcomeRecord } from './season3-outcome'

const KEY = '4945-vn:v1:s3-outcomes'
const hasStorage = () => typeof window !== 'undefined' && 'localStorage' in window

/** 第三季完整结局使用独立不可变档案；普通事件三进度删除不会触碰这里。 */
export const readSeason3OutcomeArchive = (): Season3OutcomeRecord[] => {
  if (!hasStorage()) return []
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isSeason3OutcomeRecord) : []
  } catch {
    return []
  }
}

export const writeSeason3OutcomeRecord = (record: Season3OutcomeRecord): Season3OutcomeRecord => {
  if (!isSeason3OutcomeRecord(record)) throw new Error('拒绝写入损坏的事件三结局档案。')
  const archive = readSeason3OutcomeArchive()
  const existing = archive.find((entry) => entry.digest === record.digest)
  if (existing) return existing
  if (hasStorage()) localStorage.setItem(KEY, JSON.stringify([...archive, record]))
  return record
}

export const deleteSeason3OutcomeRecord = (recordId: string): boolean => {
  const archive = readSeason3OutcomeArchive()
  const next = archive.filter((entry) => entry.recordId !== recordId)
  if (next.length === archive.length) return false
  if (hasStorage()) localStorage.setItem(KEY, JSON.stringify(next))
  return true
}
