import { getCompetitionCourseList } from "@/app/components/server/db"
import {
  maxCoursePoint,
  sumCoursePoint,
} from "@/app/components/summary/utilServer"
import type { CourseSummary } from "@/app/components/summary/utils"
import { getCourseSummary } from "@/app/lib/db/queries/queries"

function calcElapsedSeconds(
  startTime: string | null,
  endTime: string | null,
): number | null {
  if (!startTime || !endTime) {
    return null
  }
  const start = Date.parse(startTime)
  const end = Date.parse(endTime)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return null
  }
  return Math.floor((end - start) / 1000)
}

function formatElapsedJa(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}時間${String(minutes).padStart(2, "0")}分${String(seconds).padStart(2, "0")}秒`
  }
  if (minutes > 0) {
    return `${minutes}分${String(seconds).padStart(2, "0")}秒`
  }
  return `${seconds}秒`
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string; courseId: string }> },
) {
  const { competitionId, courseId } = await params
  const competitionIdNum = Number(competitionId)
  const cId = Number(courseId)

  // Fetch data for the selected course
  const courseSummary = await getCourseSummary(competitionIdNum, cId)

  // Get all courses for this competition to calculate total score
  const { competitionCourses } =
    await getCompetitionCourseList(competitionIdNum)

  // Calculate derived fields for each player
  const courseSummaryWithPoints = await Promise.all(
    courseSummary.map(async (player) => {
      const playerId = player.playerId || 0

      // Sum max score across all competition courses
      let totalPoint = 0
      for (const c of competitionCourses) {
        const maxPt = await maxCoursePoint(competitionIdNum, playerId, c.id)
        totalPoint += maxPt
      }

      // Sum of all attempt scores for this course
      const sumPoint = await sumCoursePoint(competitionIdNum, playerId, cId)

      // Elapsed time from first attempt to completion
      const elapsedToCompleteSeconds = calcElapsedSeconds(
        player.firstAttemptTime,
        player.firstMaxAttemptTime,
      )
      const elapsedToComplete =
        elapsedToCompleteSeconds !== null
          ? formatElapsedJa(elapsedToCompleteSeconds)
          : null

      // Average score per attempt
      const challengeCount = Number(player.challengeCount) || 0
      const averageScore =
        challengeCount > 0
          ? Math.round((sumPoint / challengeCount) * 10) / 10
          : null

      return {
        ...player,
        totalPoint,
        sumPoint,
        elapsedToComplete,
        elapsedToCompleteSeconds,
        averageScore,
      }
    }),
  )

  // Calculate total score ranking
  const sortedByTotalPoints = [...courseSummaryWithPoints].sort(
    (a, b) => b.totalPoint - a.totalPoint,
  )
  sortedByTotalPoints.forEach((player, index) => {
    player.pointRank = index + 1
  })

  // Calculate challenge count ranking
  const sortedByChallengeCount = [...courseSummaryWithPoints].sort(
    (a, b) => (b.challengeCount || 0) - (a.challengeCount || 0),
  )
  sortedByChallengeCount.forEach((player, index) => {
    player.challengeRank = index + 1
  })

  // Build response
  const resbody: CourseSummary[] = courseSummaryWithPoints.map((player) => ({
    ...player,
    totalPoint: player.totalPoint,
    pointRank: player.pointRank,
    challengeRank: player.challengeRank,
  }))

  return Response.json(resbody)
}
