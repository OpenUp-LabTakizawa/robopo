import { getCompetitionList } from "@/app/components/common/utils"
import { SelectCompetition } from "@/app/lib/db/schema"
import { AssignModal } from "@/app/components/common/commonModal"

export default async function AssignPlayer({ params }: { params: Promise<{ playerId: number[] }> }) {
  const playerId = await (await params).playerId
  const competitionList: { competitions: SelectCompetition[] } = await getCompetitionList()

  return (
    <AssignModal ids={playerId} type="player" competitionList={competitionList} />
  )
}
