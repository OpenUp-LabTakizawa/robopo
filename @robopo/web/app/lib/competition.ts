import type { SelectCompetition } from "@/app/lib/db/schema"

export type CompetitionStatus = "before" | "active" | "ended" | "unknown"

/**
 * Determine the current status of a competition based on its date range.
 * - "before": today is before the start date
 * - "active": today is within [startDate, endDate]
 * - "ended": today is after the end date
 * - "unknown": start or end date is not set
 */
export function getCompetitionStatus(c: SelectCompetition): CompetitionStatus {
  if (!c.startDate || !c.endDate) {
    return "unknown"
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(c.startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(c.endDate)
  end.setHours(0, 0, 0, 0)
  if (today < start) {
    return "before"
  }
  if (today > end) {
    return "ended"
  }
  return "active"
}

/**
 * Check if a competition is currently active (today falls within its date range).
 */
export function isCompetitionActive(c: SelectCompetition): boolean {
  return getCompetitionStatus(c) === "active"
}
