import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"
import { getCourseById, getPlayerById } from "@/app/lib/db/queries/queries"
import { Modal } from "./modal"

export default async function Confirm(props: {
  params: Promise<{ competitionId: number; courseId: number; playerId: number }>
}) {
  const params = await props.params

  const { courseId, playerId } = params

  // courseIdからcourseDataを取得
  const courseData: SelectCourse | null = await getCourseById(courseId)
  // playerIdからplayerDataを取得
  const playerData: SelectPlayer | null = await getPlayerById(playerId)

  return (
    (courseData && playerData && <Modal courseData={courseData} playerData={playerData} />) || (
      <div className="flex flex-col justify-center items-center overflow-y-auto w-full">
        <h2>コースを割り当てられていません。</h2>
      </div>
    )
  )
}
