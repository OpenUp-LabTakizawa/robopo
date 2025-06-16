import { View } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/view"
import { getCourseById, getPlayerById } from "@/app/lib/db/queries/queries"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export default async function Challenge({
  params,
}: {
  params: Promise<{ competitionId: number; courseId: number; playerId: number }>
}) {
  const { competitionId, courseId, playerId } = await params

  // courseIdからcourseDataを取得
  const courseData: SelectCourse | null = await getCourseById(courseId)
  // playerIdからplayerDataを取得
  const playerData: SelectPlayer | null = await getPlayerById(playerId)

  return courseData && playerData ? (
    <View
      courseData={courseData}
      playerData={playerData}
      competitionId={competitionId}
      courseId={courseId}
    />
  ) : (
    <div className="flex flex-col justify-center items-center overflow-y-auto w-full">
      <h2>コースを割り当てられていません。</h2>
    </div>
  )
}
