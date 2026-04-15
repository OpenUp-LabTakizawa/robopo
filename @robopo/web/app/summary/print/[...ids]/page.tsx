import { PrintScoreSheet } from "@/components/summary/printScoreSheet"
import { getCompetitionById, getPlayerById } from "@/lib/db/queries/queries"
import { buildCoursesForPlayer } from "@/lib/summary/buildCourseData"

export default async function PrintSummaryPlayer({
  params,
}: {
  params: Promise<{ ids: number[] }>
}) {
  const { ids } = await params
  const competitionId = ids[0]
  const playerId = ids[2]

  const [player, competitionData] = await Promise.all([
    getPlayerById(playerId),
    getCompetitionById(competitionId),
  ])
  if (!player) {
    return <div className="p-8 text-center">選手が見つかりません</div>
  }

  const { courses, totalPoint, totalChallengeCount } =
    await buildCoursesForPlayer(competitionId, playerId)

  return (
    <PrintScoreSheet
      player={{
        name: player.name,
        furigana: player.furigana,
        bibNumber: player.bibNumber,
      }}
      competitionName={competitionData?.name ?? ""}
      courses={courses}
      totalPoint={totalPoint}
      totalChallengeCount={totalChallengeCount}
    />
  )
}
