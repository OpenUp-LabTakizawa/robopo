import type { PointState } from "@/lib/course/types"
import { calcPoint, totalPossiblePoints } from "@/lib/scoring/scoring"

// Format ISO timestamp for display
export function formatTimestamp(iso: string | null): string {
  if (!iso) {
    return "-"
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return "-"
  }
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// Course completion check function
export function isCompletedCourse(
  pointData: PointState,
  result: number | null,
): boolean {
  return calcPoint(pointData, result) === totalPossiblePoints(pointData)
}
