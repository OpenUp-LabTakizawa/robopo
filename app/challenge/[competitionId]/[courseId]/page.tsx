import { getCompetitionPlayerList } from "@/app/components/server/db"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"
import { getCourseById } from "@/app/lib/db/queries/queries"
import { View } from "@/app/challenge/[competitionId]/[courseId]/view"

export default async function Challenge(props: { params: Promise<{ competitionId: number; courseId: number }> }) {
  const params = await props.params;
  const { competitionId, courseId } = params
  const initialPlayerDataList: { players: SelectPlayer[] } = await getCompetitionPlayerList(competitionId)

  // courseIdからcourseDataを取得
  const courseData: SelectCourse | null = await getCourseById(courseId)

  return (
    (courseData && (
      <View
        courseData={courseData}
        initialPlayerDataList={initialPlayerDataList}
        competitionId={competitionId}
        courseId={courseId}
      />
    )) || (
      <div className="flex flex-col justify-center items-center overflow-y-auto w-full">
        <h2>コースが割り当てられていません。</h2>
      </div>
    )
  )
}
