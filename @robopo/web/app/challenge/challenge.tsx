import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
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
import { useSoundEffects } from "@/components/challenge/useSoundEffects"
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
import { courseOutSubmission } from "@/lib/scoring/course-out"
import {
  calcPoint,
  calcTierPoint,
  getMissionProgress,
} from "@/lib/scoring/scoring"

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

// Challenge section
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
  const startRow = start?.[0] || 0
  const startCol = start?.[1] || 0
  const [botPosition, setBotPosition] = useState({
    row: startRow,
    col: startCol,
  })
  const [botDirection, setBotDirection] = useState(missionState[0])
  const [strictMode, _setStrictMode] = useState(false)
  const { muted } = useAudioContext()
  const { play } = useSoundEffects(muted)
  const isLastMission = nowMission === missionPair.length - 1

  // Move the robot to where it stands after `missionIndex` missions
  const moveBotTo = (missionIndex: number) => {
    const [row, col, direction] = getRobotPosition(
      startRow,
      startCol,
      missionState,
      missionIndex,
    )
    setBotPosition({ row, col })
    setBotDirection(direction)
  }

  // Count one more (or one fewer) cleared mission on the current attempt
  const bumpResult = (delta: number) => {
    if (!isRetry) {
      setFirstResult(firstResult + delta)
    } else if (retryResult !== null) {
      setRetryResult(retryResult + delta)
    }
  }

  // Shared tail of clearing a mission: score, advance or finish, play sfx
  const completeMission = (point: number) => {
    setPointCount(point)
    if (isLastMission) {
      setIsGoal(true)
      setModalOpen(1)
      play("goal")
    } else {
      setNowMission(nowMission + 1)
      play("next")
    }
    if (!isGoal) {
      bumpResult(1)
    }
    moveBotTo(nowMission + 1)
  }

  const handleNext = (row: number, col: number) => {
    if (
      nowMission >= missionPair.length ||
      pointState[nowMission + 2] === null
    ) {
      setNowMission(0)
      return
    }
    if (strictMode) {
      const [newRow, newCol] = getRobotPosition(
        startRow,
        startCol,
        missionState,
        nowMission + 1,
      )
      if (newRow !== row || newCol !== col) {
        return
      }
    }
    completeMission(calcPoint(pointState, nowMission + 1))
  }

  const handleBack = () => {
    if (nowMission === 0) {
      return
    }
    bumpResult(-1)
    const turnBackMission = isGoal ? nowMission : nowMission - 1
    setPointCount(calcPoint(pointState, turnBackMission))
    moveBotTo(turnBackMission)
    setNowMission(turnBackMission)
    setIsGoal(false)
    play("back")
  }

  const handleRetry = () => {
    setIsRetry(true)
    setRetryResult(0)
    setPointCount(0)
    setNowMission(0)
    setIsGoal(false)
    moveBotTo(0)
  }

  // Handle tier point selection (for graded scoring missions)
  const handleTierSelect = (tierIndex: number) => {
    const point = calcTierPoint(
      pointState,
      nowMission,
      tierIndex,
      isLastMission,
    )
    if (point !== null) {
      completeMission(point)
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
  const courseOut = courseOutSubmission(
    courseOutRule,
    isRetry,
    firstResult,
    retryResult,
  )

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
              courseOut.firstResult,
              courseOut.retryResult,
              competitionId,
              courseId,
              playerId,
              judgeId,
              setMessage,
              setIsSuccess,
              setLoading,
              router,
              setIsEnabled,
              courseOut.detail,
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
