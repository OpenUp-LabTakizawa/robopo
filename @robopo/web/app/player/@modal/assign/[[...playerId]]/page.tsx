import { AssignModal } from "@/app/components/common/commonModal"
import { getCompetitionList } from "@/app/components/server/db"
import type { SelectCompetition } from "@/app/lib/db/schema"

export default async function AssignPlayer({
  params,
}: {
  params: Promise<{ playerId: number[] }>
}) {
  const { playerId } = await params
  const competitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()

  return (
    <AssignModal
      ids={playerId}
      type="player"
      competitionList={competitionList}
    />
  )
}
