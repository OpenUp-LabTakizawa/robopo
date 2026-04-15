import { AssignModal } from "@/components/common/commonModal"
import type { SelectCompetition } from "@/lib/db/schema"
import { getCompetitionList } from "@/server/db"

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
