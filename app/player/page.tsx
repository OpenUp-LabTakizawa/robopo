import { View } from "@/app/components/common/view"
import {
  getPlayersWithCompetition,
  groupByPlayer,
} from "@/app/lib/db/queries/queries"
import type { SelectPlayerWithCompetition } from "@/app/lib/db/schema"

export const revalidate = 0

export default async function Player() {
  const initialPlayerDataList: SelectPlayerWithCompetition[] =
    await groupByPlayer(await getPlayersWithCompetition())

  return <View type="player" initialCommonDataList={initialPlayerDataList} />
}
