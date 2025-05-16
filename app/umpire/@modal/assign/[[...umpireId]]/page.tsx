import { getCompetitionList } from "@/app/components/server/db"
import { SelectCompetition } from "@/app/lib/db/schema"
import { AssignModal } from "@/app/components/common/commonModal"

export default async function AssignUmpire({ params }: { params: Promise<{ umpireId: number[] }> }) {
  const umpireId = await (await params).umpireId
  const competitionList: { competitions: SelectCompetition[] } = await getCompetitionList()

  return (
    <AssignModal ids={umpireId} type="umpire" competitionList={competitionList} />
  )
}
