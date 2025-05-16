import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"
import { getCourseById, getPlayerById } from "@/app/lib/db/queries/queries"
import { View } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/view"

export default async function Challenge(props: {
  params: Promise<{ competitionId: number; courseId: number; playerId: number }>
}) {
  const params = await props.params

  const { competitionId, courseId, playerId } = params

  // courseIdからcourseDataを取得
  const courseData: SelectCourse | null = await getCourseById(courseId)
  // playerIdからplayerDataを取得
  const playerData: SelectPlayer | null = await getPlayerById(playerId)

  return (
    (courseData && playerData && (
      <View courseData={courseData} playerData={playerData} competitionId={competitionId} courseId={courseId} />
    )) || (
      <div className="flex flex-col justify-center items-center overflow-y-auto w-full">
        <h2>コースを割り当てられていません。</h2>
      </div>
    )
  )
}
