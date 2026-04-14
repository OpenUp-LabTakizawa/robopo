import { AssignModal } from "@/app/components/common/commonModal"
import type { SelectCompetition } from "@/app/lib/db/schema"
import { getCompetitionList } from "@/app/server/db"

export default async function AssignCourse({
  params,
}: {
  params: Promise<{ courseId: number[] }>
}) {
  const { courseId } = await params
  const competitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()

  return (
    <AssignModal
      ids={courseId}
      type="course"
      competitionList={competitionList}
    />
  )
}
