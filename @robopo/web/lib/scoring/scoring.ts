import type { PointState } from "@/lib/course/types"

// ミッション進捗の計算
export type MissionProgress = {
  completed: number
  total: number
  percent: number
}

export function getMissionProgress(
  missionCount: number,
  nowMission: number,
  isGoal: boolean,
): MissionProgress {
  const completed = isGoal ? missionCount : nowMission
  const percent = missionCount > 0 ? (completed / missionCount) * 100 : 0
  return { completed, total: missionCount, percent }
}

// Get numeric value from a PointEntry (for tier entries, defaults to first tier value)
export function pointEntryValue(entry: PointState[number]): number {
  if (entry === null) {
    return 0
  }
  if (Array.isArray(entry)) {
    return entry[0] ?? 0 // Default to first tier for now
  }
  return Number(entry)
}

// コースの取得可能な合計ポイントを計算する
export function totalPossiblePoints(pointData: PointState): number {
  return pointData.reduce<number>(
    (sum, entry) => sum + pointEntryValue(entry),
    0,
  )
}

// 進んだmissionの数によって獲得したポイントを計算する
// pointState contains points in order: start, goal, mission...
// First mission starts at index=2 with point pointState[2], point for index=i is pointState[i]
// Last mission is at index=pointState.length-1, at which point goal points pointState[1] are added
export function calcPoint(pointState: PointState, index: number | null) {
  if (index === null) {
    return 0
  }
  let point = pointEntryValue(pointState[0]) // Initial value is start value (handicap)
  for (let i = 2; i < index + 2; i++) {
    point += pointEntryValue(pointState[i])
    if (i === pointState.length - 1) {
      point += pointEntryValue(pointState[1]) // Add goal points
    }
  }
  return point
}
