import { getCompetitionList } from "@/app/components/server/db"
import { SelectCompetition } from "@/app/lib/db/schema"
import { AssignModal } from "@/app/components/common/commonModal"

export default async function AssignCourse({ params }: { params: Promise<{ courseId: number[] }> }) {
  const courseId = await (await params).courseId
  const competitionList: { competitions: SelectCompetition[] } = await getCompetitionList()

  return (
    <AssignModal ids={courseId} type="course" competitionList={competitionList} />
  )
}
