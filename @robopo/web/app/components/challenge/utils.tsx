import type { useRouter } from "next/navigation"
import type React from "react"
import type { PointState } from "@/app/components/course/utils"

// 進んだmissionの数によって獲得したポイントを計算する
// pointState contains points in order: start, goal, mission...
// First mission starts at index=2 with point pointState[2], point for index=i is pointState[i]
// Last mission is at index=pointState.length-1, at which point goal points pointState[1] are added
// Get numeric value from a PointEntry (for tier entries, defaults to first tier value)
function pointEntryValue(entry: PointState[number]): number {
  if (entry === null) {
    return 0
  }
  if (Array.isArray(entry)) {
    return entry[0] ?? 0 // Default to first tier for now
  }
  return Number(entry)
}

export function calcPoint(pointState: PointState, index: number | null) {
  if (index === null) {
    return 0
  }
  let point = pointEntryValue(pointState[0]) // Initial value is start value (handicap)
  for (let i = 2; i < index + 2; i++) {
    point += pointEntryValue(pointState[i])
    if (i === pointState.length - 1) {
      point += pointEntryValue(pointState[1]) // Add goal points
    }
  }
  return point
}

// Submit result
export async function resultSubmit(
  firstResult: number,
  retryResult: number | null,
  competitionId: number,
  courseId: number,
  playerId: number,
  judgeId: number,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
  setIsEnabled: (value: boolean) => void,
) {
  setLoading(true)
  setIsEnabled(false)

  const requestBody = {
    firstResult,
    retryResult,
    competitionId,
    courseId: courseId,
    playerId: playerId,
    judgeId: judgeId,
  }

  try {
    const response = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
    if (response.ok) {
      setMessage("チャレンジの送信に成功しました")
      setIsSuccess(true)
      router.push("/")
    } else {
      setMessage("チャレンジの送信に失敗しました")
    }
  } catch (error) {
    setMessage(`送信中にエラーが発生しました: ${error}`)
  } finally {
    setIsEnabled(true)
    setLoading(false)
  }
}
