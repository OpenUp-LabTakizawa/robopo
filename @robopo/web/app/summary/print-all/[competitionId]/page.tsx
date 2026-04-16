import type { Metadata } from "next"
import { PrintBulkSheet } from "@/components/summary/printBulkSheet"
import { getCompetitionById } from "@/lib/db/queries/queries"
import { buildCoursesForPlayer } from "@/lib/summary/buildCourseData"
import { getCompetitionPlayerList } from "@/server/db"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitionId: string }>
}): Promise<Metadata> {
  const { competitionId } = await params
  const competition = await getCompetitionById(Number(competitionId))
  return {
    title: competition
      ? `${competition.name}_個人成績シート一括`
      : "個人成績シート一括印刷",
  }
}

export default async function PrintAllSummary({
  params,
}: {
  params: Promise<{ competitionId: string }>
}) {
  const { competitionId: rawId } = await params
  const competitionId = Number(rawId)

  const [competitionData, { players }] = await Promise.all([
    getCompetitionById(competitionId),
    getCompetitionPlayerList(competitionId),
  ])

  if (!competitionData) {
    return <div className="p-8 text-center">大会が見つかりません</div>
  }

  // Build course data for all players in parallel
  const playerSheets = await Promise.all(
    players.map(async (player) => {
      const { courses, totalPoint, totalChallengeCount } =
        await buildCoursesForPlayer(competitionId, player.id)

      return {
        player: {
          id: player.id,
          name: player.name,
          furigana: player.furigana,
          bibNumber: player.bibNumber,
        },
        courses,
        totalPoint,
        totalChallengeCount,
      }
    }),
  )

  return (
    <PrintBulkSheet
      competitionName={competitionData.name}
      players={playerSheets}
    />
  )
}
