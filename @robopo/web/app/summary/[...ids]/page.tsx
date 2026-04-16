import type { Metadata } from "next"
import { PlayerScoreSheet } from "@/components/summary/playerScoreSheet"
import { getCompetitionById, getPlayerById } from "@/lib/db/queries/queries"
import { buildCoursesForPlayer } from "@/lib/summary/buildCourseData"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ids: number[] }>
}): Promise<Metadata> {
  const { ids } = await params
  const player = await getPlayerById(Number(ids[2]))
  return {
    title: player ? `${player.name} 個人成績` : "個人成績",
    description: "個人成績シート",
  }
}

export default async function SummaryPlayer({
  params,
}: {
  params: Promise<{ ids: number[] }>
}) {
  const { ids } = await params
  const competitionId = ids[0]
  const selectedCourseId = ids[1]
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
    <PlayerScoreSheet
      player={{
        name: player.name,
        furigana: player.furigana,
        bibNumber: player.bibNumber,
      }}
      competitionId={competitionId}
      competitionName={competitionData?.name ?? ""}
      selectedCourseId={selectedCourseId}
      playerId={playerId}
      courses={courses}
      totalPoint={totalPoint}
      totalChallengeCount={totalChallengeCount}
    />
  )
}
