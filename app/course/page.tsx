import { View } from "@/app/components/common/view"
import { HomeButton } from "@/app/components/parts/buttons"
import {
  getCourseWithCompetition,
  groupByCourse,
} from "@/app/lib/db/queries/queries"
import type { SelectCourseWithCompetition } from "@/app/lib/db/schema"
import Link from "next/link"

export const revalidate = 0

export default async function Course() {
  const initialCourseDataList: SelectCourseWithCompetition[] =
    await groupByCourse(await getCourseWithCompetition())
  return (
    <>
      <Link
        href="/course/edit"
        className="btn btn-primary min-w-28 max-w-fit mx-auto"
      >
        コース新規作成
      </Link>
      <View type="course" initialCommonDataList={initialCourseDataList} />
      <HomeButton />
    </>
  )
}
