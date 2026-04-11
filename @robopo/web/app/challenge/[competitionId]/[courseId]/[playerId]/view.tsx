"use client"

import { useEffect } from "react"
import { useAudioContext } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
import { Challenge } from "@/app/challenge/challenge"
import { useNavigationGuard } from "@/app/hooks/useNavigationGuard"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export function View({
  courseData,
  playerData,
  competitionId,
  courseId,
  judgeId,
}: {
  courseData: SelectCourse
  playerData: SelectPlayer
  competitionId: number
  courseId: number
  judgeId: number
}) {
  const playerId = playerData.id
  const { started } = useAudioContext()
  const { setDirty } = useNavigationGuard()

  // スタートボタンが押されたら離脱警告を有効化
  useEffect(() => {
    if (started) {
      setDirty(true)
    }
    return () => setDirty(false)
  }, [started, setDirty])

  return (
    <div className="flex w-full flex-col items-center justify-center overflow-y-auto pt-10 sm:pt-px">
      {playerId !== null && (
        <Challenge
          field={courseData.field}
          mission={courseData.mission}
          point={courseData.point}
          courseOutRule={courseData.courseOutRule}
          competitionId={competitionId}
          courseId={courseId}
          playerId={playerId}
          judgeId={judgeId}
          setIsEnabled={setDirty}
        />
      )}
    </div>
  )
}
