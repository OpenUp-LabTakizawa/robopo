"use client"
import { type SelectCourse, type SelectPlayer } from "@/app/lib/db/schema"
import Challenge from "@/app/challenge/challenge"
import { SensorCourse } from "@/app/components/challenge/sensorCourse"
import { useBeforeUnload } from "@/app/components/beforeUnload/useBeforeUnload"

type ViewProps = {
  courseData: SelectCourse
  playerData: SelectPlayer
  competitionId: number
  umpireId: number
}

export const View = ({ courseData, playerData, competitionId, umpireId }: ViewProps) => {
  useBeforeUnload(true)
  const courseId = courseData.id
  const playerId = playerData.id

  return (
    <div className="flex flex-col justify-center items-center overflow-y-auto w-full pt-10">
      {/* ベーシックコースとTHE一本橋 */}
      {courseId !== null && courseId !== -2 && playerId !== null && (
        <Challenge
          field={courseData.field}
          mission={courseData.mission}
          point={courseData.point}
          compeId={competitionId}
          courseId={courseId}
          playerId={playerId}
          umpireId={umpireId}
        />
      )}

      {/* センサーコース */}
      {courseId === -2 && playerId !== null && (
        <SensorCourse compeId={competitionId} courseId={-2} playerId={playerId} umpireId={umpireId} />
      )}
    </div>
  )
}
