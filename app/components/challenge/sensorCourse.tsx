import { ChallengeModal } from "@/app/challenge/challengeModal"
import { resultSubmit } from "@/app/components/challenge/utils"
import { SendIcon } from "@/app/lib/const"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

type SensorCourseProps = {
  compeId: number
  courseId: number
  playerId: number
  umpireId: number
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

export function SensorCourse({
  compeId,
  courseId,
  playerId,
  umpireId,
  setIsEnabled,
}: SensorCourseProps) {
  const [result1, setResult1] = useState<number>(0) // 進んだmission
  const [tunnelPoint, setTunnelPoint] = useState<number>(0)
  const [wallPoint, setWallPoint] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [modalOpen, setModalOpen] = useState<number>(0)
  const [pointCount, setPointCount] = useState<number>(0)
  const [isRetry, setIsRetry] = useState<boolean>(false)
  const router = useRouter()

  // 壁停止のポイント配列を20, 10, 5, 3, 0, -5で作成
  const wallPointArray = [20, 10, 5, 3, 0, -5]

  // 選択で得点計算する
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // トンネル停止
    if (e.target.id === "tunnelradio") {
      const value = Number(e.target.value)
      setTunnelPoint(value)
      setPointCount(wallPoint + value)
    } else if (e.target.id === "tunnelcheckbox") {
      if (e.target.checked) {
        setTunnelPoint(10)
        setPointCount(wallPoint + 10)
      } else {
        setTunnelPoint(0)
        setPointCount(wallPoint)
      }
    }

    // 壁停止
    if (e.target.id === "wallradio") {
      const value = Number(e.target.value)
      setWallPoint(value)
      setPointCount(tunnelPoint + value)
    }
  }

  // やり直しする時
  function handleRetry() {
    setResult1(pointCount)
    setTunnelPoint(0)
    setWallPoint(0)
    setPointCount(0)
    setIsRetry(true)
  }

  return (
    <div className="relative flex flex-col justify-items-center w-full h-[calc(100vh-100px)]">
      <div className="grid justify-items-center w-full">
        <p className="text-xl font-bold">センサーコース</p>
      </div>
      <div className="flex flex-col">
        <div className="stats shadow-sm">
          <div className="stat">
            <div className="stat-title text-3xl font-bold text-orange-600">
              現在:
            </div>
            <div className="stat-value text-3xl font-bold text-orange-600">
              {pointCount}ポイント
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full">
          <div className="w-1/5" />
          <div>
            <label className="label justify-start text-xl mx-auto">
              <input
                type="checkbox"
                id="tunnelcheckbox"
                checked={tunnelPoint === 10}
                className="checkbox checkbox-lg checkbox-primary"
                onChange={(e) => handleChange(e)}
              />
              <p className="text-xl ml-3">トンネルで停止</p>
            </label>
            <div className="flex flex-row">
              <label className="label justify-start text-xl mx-auto">
                <input
                  type="radio"
                  id="tunnelradio"
                  className="radio radio-lg radio-primary"
                  onChange={(e) => handleChange(e)}
                  checked={tunnelPoint === 0}
                  value={0}
                />
                <p className="text-xl ml-3">0P</p>
              </label>
              <label className="label justify-start text-xl mx-auto">
                <input
                  type="radio"
                  id="tunnelradio"
                  className="radio radio-lg radio-primary"
                  onChange={(e) => handleChange(e)}
                  checked={tunnelPoint === 10}
                  value={10}
                />
                <p className="text-xl ml-3">10P</p>
              </label>
            </div>
            <div className="divider m-1" />
            <label className="label justify-start text-xl mx-auto">
              <input
                type="checkbox"
                id="wallcheckbox"
                className="checkbox checkbox-lg checkbox-primary"
                onChange={(e) => handleChange(e)}
                checked={wallPoint !== 0 && wallPoint !== -5}
              />
              <p className="text-xl ml-3">壁で停止</p>
            </label>
            <div className="grid grid-cols-2">
              {wallPointArray.map((point) => (
                <div key={point}>
                  <label className="label justify-start text-xl mx-auto">
                    <input
                      type="radio"
                      id="wallradio"
                      className="radio radio-lg radio-primary"
                      onChange={(e) => handleChange(e)}
                      checked={wallPoint === point}
                      value={point}
                    />
                    <p className="text-xl ml-3">{point}P</p>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center w-full">
          <button
            type="button"
            className="btn btn-accent mx-auto m-3"
            onClick={() => setModalOpen(1)}
          >
            結果送信
            <SendIcon />
          </button>
          <button
            type="button"
            className="btn btn-primary mx-auto m-3"
            onClick={handleRetry}
            disabled={isRetry}
          >
            やり直し
          </button>
        </div>
      </div>
      {modalOpen === 1 && (
        // センサーコースはresultにそのまま得点を入れる。
        <ChallengeModal
          setModalOpen={setModalOpen}
          handleSubmit={() =>
            resultSubmit(
              isRetry ? result1 : pointCount,
              isRetry ? pointCount : null,
              compeId,
              courseId,
              playerId,
              umpireId,
              setMessage,
              setIsSuccess,
              setLoading,
              router,
              setIsEnabled,
            )
          }
          handleRetry={handleRetry}
          loading={loading}
          isSuccess={isSuccess}
          message={message}
          result1Point={isRetry ? result1 : pointCount}
          result2Point={isRetry ? pointCount : null}
          isGoal={false}
        />
      )}
    </div>
  )
}
