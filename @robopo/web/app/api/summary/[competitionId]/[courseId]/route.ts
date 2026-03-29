import { calcPoint } from "@/app/components/challenge/utils"
import { deserializePoint } from "@/app/components/course/utils"
import { sumIpponPoint } from "@/app/components/summary/utilServer"
import type { CourseSummary } from "@/app/components/summary/utils"
import { getCourseById, getCourseSummary } from "@/app/lib/db/queries/queries"

export const revalidate = 0

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string; courseId: string }> },
) {
  const { competitionId, courseId } = await params

  // Fetch data
  const courseSummary = await getCourseSummary(
    Number(competitionId),
    Number(courseId),
  )
  const course = await getCourseById(Number(courseId))
  const pointState = deserializePoint(course?.point as string)

  // Calculate total score and Ippon Bashi total score for each player
  const courseSummaryWithPoints = await Promise.all(
    courseSummary.map(async (player) => {
      const sumIpponPoints = await sumIpponPoint(
        Number(competitionId),
        player.playerId || 0,
      )
      const totalPoint =
        calcPoint(pointState, player.tCourseMaxResult) +
        (player.sensorMaxResult || 0) +
        sumIpponPoints
      return {
        ...player,
        totalPoint,
        sumIpponPoint: sumIpponPoints,
      }
    }),
  )

  // Calculate total score ranking
  const sortedByTotalPoints = [...courseSummaryWithPoints].sort(
    (a, b) => b.totalPoint - a.totalPoint,
  )
  sortedByTotalPoints.forEach((player, index) => {
    player.pointRank = index + 1 // Total score rank
  })

  // Calculate challenge count ranking
  const sortedByChallengeCount = [...courseSummaryWithPoints].sort(
    (a, b) => (b.challengeCount || 0) - (a.challengeCount || 0),
  )
  sortedByChallengeCount.forEach((player, index) => {
    player.challengeRank = index + 1 // Challenge count rank
  })

  // Build response
  const resbody: CourseSummary[] = courseSummaryWithPoints.map((player) => ({
    ...player,
    totalPoint: player.totalPoint, // Total score
    sumIpponPoint: player.sumIpponPoint, // Ippon Bashi total score
    pointRank: player.pointRank, // Total score rank
    challengeRank: player.challengeRank, // Challenge count rank
  }))

  return Response.json(resbody)
}
