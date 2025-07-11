"use client"

import { useNavigationGuard } from "next-navigation-guard"
import { useState } from "react"
import { Challenge } from "@/app/challenge/challenge"
import { SensorCourse } from "@/app/components/challenge/sensorCourse"
import { RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export function View({
  courseData,
  playerData,
  competitionId,
  courseId,
}: {
  courseData: SelectCourse
  playerData: SelectPlayer
  competitionId: number
  courseId: number
}) {
  const playerId = playerData.id
  const umpireId = 1 // 一旦1
  const [isEnabled, setIsEnabled] = useState(true)
  useNavigationGuard({
    enabled: isEnabled,
    confirm: () =>
      window.confirm(
        "このページを離れると編集中のデータは失われます。よろしいですか？",
      ),
  })

  return (
    <div className="flex w-full flex-col items-center justify-center overflow-y-auto pt-10 sm:pt-px">
      {/* ベーシックコースとTHE一本橋 */}
      {Number(courseId) !== RESERVED_COURSE_IDS.SENSOR && playerId !== null && (
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
