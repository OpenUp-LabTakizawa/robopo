import Link from "next/link"
import { SelectCourse } from "@/app/lib/db/schema"
import { getCourseList } from "@/app/components/common/utils"
import { SummaryTable } from "@/app/(nolinkheader)/summary/summaryTable"

export const revalidate = 0

export default async function Summary() {
  const { selectCourses } = await getCourseList()
  const courseList: { selectCourses: SelectCourse[] } = { selectCourses: selectCourses }

  return (
    <div className="h-full w-full">
      <SummaryTable courseList={courseList} />
      <Link href="/" className="btn btn-primary min-w-28 max-w-fit mx-auto mt-10">
        トップへ戻る
      </Link>
    </div>
  )
}
