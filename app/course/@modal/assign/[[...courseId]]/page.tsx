import { AssignModal } from "@/app/components/common/commonModal"
import { getCompetitionList } from "@/app/components/server/db"
import type { SelectCompetition } from "@/app/lib/db/schema"

export default async function AssignCourse({
  params,
}: { params: Promise<{ courseId: number[] }> }) {
  const courseId = await (await params).courseId
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
