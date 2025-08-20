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

  // データ取得
  const courseSummary = await getCourseSummary(
    Number(competitionId),
    Number(courseId),
  )
  const course = await getCourseById(Number(courseId))
  const pointState = deserializePoint(course?.point as string)

  // 各プレイヤーの総得点と一本橋の総得点を計算
  const courseSummaryWithPoints = await Promise.all(
    courseSummary.map(async (player) => {
      const sumIpponPoints = await sumIpponPoint(
        Number(competitionId),
        player.playerId || 0,
      )
      const totalPoint =
        calcPoint(pointState, player.tCourseMaxResult) +
        (player.sensorMaxResult || 0) +
        (player.ipponMaxResult || 0)
      return {
        ...player,
        totalPoint,
        sumIpponPoint: sumIpponPoints,
      }
    }),
  )

  // 総得点の順位を計算
  const sortedByTotalPoints = [...courseSummaryWithPoints].sort(
    (a, b) => b.totalPoint - a.totalPoint,
  )
  sortedByTotalPoints.forEach((player, index) => {
    player.pointRank = index + 1 // 総得点の順位
  })

  // チャレンジ回数の順位を計算
  const sortedByChallengeCount = [...courseSummaryWithPoints].sort(
    (a, b) => (b.challengeCount || 0) - (a.challengeCount || 0),
  )
  sortedByChallengeCount.forEach((player, index) => {
    player.challengeRank = index + 1 // チャレンジ回数の順位
  })

  // レスポンスの構築
  const resbody: CourseSummary[] = courseSummaryWithPoints.map((player) => ({
    ...player,
    totalPoint: player.totalPoint, // 総得点
    sumIpponPoint: player.sumIpponPoint, // 一本橋の全得点合計
    pointRank: player.pointRank, // 総得点の順位
    challengeRank: player.challengeRank, // チャレンジ回数の順位
  }))

  return Response.json(resbody)
}
