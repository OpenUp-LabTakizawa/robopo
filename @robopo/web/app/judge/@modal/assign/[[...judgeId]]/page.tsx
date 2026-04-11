import { AssignModal } from "@/app/components/common/commonModal"
import { getCompetitionList } from "@/app/components/server/db"
import type { SelectCompetition } from "@/app/lib/db/schema"

export default async function AssignJudge({
  params,
}: {
  params: Promise<{ judgeId: number[] }>
}) {
  const { judgeId } = await params
  const competitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()

  return (
    <AssignModal ids={judgeId} type="judge" competitionList={competitionList} />
  )
}
