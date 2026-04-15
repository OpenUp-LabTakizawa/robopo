import { redirect } from "next/navigation"
import { View } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/view"
import { getCourseById, getPlayerById } from "@/lib/db/queries/queries"
import type { SelectCourse, SelectPlayer } from "@/lib/db/schema"

export default async function Challenge({
  params,
  searchParams,
}: {
  params: Promise<{ competitionId: number; courseId: number; playerId: number }>
  searchParams: Promise<{ judgeId?: string }>
}) {
  const { competitionId, courseId, playerId } = await params
  const { judgeId } = await searchParams

  const parsedJudgeId = judgeId ? Number(judgeId) : null
  if (!parsedJudgeId || Number.isNaN(parsedJudgeId) || parsedJudgeId <= 0) {
    redirect("/")
  }

  const courseData: SelectCourse | null = await getCourseById(courseId)
  const playerData: SelectPlayer | null = await getPlayerById(playerId)

  return courseData && playerData ? (
    <View
      courseData={courseData}
      playerData={playerData}
      competitionId={competitionId}
      courseId={courseId}
      judgeId={parsedJudgeId}
    />
  ) : (
    <div className="flex w-full flex-col items-center justify-center overflow-y-auto">
      <h2>コースを割り当てられていません。</h2>
    </div>
  )
}
