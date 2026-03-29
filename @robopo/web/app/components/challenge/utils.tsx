import type { useRouter } from "next/navigation"
import type React from "react"
import type { PointState } from "@/app/components/course/utils"

// 進んだmissionの数によって獲得したポイントを計算する
// pointState contains points in order: start, goal, mission...
// First mission starts at index=2 with point pointState[2], point for index=i is pointState[i]
// Last mission is at index=pointState.length-1, at which point goal points pointState[1] are added
export function calcPoint(pointState: PointState, index: number | null) {
  if (index === null) {
    return 0
  }
  let point = Number(pointState[0]) // Initial value is start value (handicap)
  for (let i = 2; i < index + 2; i++) {
    point += Number(pointState[i])
    if (i === pointState.length - 1) {
      point += Number(pointState[1]) // Add goal points
    }
  }
  return point
}

// Submit result
export async function resultSubmit(
  result1: number,
  result2: number | null,
  compeId: number,
  courseId: number,
  playerId: number,
  umpireId: number,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setLoading(true)
  setIsEnabled(false)

  const requestBody = {
    result1: result1,
    result2: result2,
    competitionId: compeId,
    courseId: courseId,
    playerId: playerId,
    umpireId: umpireId,
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
