export type CompetitionStatus = "before" | "active" | "ended" | "unknown"

/**
 * Determine the current status of a competition based on its datetime range.
 * Compares at minute precision (includes hours and minutes).
 * - "before": now is before the start datetime
 * - "active": now is within [startDate, endDate]
 * - "ended": now is after the end datetime
 * - "unknown": start or end date is not set
 */
export function getCompetitionStatus(c: {
  startDate: Date | null
  endDate: Date | null
}): CompetitionStatus {
  if (!c.startDate || !c.endDate) {
    return "unknown"
  }
  const now = new Date()
  const start = new Date(c.startDate)
  const end = new Date(c.endDate)
  if (now < start) {
    return "before"
  }
  if (now > end) {
    return "ended"
  }
  return "active"
}

/**
 * Check if a competition is currently active.
 */
export function isCompetitionActive(c: {
  startDate: Date | null
  endDate: Date | null
}): boolean {
  return getCompetitionStatus(c) === "active"
}

export const MASK_MINUTES_MIN = 1
export const MASK_MINUTES_MAX = 999
export const MASK_MINUTES_DEFAULT = 30

/**
 * Normalize maskMinutesBefore value to a valid range.
 * - Invalid/missing values fall back to the default
 * - Out-of-range values are clamped to [MIN, MAX]
 */
export function normalizeMaskMinutesBefore(value: unknown): number {
  const num = Number(value)
  if (!Number.isFinite(num)) {
    return MASK_MINUTES_DEFAULT
  }
  return Math.min(MASK_MINUTES_MAX, Math.max(MASK_MINUTES_MIN, Math.floor(num)))
}
