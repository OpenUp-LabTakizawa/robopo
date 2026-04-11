import { useRouter } from "next/navigation"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  SoundController,
  useAudioContext,
} from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
import {
  ChallengeModal,
  CourseOutModal,
  RetryModal,
} from "@/app/challenge/challengeModal"
import { calcPoint, resultSubmit } from "@/app/components/challenge/utils"
import { Field } from "@/app/components/course/field"
import {
  deserializeField,
  deserializeMission,
  deserializePoint,
  type FieldState,
  findStart,
  getMissionParameterUnit,
  getRobotPosition,
  MissionString,
  type MissionValue,
  missionStatePair,
  type PointState,
} from "@/app/components/course/utils"
import {
  BackButton,
  FailButton,
  ReloadButton,
  SubmitButton,
} from "@/app/components/parts/buttons"

// Type definitions
type ChallengeProps = {
  field: string | null
  mission: string | null
  point: string | null
  competitionId: number
  courseId: number
  playerId: number
  judgeId: number
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

type FieldPropsType = {
  type: "challenge" | "edit"
  field: FieldState
  botPosition: { row: number; col: number }
  botDirection: MissionValue
  nextMission: MissionValue[]
  onPanelClick: (row: number, col: number) => void
  nowMission: number
  isRetry: boolean
}

// チャレンジ用セクション
interface NormalChallengeSectionProps {
  isGoal: boolean
  pointState: PointState
  nowMission: number
  missionPair: MissionValue[][]
  pointCount: number | null
  handleBack: () => void
  handleTierSelect: (tierIndex: number) => void
  setModalOpen: (value: number) => void
  loading: boolean
  isSuccess: boolean
  message: string
  FieldProps: FieldPropsType
}

function NormalChallengeSection({
  isGoal,
  pointState,
  nowMission,
  missionPair,
  pointCount,
  handleBack,
  handleTierSelect,
  setModalOpen,
  loading,
  isSuccess,
  message,
  FieldProps,
}: NormalChallengeSectionProps) {
  // Check if current mission has tier points
  const currentPointEntry = !isGoal ? pointState[nowMission + 2] : null
  const isTierMission = Array.isArray(currentPointEntry)
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between border-base-300 border-b bg-base-100 px-4 py-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-sm">
          チャレンジ {FieldProps.isRetry ? "2回目" : "1回目"}
        </span>
        <div className="score-display text-right">
          <p className="text-base-content/50 text-xs">
            {isGoal ? "クリア" : "現在"}
          </p>
          <p className="font-bold text-2xl text-accent">
            {pointCount}
            <span className="text-sm">pt</span>
          </p>
        </div>
      </div>

      {/* Goal celebration or Mission info */}
      {isGoal ? (
        <div className="flex flex-col items-center gap-3 bg-success/5 px-4 py-4">
          <p className="font-bold text-2xl text-success">おめでとう!</p>
          {pointState[1] !== null &&
            !Array.isArray(pointState[1]) &&
            pointState[1] > 0 && (
              <p className="text-sm text-success/80">
                ゴールボーナス: +{pointState[1]}pt
              </p>
            )}
          {isSuccess ? (
            <p className="text-base-content/50 text-sm">
              ホーム画面へ自動遷移します
            </p>
          ) : (
            <SubmitButton
              onClick={() => setModalOpen(1)}
              loading={loading}
              disabled={loading}
              className="btn-lg"
            />
          )}
          {message && <p className="text-base-content/60 text-sm">{message}</p>}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4 bg-base-200/50 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-content text-sm">
            {nowMission + 1}
          </div>
          <div>
            <p className="font-bold text-lg text-primary">
              {missionPair[nowMission][0] === null
                ? "-"
                : MissionString[missionPair[nowMission][0]]}
              {missionPair[nowMission][1] === null
                ? ""
                : ` ${missionPair[nowMission][1]}`}
              {missionPair[nowMission][0] === null
                ? ""
                : getMissionParameterUnit(missionPair[nowMission][0])}
            </p>
            {!isTierMission && (
              <p className="text-accent text-xs">
                +{pointState[nowMission + 2] as number}pt
              </p>
            )}
            {isTierMission && <p className="text-accent text-xs">段階評価</p>}
          </div>
        </div>
      )}

      {/* Tier selection UI - shown instead of field for tier missions */}
      {!isGoal && isTierMission ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 overflow-auto px-4 py-4">
          <p className="mb-2 font-bold text-base-content/60 text-sm">
            審判が評価を選択してください
          </p>
          <div className="grid w-full max-w-xs gap-2">
            {(currentPointEntry as number[]).map((pt, i) => (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: tiers may have duplicate values, need index for uniqueness
                key={i}
                type="button"
                className={`btn min-h-[48px] text-lg ${
                  i === 0 ? "btn-success" : pt < 0 ? "btn-error" : "btn-outline"
                }`}
                onClick={() => handleTierSelect(i)}
              >
                {pt}pt
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Field - centered */
        <div className="flex flex-1 items-center justify-center overflow-auto px-4">
          <Field {...FieldProps} />
        </div>
      )}

      {/* Action bar */}
      <div className="border-base-300 border-t bg-base-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <BackButton
            onClick={handleBack}
            disabled={FieldProps.nowMission === 0}
            variant="outline"
            className="flex-1"
          />
          {!isGoal && (
            <FailButton onClick={() => setModalOpen(1)} className="flex-1" />
          )}
        </div>
        <div className="mt-2 flex justify-center">
          <SoundController />
        </div>
      </div>
    </div>
  )
}

export function Challenge({
  field,
  mission,
  point,
  competitionId,
  courseId,
  playerId,
  judgeId,
  setIsEnabled,
}: ChallengeProps): React.JSX.Element {
  const router = useRouter()
  const fieldState = useMemo(() => deserializeField(field ?? ""), [field])
  const missionState = useMemo(
    () => deserializeMission(mission ?? ""),
    [mission],
  )
  const missionPair = useMemo(
    () => missionStatePair(missionState),
    [missionState],
  )
  const pointState: PointState = useMemo(() => deserializePoint(point), [point])
  const [isRetry, setIsRetry] = useState(false)
  const [isGoal, setIsGoal] = useState(false)
  const [nowMission, setNowMission] = useState(0)
  const [pointCount, setPointCount] = useState<number | null>(0)
  const [firstResult, setFirstResult] = useState(0)
  const [retryResult, setRetryResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [modalOpen, setModalOpen] = useState(0)
  const start = useMemo(() => findStart(fieldState), [fieldState])
  const [botPosition, setBotPosition] = useState({
    row: start?.[0] || 0,
    col: start?.[1] || 0,
  })
  const [botDirection, setBotDirection] = useState(missionState[0])
  const [strictMode, _setStrictMode] = useState(false)
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)
  const nextSound = nextAudioRef.current
  const backAudioRef = useRef<HTMLAudioElement | null>(null)
  const backSound = backAudioRef.current
  const goalAudioRef = useRef<HTMLAudioElement | null>(null)
  const goalSound = goalAudioRef.current
  const { muted } = useAudioContext()

  useEffect(() => {
    if (nextSound && backSound) {
      nextSound.volume = 0.4
      backSound.volume = 0.2
    }
  }, [nextSound, backSound])

  const handleNext = useCallback(
    (row: number, col: number) => {
      if (
        nowMission < missionPair.length &&
        pointState[nowMission + 2] !== null
      ) {
        const [newRow, newCol, direction] = getRobotPosition(
          start?.[0] || 0,
          start?.[1] || 0,
          missionState,
          nowMission + 1,
        )
        if ((strictMode && newRow === row && newCol === col) || !strictMode) {
          const point = calcPoint(pointState, nowMission + 1)
          setPointCount(point)
          if (nowMission === missionPair.length - 1) {
            setIsGoal(true)
            setModalOpen(1)
            !muted && goalSound?.play()
          } else if (nowMission < missionPair.length - 1) {
            setNowMission(nowMission + 1)
            !muted && nextSound?.play()
          }
          if (!isRetry && !isGoal) {
            setFirstResult(firstResult + 1)
          } else if (retryResult !== null && !isGoal) {
            setRetryResult(retryResult + 1)
          }
          setBotPosition({ row: newRow, col: newCol })
          setBotDirection(direction)
        }
      } else {
        setNowMission(0)
      }
    },
    [
      nowMission,
      missionPair.length,
      pointState,
      start,
      missionState,
      strictMode,
      isRetry,
      isGoal,
      firstResult,
      retryResult,
      muted,
      goalSound,
      nextSound,
    ],
  )

  const handleBack = useCallback(() => {
    if (nowMission > 0) {
      if (!isRetry) {
        setFirstResult(firstResult - 1)
      } else if (retryResult !== null) {
        setRetryResult(retryResult - 1)
      }
      const turnBackMission = isGoal ? nowMission : nowMission - 1
      const point = calcPoint(pointState, turnBackMission)
      setPointCount(point)
      const [row, col, direction] = getRobotPosition(
        start?.[0] || 0,
        start?.[1] || 0,
        missionState,
        turnBackMission,
      )
      setBotPosition({ row, col })
      setBotDirection(direction)
      setNowMission(turnBackMission)
      if (isGoal) {
        setIsGoal(false)
      }
      !muted && backSound?.play()
    }
  }, [
    nowMission,
    isRetry,
    firstResult,
    retryResult,
    isGoal,
    pointState,
    start,
    missionState,
    muted,
    backSound,
  ])

  const handleRetry = useCallback(() => {
    setIsRetry(true)
    setRetryResult(0)
    setPointCount(0)
    setNowMission(0)
    setIsGoal(false)
    setBotPosition({ row: start?.[0] || 0, col: start?.[1] || 0 })
    setBotDirection(missionState[0])
  }, [start, missionState])

  // Handle tier point selection (for graded scoring missions)
  const handleTierSelect = useCallback(
    (tierIndex: number) => {
      const currentEntry = pointState[nowMission + 2]
      if (!Array.isArray(currentEntry)) {
        return
      }

      const tierPoint = currentEntry[tierIndex] ?? 0
      // Calculate point manually: base + tier point for this mission
      const basePoint = calcPoint(pointState, nowMission)
      const newPoint = basePoint + tierPoint
      // Add goal bonus if this is the last mission
      if (nowMission === missionPair.length - 1) {
        const goalEntry = pointState[1]
        const goalPt =
          goalEntry !== null && !Array.isArray(goalEntry)
            ? Number(goalEntry)
            : 0
        setPointCount(newPoint + goalPt)
        setIsGoal(true)
        setModalOpen(1)
        !muted && goalSound?.play()
      } else {
        setPointCount(newPoint)
        setNowMission(nowMission + 1)
        !muted && nextSound?.play()
      }

      // Update robot position
      const [newRow, newCol, direction] = getRobotPosition(
        start?.[0] || 0,
        start?.[1] || 0,
        missionState,
        nowMission + 1,
      )
      setBotPosition({ row: newRow, col: newCol })
      setBotDirection(direction)

      if (!isRetry && !isGoal) {
        setFirstResult(firstResult + 1)
      } else if (retryResult !== null && !isGoal) {
        setRetryResult(retryResult + 1)
      }
    },
    [
      nowMission,
      missionPair.length,
      pointState,
      start,
      missionState,
      isRetry,
      isGoal,
      firstResult,
      retryResult,
      muted,
      goalSound,
      nextSound,
    ],
  )

  const FieldProps = {
    type: "challenge" as FieldPropsType["type"],
    field: fieldState,
    botPosition,
    botDirection,
    nextMission: isGoal ? [null, null] : missionPair[nowMission],
    onPanelClick: handleNext,
    nowMission,
    isRetry,
  }
  if (field === null || mission === null || point === null) {
    return (
      <>
        <p>エラーです。</p>
        <ReloadButton />
      </>
    )
  }

  return (
    <>
      <audio src="/sound/02_next.mp3" ref={nextAudioRef} muted={muted} />
      <audio src="/sound/03_back.mp3" ref={backAudioRef} muted={muted} />
      <audio src="/sound/04_goal.mp3" ref={goalAudioRef} muted={muted} />
      <NormalChallengeSection
        isGoal={isGoal}
        pointState={pointState}
        nowMission={nowMission}
        missionPair={missionPair}
        pointCount={pointCount}
        handleBack={handleBack}
        handleTierSelect={handleTierSelect}
        setModalOpen={setModalOpen}
        loading={loading}
        isSuccess={isSuccess}
        message={message}
        FieldProps={FieldProps}
      />
      {modalOpen === 1 && (
        <ChallengeModal
          setModalOpen={setModalOpen}
          handleSubmit={() =>
            resultSubmit(
              firstResult,
              retryResult,
              competitionId,
              courseId,
              playerId,
              judgeId,
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
          firstResultPoint={
            isRetry ? calcPoint(pointState, firstResult) : pointCount
          }
          retryResultPoint={isRetry ? pointCount : null}
          isGoal={isGoal}
        />
      )}
      {modalOpen === 2 && (
        <RetryModal
          setModalOpen={setModalOpen}
          handleRetry={handleRetry}
          firstResultPoint={pointCount}
        />
      )}
      {modalOpen === 3 && (
        <CourseOutModal
          setModalOpen={setModalOpen}
          setFirstResult={setFirstResult}
          handleSubmit={() =>
            resultSubmit(
              isRetry ? firstResult : 0,
              isRetry ? 0 : retryResult,
              competitionId,
              courseId,
              playerId,
              judgeId,
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
          firstResultPoint={
            isRetry ? calcPoint(pointState, firstResult) : pointCount
          }
          retryResultPoint={isRetry ? pointCount : null}
        />
      )}
    </>
  )
}
