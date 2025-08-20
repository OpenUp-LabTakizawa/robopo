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
  sensorMaxResult: number | null
  sumIpponPoint: number | null
  ipponMaxResult: number | null
  totalPoint: number | null
  pointRank: number | null
  challengeCount: number | null
  challengeRank: number | null
}

// コース完走判定関数
export function isCompletedCourse(
  pointData: PointState,
  result: number | null,
): boolean {
  const resultPoint = calcPoint(pointData, result)
  // pointDataを全て足し合わせる。
  let totalPoint = 0
  for (let i = 0; i < pointData.length; i++) {
    totalPoint += Number(pointData[i])
  }
  // resultの得点がtotalPointと等しい場合は完走していると判定
  if (totalPoint === resultPoint) {
    return true
  }
  return false
}
