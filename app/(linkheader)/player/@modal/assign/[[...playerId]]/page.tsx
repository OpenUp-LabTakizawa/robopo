import { getCompetitionList } from "@/app/components/common/utils"
import { SelectCompetition } from "@/app/lib/db/schema"
import { AssignPlayerModal } from "./modal"

export default async function AssignPlayer({ params }: { params: Promise<{ playerId: number[] }> }) {
  const playerId = await (await params).playerId
  const competitionList: { competitions: SelectCompetition[] } = await getCompetitionList()

  return (
    <AssignPlayerModal playerId={playerId} competitionList={competitionList} />
  )
}
