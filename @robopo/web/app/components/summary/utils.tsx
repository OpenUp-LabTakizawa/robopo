import { calcPoint } from "@/app/components/challenge/utils"
import type { PointState } from "@/app/components/course/utils"

export type JudgeSummary = {
  judgeId: number
  judgeName: string
  scoredPlayerCount: number
  scoredPlayerNames: string[]
  firstScoringTime: string | null
  lastScoringTime: string | null
  totalScoringCount: number
  courseCount: number
  courseNames: string[]
  averageScore: number | null
  courseOutCount: number
}

export type CourseCompetitionSummary = {
  courseId: number
  courseName: string
  firstChallengeTime: string | null
  firstCompletionTime: string | null
  lastChallengeTime: string | null
  challengerCount: number
  completionCount: number
  completionRate: number | null
  totalChallengeCount: number
  averageScore: number | null
  maxScore: number | null
  courseOutCount: number
  retryCount: number
}

export type CourseSummary = {
  playerId: number | null
  playerName: string | null
  playerFurigana: string | null
  playerBibNumber: string | null
  firstAttemptTime: string | null
  firstMaxAttemptCount: number | null
  firstMaxAttemptTime: string | null
  elapsedToComplete: string | null
  elapsedToCompleteSeconds: number | null
  lastAttemptTime: string | null
  firstAttemptScore: number | null
  averageScore: number | null
  courseOutCount: number | null
  retryCount: number | null
  attemptCount: number | null
  maxResult: number | null
  totalPoint: number | null
  sumPoint: number | null
  pointRank: number | null
  challengeCount: number | null
  challengeRank: number | null
}

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
