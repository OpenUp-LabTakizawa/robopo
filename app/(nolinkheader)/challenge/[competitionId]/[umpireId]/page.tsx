import { getPlayerList } from "@/app/components/common/utils"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"
import { getCourseIdByCompetitionIdAndUmpireId, getCourseById } from "@/app/lib/db/queries/queries"
import { View } from "@/app/(nolinkheader)/challenge/[competitionId]/[umpireId]/view"

export default async function Challenge(props: { params: Promise<{ competitionId: number; umpireId: number }> }) {
  const params = await props.params;
  const initialPlayerDataList: { players: SelectPlayer[] } = await getPlayerList()

  const { competitionId, umpireId } = params

  // 割り当てられているcourseIdを取得
  const courseId = await getCourseIdByCompetitionIdAndUmpireId(competitionId, umpireId)
  // courseIdからcourseDataを取得
  const courseData: SelectCourse | null = await getCourseById(courseId[0].courseId)

  return (
    (courseData && (
      <View
        courseData={courseData}
        initialPlayerDataList={initialPlayerDataList}
        competitionId={competitionId}
        umpireId={umpireId}
      />
    )) || (
      <div className="flex flex-col justify-center items-center overflow-y-auto w-full">
        <h2>コースを割り当てられていません。</h2>
      </div>
    )
  )
}
