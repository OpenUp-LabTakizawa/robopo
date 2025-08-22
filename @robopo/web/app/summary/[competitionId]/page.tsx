import {
  deserializePoint,
  RESERVED_COURSE_IDS,
} from "@/app/components/course/utils"
import { HomeButton } from "@/app/components/parts/buttons"
import { getCompetitionCourseList } from "@/app/components/server/db"
import { getCourseById } from "@/app/lib/db/queries/queries"
import type { SelectCourse } from "@/app/lib/db/schema"
import { SummaryTable } from "@/app/summary/[competitionId]/summaryTable"

export const revalidate = 0

export default async function Summary({
  params,
}: {
  params: Promise<{ competitionId: number }>
}) {
  const { competitionId } = await params
  const { competitionCourses } = await getCompetitionCourseList(competitionId)
  const courseList: { courses: SelectCourse[] } = {
    courses: competitionCourses,
  }
  const ipponBashiCourse = await getCourseById(RESERVED_COURSE_IDS.IPPON)
  if (!ipponBashiCourse) {
    throw new Error("一本橋コースが見つかりません")
  }
  const ipponBashiPoint = deserializePoint(ipponBashiCourse.point)

  return (
    <div className="h-full w-full">
      <SummaryTable
        id={competitionId}
        courseList={courseList}
        ipponBashiPoint={ipponBashiPoint}
      />
      <HomeButton />
    </div>
  )
}
