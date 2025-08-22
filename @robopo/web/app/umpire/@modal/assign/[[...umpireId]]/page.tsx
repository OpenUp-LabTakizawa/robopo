import { AssignModal } from "@/app/components/common/commonModal"
import { getCompetitionList } from "@/app/components/server/db"
import type { SelectCompetition } from "@/app/lib/db/schema"

export default async function AssignUmpire({
  params,
}: {
  params: Promise<{ umpireId: number[] }>
}) {
  const { umpireId } = await params
  const competitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()

  return (
    <AssignModal
      ids={umpireId}
      type="umpire"
      competitionList={competitionList}
    />
  )
}
