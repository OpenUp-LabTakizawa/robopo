import { getCompetitionList, getUmpireList, getCourseList } from "@/app/components/server/db"
import { SelectCompetition, SelectCourse, SelectUmpire } from "@/app/lib/db/schema"
import View from "@/app/config/view"

export const revalidate = 0

export default async function Config() {
  const initialCompetitionList: { competitions: SelectCompetition[] } = await getCompetitionList()
  const courseList: { courses: SelectCourse[] } = await getCourseList()
  const umpireList: { umpires: SelectUmpire[] } = await getUmpireList()

  return <View initialCompetitionList={initialCompetitionList} courseList={courseList} umpireList={umpireList} />
}
