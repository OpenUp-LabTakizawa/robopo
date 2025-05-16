import Link from "next/link"
import { SelectCourse } from "@/app/lib/db/schema"
import { getCompetitionCourseList } from "@/app/components/server/db"
import { SummaryTable } from "@/app/summary/[competitionId]/summaryTable"
import { deserializePoint, RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import { getCourseById } from "@/app/lib/db/queries/queries"

export const revalidate = 0

export default async function Summary(props: { params: Promise<{ competitionId: number }> }) {
  const params = await props.params
  const competitionId = params.competitionId

  const { competitionCourses } = await getCompetitionCourseList(competitionId)
  const courseList: { courses: SelectCourse[] } = { courses: competitionCourses }
  const ipponBashiCourse = await getCourseById(RESERVED_COURSE_IDS.IPPON)
  if (!ipponBashiCourse) {
    throw new Error("一本橋コースが見つかりません")
  }
  const ipponBashiPoint = deserializePoint(ipponBashiCourse.point)

  return (
    <div className="h-full w-full">
      <SummaryTable id={competitionId} courseList={courseList} ipponBashiPoint={ipponBashiPoint} />
      <Link href="/" className="btn btn-primary min-w-28 max-w-fit mx-auto mt-10">
        トップへ戻る
      </Link>
    </div>
  )
}
