import { getCompetitionList } from "@/app/components/server/db"
import { View } from "@/app/config/view"
import type { SelectCompetition } from "@/app/lib/db/schema"

export const revalidate = 0

export default async function Config() {
  const initialCompetitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()

  return <View initialCompetitionList={initialCompetitionList} />
}
