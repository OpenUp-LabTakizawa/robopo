"use client"

import { useState } from "react"
import { useNavigationGuard } from "next-navigation-guard"
import { type SelectCourse, type SelectPlayer } from "@/app/lib/db/schema"
import { Challenge } from "@/app/challenge/challenge"
import { RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import { SensorCourse } from "@/app/components/challenge/sensorCourse"

type ViewProps = {
  courseData: SelectCourse
  playerData: SelectPlayer
  competitionId: number
  courseId: number
}

export const View = ({ courseData, playerData, competitionId, courseId }: ViewProps) => {
  const playerId = playerData.id
  const umpireId = 1 // 一旦1
  const [isEnabled, setIsEnabled] = useState(true)
  const navGuard = useNavigationGuard({
    enabled: isEnabled,
    confirm: () => window.confirm("このページを離れると編集中のデータは失われます。よろしいですか？"),
  })

  return (
    <div className="flex flex-col justify-center items-center overflow-y-auto w-full pt-10 sm:pt-px">
      {/* ベーシックコースとTHE一本橋 */}
      {Number(courseId) !== null && Number(courseId) !== RESERVED_COURSE_IDS.SENSOR && playerId !== null && (
        <Challenge
          field={courseData.field}
          mission={courseData.mission}
          point={courseData.point}
          compeId={competitionId}
          courseId={courseId}
          playerId={playerId}
          umpireId={umpireId}
          setIsEnabled={setIsEnabled}
        />
      )}

      {/* センサーコース */}
      {Number(courseId) === RESERVED_COURSE_IDS.SENSOR && playerId !== null && (
        <SensorCourse
          compeId={competitionId}
          courseId={courseId}
          playerId={playerId}
          umpireId={umpireId}
          setIsEnabled={setIsEnabled}
        />
      )}
    </div>
  )
}
