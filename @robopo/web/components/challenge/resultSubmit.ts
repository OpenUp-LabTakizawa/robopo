import type { useRouter } from "next/navigation"
import type React from "react"

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
  detail?: string | null,
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
    detail: detail ?? null,
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
    console.error("チャレンジ送信中にエラーが発生しました", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    setMessage(`送信中にエラーが発生しました: ${errorMessage}`)
  } finally {
    setIsEnabled(true)
    setLoading(false)
  }
}
