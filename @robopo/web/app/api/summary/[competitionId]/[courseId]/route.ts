import { getCompetitionCourseList } from "@/app/components/server/db"
import { maxCoursePoint } from "@/app/components/summary/utilServer"
import type { CourseSummary } from "@/app/components/summary/utils"
import { getCourseSummary } from "@/app/lib/db/queries/queries"

export const revalidate = 0

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

  // Calculate total score across all competition courses for each player
  const courseSummaryWithPoints = await Promise.all(
    courseSummary.map(async (player) => {
      const playerId = player.playerId || 0

      // Sum max score across all competition courses
      let totalPoint = 0
      for (const c of competitionCourses) {
        const maxPt = await maxCoursePoint(competitionIdNum, playerId, c.id)
        totalPoint += maxPt
      }

      return {
        ...player,
        totalPoint,
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
