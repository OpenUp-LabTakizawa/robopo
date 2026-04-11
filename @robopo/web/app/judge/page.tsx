import { View } from "@/app/components/common/view"
import {
  getJudgeWithCompetition,
  groupByJudge,
} from "@/app/lib/db/queries/queries"
import type { SelectJudgeWithCompetition } from "@/app/lib/db/schema"

export const revalidate = 0

export default async function JudgePage() {
  const initialJudgeDataList: SelectJudgeWithCompetition[] = await groupByJudge(
    await getJudgeWithCompetition(),
  )

  return <View type="judge" initialCommonDataList={initialJudgeDataList} />
}
