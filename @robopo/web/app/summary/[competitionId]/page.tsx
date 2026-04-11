import { HomeButton } from "@/app/components/parts/buttons"
import { getCompetitionCourseList } from "@/app/components/server/db"
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

  return (
    <div className="h-full w-full">
      <SummaryTable id={competitionId} courseList={courseList} />
      <HomeButton />
    </div>
  )
}
