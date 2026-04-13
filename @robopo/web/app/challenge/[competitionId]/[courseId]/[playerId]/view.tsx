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
  const { setStarted } = useAudioContext()
  const { setDirty } = useNavigationGuard()

  // ページ表示と同時にチャレンジを開始
  useEffect(() => {
    setStarted(true)
    setDirty(true)
    return () => setDirty(false)
  }, [setStarted, setDirty])

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
          courseName={courseData.name}
          playerName={playerData.name}
        />
      )}
    </div>
  )
}
