import { View } from "@/app/components/common/view"
import {
  getUmpireWithCompetition,
  groupByUmpire,
} from "@/app/lib/db/queries/queries"
import type { SelectUmpireWithCompetition } from "@/app/lib/db/schema"

export const revalidate = 0

export default async function Player() {
  const initialUmpireDataList: SelectUmpireWithCompetition[] =
    await groupByUmpire(await getUmpireWithCompetition())

  return <View type="umpire" initialCommonDataList={initialUmpireDataList} />
}
