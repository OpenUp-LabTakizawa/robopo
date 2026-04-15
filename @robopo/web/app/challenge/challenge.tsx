import { useRouter } from "next/navigation"
import type React from "react"
import { useCallback, useRef, useState } from "react"
import {
  SoundController,
  useAudioContext,
} from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
import {
  ChallengeModal,
  CourseOutModal,
  RetryModal,
} from "@/components/challenge/challengeModal"
import { MissionOverview } from "@/components/challenge/missionOverview"
import { resultSubmit } from "@/components/challenge/resultSubmit"
import { Field } from "@/components/course/field"
import {
  BackButton,
  CourseOutButton,
  FailButton,
  ReloadButton,
  SubmitButton,
} from "@/components/parts/buttons"
import { deserializeField, findStart } from "@/lib/course/field"
import {
  deserializeMission,
  getMissionParameterUnit,
  getRobotPosition,
  missionStatePair,
} from "@/lib/course/mission"
import { deserializePoint } from "@/lib/course/point"
import {
  type FieldState,
  MissionString,
  type MissionValue,
  type PointState,
} from "@/lib/course/types"
import {
  COURSE_OUT_FIRST,
  COURSE_OUT_RETRY,
  parseCourseOutRule,
} from "@/lib/scoring/course-out"
import { calcPoint, getMissionProgress } from "@/lib/scoring/scoring"

