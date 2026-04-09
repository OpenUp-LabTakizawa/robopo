import { redirect } from "next/navigation"
import { View } from "@/app/challenge/[competitionId]/[courseId]/view"
import { getCompetitionPlayerList } from "@/app/components/server/db"
import { getCourseById } from "@/app/lib/db/queries/queries"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export default async function Challenge({
  params,
  searchParams,
}: {
  params: Promise<{ competitionId: number; courseId: number }>
  searchParams: Promise<{ umpireId?: string }>
}) {
  const { competitionId, courseId } = await params
  const { umpireId } = await searchParams

  const parsedUmpireId = umpireId ? Number(umpireId) : null
  if (!parsedUmpireId || Number.isNaN(parsedUmpireId) || parsedUmpireId <= 0) {
    redirect("/")
  }

  const initialPlayerDataList: { players: SelectPlayer[] } =
    await getCompetitionPlayerList(competitionId)

  const courseData: SelectCourse | null = await getCourseById(courseId)

  return courseData ? (
    <View
      courseData={courseData}
      initialPlayerDataList={initialPlayerDataList}
      competitionId={competitionId}
      courseId={courseId}
      umpireId={parsedUmpireId}
    />
  ) : (
    <div className="flex w-full flex-col items-center justify-center overflow-y-auto">
      <h2>コースが割り当てられていません。</h2>
    </div>
  )
}
