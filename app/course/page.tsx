import Link from "next/link"
import { View } from "@/app/components/common/view"
import { getCourseWithCompetition, groupByCourse } from "@/app/lib/db/queries/queries"
import { SelectCourseWithCompetition } from "@/app/lib/db/schema"
import { HomeButton } from "@/app/components/parts/buttons"


export const revalidate = 0

export default async function Course() {
  const initialCourseDataList: SelectCourseWithCompetition[] = await groupByCourse(await getCourseWithCompetition())
  return (
    <>
      <Link href="/course/edit" className="btn btn-primary min-w-28 max-w-fit mx-auto">
        コース新規作成
      </Link>
      <View type="course" initialCommonDataList={initialCourseDataList} />
      <HomeButton />
    </>
  )
}
