import {
  getCompetitionList,
  getCourseList,
  getUmpireList,
} from "@/app/components/server/db"
import View from "@/app/config/view"
import type {
  SelectCompetition,
  SelectCourse,
  SelectUmpire,
} from "@/app/lib/db/schema"

export const revalidate = 0

export default async function Config() {
  const initialCompetitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()
  const courseList: { courses: SelectCourse[] } = await getCourseList()
  const umpireList: { umpires: SelectUmpire[] } = await getUmpireList()

  return (
    <View
      initialCompetitionList={initialCompetitionList}
      courseList={courseList}
      umpireList={umpireList}
    />
  )
}
