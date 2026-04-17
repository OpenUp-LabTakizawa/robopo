import { getCompetitionById } from "@/lib/db/queries/queries"
import { maxCoursePoint } from "@/lib/summary/calculations"
import { getCompetitionCourseList, getCompetitionPlayerList } from "@/server/db"

function shouldMask(competition: {
  maskEnabled: boolean
  maskMinutesBefore: number
  endDate: Date | null
}): boolean {
  if (!competition.maskEnabled || !competition.endDate) {
    return false
  }
  const now = new Date()
  const maskStartTime = new Date(
    new Date(competition.endDate).getTime() -
      competition.maskMinutesBefore * 60 * 1000,
  )
  return now >= maskStartTime
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId: rawId } = await params
  const competitionId = Number(rawId)

  if (Number.isNaN(competitionId) || competitionId <= 0) {
    return Response.json({ error: "Invalid competition ID." }, { status: 400 })
  }

  const [competitionData, { competitionCourses }, { players }] =
    await Promise.all([
      getCompetitionById(competitionId),
      getCompetitionCourseList(competitionId),
      getCompetitionPlayerList(competitionId),
    ])

  if (!competitionData) {
    return Response.json({ error: "Competition not found." }, { status: 404 })
  }

  const masked = shouldMask(competitionData)

  // Calculate total points for each player across all courses (parallelized)
  const playerScores = await Promise.all(
    players.map(async (player) => {
      const coursePoints = await Promise.all(
        competitionCourses.map((course) =>
          maxCoursePoint(competitionId, player.id, course.id),
        ),
      )
      const totalPoint = coursePoints.reduce((sum, pt) => sum + pt, 0)
      return {
        playerId: player.id,
        playerName: masked ? "???" : player.name,
        bibNumber: masked ? null : player.bibNumber,
        totalPoint,
      }
    }),
  )

  // Filter out 0-point players and sort by score descending
  const ranked = playerScores
    .filter((p) => p.totalPoint > 0)
    .sort((a, b) => b.totalPoint - a.totalPoint)

  // Assign ranks (handle ties)
  let currentRank = 1
  const result = ranked.map((player, i) => {
    if (i > 0 && player.totalPoint < ranked[i - 1].totalPoint) {
      currentRank = i + 1
    }
    return { ...player, rank: currentRank }
  })

  return Response.json({ players: result, masked })
}
