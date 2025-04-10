import { getPlayerList } from "@/app/components/challenge/utils"
import type { SelectPlayer } from "@/app/lib/db/schema"
import { View } from "@/app/components/common/view"

export const revalidate = 0

export default async function Player() {
  const initialPlayerDataList: { players: SelectPlayer[] } = await getPlayerList()

  return <View type="player" initialCommonDataList={initialPlayerDataList} />
}