// Type definitions
type ChallengeProps = {
  field: string | null
  mission: string | null
  point: string | null
  courseOutRule: string
  competitionId: number
  courseId: number
  playerId: number
  judgeId: number
  setIsEnabled: (value: boolean) => void
  courseName: string
  playerName: string
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
  courseName: string
  playerName: string
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
  courseName,
  playerName,
}: NormalChallengeSectionProps) {
  // Check if current mission has tier points
  const currentPointEntry = !isGoal ? pointState[nowMission + 2] : null
  const isTierMission = Array.isArray(currentPointEntry)
  const progress = getMissionProgress(missionPair.length, nowMission, isGoal)
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col">
      {/* Status bar */}
      <div className="border-base-300 border-b bg-base-100">
        <div className="flex items-center justify-between px-3 py-1.5">
          {/* Left: attempt badge + course/player info */}
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary text-xs">
              {FieldProps.isRetry ? "2回目" : "1回目"}
            </span>
            <span className="truncate text-base-content/50 text-xs">
              {courseName} / {playerName}
            </span>
          </div>
          {/* Right: mission overview + sound + score */}
          <div className="flex shrink-0 items-center gap-1">
            <MissionOverview
              missionPair={missionPair}
              pointState={pointState}
              nowMission={nowMission}
              isGoal={isGoal}
              progress={progress}
            />
            <SoundController />
            <div className="score-display pl-1 text-right">
              <p className="font-bold text-accent text-xl leading-tight">
                {pointCount}
                <span className="text-xs">pt</span>
              </p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-base-300">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Goal celebration or Mission info */}
      {isGoal ? (
        <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-success/10 to-success/5 px-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <span className="text-3xl">&#127881;</span>
          </div>
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
        <div className="flex items-center justify-center gap-4 bg-base-200/30 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-primary-content text-sm shadow-sm">
            {nowMission + 1}
          </div>
          <div>
            <p className="font-bold text-lg text-primary leading-tight">
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
            <div className="flex items-center gap-2">
              {!isTierMission && (
                <p className="font-medium text-accent text-xs">
                  +{pointState[nowMission + 2] as number}pt
                </p>
              )}
              {isTierMission && (
                <span className="rounded-md bg-accent/10 px-2 py-0.5 font-medium text-accent text-xs">
                  段階評価
                </span>
              )}
              <span className="text-base-content/30 text-xs">
                {nowMission + 1}/{progress.total}
              </span>
            </div>
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
        <div className="flex items-center gap-2">
          <BackButton
            onClick={handleBack}
            disabled={FieldProps.nowMission === 0}
            variant="outline"
            className="flex-1"
          />
          {!isGoal && (
            <>
              <CourseOutButton
                onClick={() => setModalOpen(3)}
                variant="outline"
                className="whitespace-nowrap"
              />
              <FailButton onClick={() => setModalOpen(1)} className="flex-1" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function Challenge({
  field,
  mission,
  point,
  courseOutRule,
  competitionId,
  courseId,
  playerId,
  judgeId,
  setIsEnabled,
  courseName,
  playerName,
}: ChallengeProps): React.JSX.Element {
  const router = useRouter()
  const fieldState = deserializeField(field ?? "")
  const missionState = deserializeMission(mission ?? "")
  const missionPair = missionStatePair(missionState)
  const pointState: PointState = deserializePoint(point)
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
  const start = findStart(fieldState)
  const [botPosition, setBotPosition] = useState({
    row: start?.[0] || 0,
    col: start?.[1] || 0,
  })
  const [botDirection, setBotDirection] = useState(missionState[0])
  const [strictMode, _setStrictMode] = useState(false)
  const { muted } = useAudioContext()
  const audioPoolRef = useRef<Map<string, HTMLAudioElement[]>>(new Map())

  const playSound = useCallback(
    (src: string, volume: number) => {
      if (muted) {
        return
      }
      const pool = audioPoolRef.current
      if (!pool.has(src)) {
        pool.set(src, [])
      }
      const instances = pool.get(src) as HTMLAudioElement[]
      // 再生が終了済みのインスタンスを再利用、なければ新規作成
      let audio = instances.find((a) => a.ended || a.paused)
      if (!audio) {
        audio = new Audio(src)
        instances.push(audio)
      }
      audio.volume = volume
      audio.currentTime = 0
      audio.play().catch(() => {})
    },
    [muted],
  )

  const playNext = useCallback(
    () => playSound("/sound/02_next.mp3", 0.4),
    [playSound],
  )
  const playBack = useCallback(
    () => playSound("/sound/03_back.mp3", 0.2),
    [playSound],
  )
  const playGoal = useCallback(
    () => playSound("/sound/04_goal.mp3", 1.0),
    [playSound],
  )

  const handleNext = (row: number, col: number) => {
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
          playGoal()
        } else if (nowMission < missionPair.length - 1) {
          setNowMission(nowMission + 1)
          playNext()
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
  }

  const handleBack = () => {
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
      playBack()
    }
  }

  const handleRetry = () => {
    setIsRetry(true)
    setRetryResult(0)
    setPointCount(0)
    setNowMission(0)
    setIsGoal(false)
    setBotPosition({ row: start?.[0] || 0, col: start?.[1] || 0 })
    setBotDirection(missionState[0])
  }

  // Handle tier point selection (for graded scoring missions)
  const handleTierSelect = (tierIndex: number) => {
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
        goalEntry !== null && !Array.isArray(goalEntry) ? Number(goalEntry) : 0
      setPointCount(newPoint + goalPt)
      setIsGoal(true)
      setModalOpen(1)
      playGoal()
    } else {
      setPointCount(newPoint)
      setNowMission(nowMission + 1)
      playNext()
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
  }

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
  // Pre-compute course-out submission values
  const parsedCourseOutRule = parseCourseOutRule(courseOutRule)
  const courseOutDetail = isRetry ? COURSE_OUT_RETRY : COURSE_OUT_FIRST
  const courseOutSubmitFirst =
    parsedCourseOutRule.type === "zero"
      ? isRetry
        ? firstResult
        : 0
      : firstResult
  const courseOutSubmitRetry =
    parsedCourseOutRule.type === "zero"
      ? isRetry
        ? 0
        : retryResult
      : retryResult

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
        courseName={courseName}
        playerName={playerName}
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
              courseOutSubmitFirst,
              courseOutSubmitRetry,
              competitionId,
              courseId,
              playerId,
              judgeId,
              setMessage,
              setIsSuccess,
              setLoading,
              router,
              setIsEnabled,
              courseOutDetail,
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
          courseOutRule={courseOutRule}
        />
      )}
    </>
  )
}
