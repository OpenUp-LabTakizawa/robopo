import { calcPoint } from "@/app/components/challenge/utils"
import type { PointState } from "@/app/components/course/utils"

export type CourseSummary = {
  playerId: number | null
  playerName: string | null
  playerFurigana: string | null
  playerZekken: string | null
  firstTCourseCount: number | null
  firstTCourseTime: string | null
  tCourseCount: number | null
  tCourseMaxResult: number | null
  totalPoint: number | null
  pointRank: number | null
  challengeCount: number | null
  challengeRank: number | null
}

// Course completion check function
export function isCompletedCourse(
  pointData: PointState,
  result: number | null,
): boolean {
  const resultPoint = calcPoint(pointData, result)
  let totalPoint = 0
  for (let i = 0; i < pointData.length; i++) {
    const entry = pointData[i]
    if (Array.isArray(entry)) {
      totalPoint += entry[0] ?? 0
    } else {
      totalPoint += Number(entry)
    }
  }
  if (totalPoint === resultPoint) {
    return true
  }
  return false
}
