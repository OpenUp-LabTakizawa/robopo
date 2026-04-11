"use client"

import { useEffect, useState } from "react"
import { useAudioContext } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
import { Challenge } from "@/app/challenge/challenge"
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
  const [isEnabled, setIsEnabled] = useState(false)

  // スタートボタンが押されたら離脱警告を有効化
  useEffect(() => {
    if (started) {
      setIsEnabled(true)
    }
  }, [started])

  useEffect(() => {
    if (!isEnabled) {
      return
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isEnabled])

  return (
    <div className="flex w-full flex-col items-center justify-center overflow-y-auto pt-10 sm:pt-px">
      {playerId !== null && (
        <Challenge
          field={courseData.field}
          mission={courseData.mission}
          point={courseData.point}
          competitionId={competitionId}
          courseId={courseId}
          playerId={playerId}
          judgeId={judgeId}
          setIsEnabled={setIsEnabled}
        />
      )}
    </div>
  )
}
