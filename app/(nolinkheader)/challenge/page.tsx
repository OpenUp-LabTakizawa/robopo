import { getPlayerList, getCourseList } from "@/app/components/common/utils"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"
import { View } from "@/app/(nolinkheader)/challenge/view"

export default async function Challenge() {
  const courseDataList: { selectCourses: SelectCourse[] } = await getCourseList()
  const initialPlayerDataList: { players: SelectPlayer[] } = await getPlayerList()

  return <View courseDataList={courseDataList} initialPlayerDataList={initialPlayerDataList} />
}
