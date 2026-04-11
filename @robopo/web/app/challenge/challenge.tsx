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
import { IpponBashiUI } from "@/app/components/challenge/ipponBashi"
import { calcPoint, resultSubmit } from "@/app/components/challenge/utils"
import { Field } from "@/app/components/course/field"
import {
  deserializeField,
  deserializeMission,
  deserializePoint,
  type FieldState,
  findStart,
  getRobotPosition,
  IPPON_BASHI_SIZE,
  MissionString,
  type MissionValue,
  missionStatePair,
  type PointState,
  panelOrDegree,
  RESERVED_COURSE_IDS,
} from "@/app/components/course/utils"
import {
  BackButton,
  CourseOutButton,
  FailButton,
  ReloadButton,
  RetryButton,
  SubmitButton,
} from "@/app/components/parts/buttons"

// Type definitions
type ChallengeProps = {
  field: string | null
  mission: string | null
  point: string | null
  compeId: number
  courseId: number
  playerId: number
  umpireId: number
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

type FieldPropsType = {
  type: "challenge" | "edit"
  field: FieldState
  botPosition: { row: number; col: number }
  botDirection: MissionValue
  nextMissionPair: MissionValue[]
  onPanelClick: (row: number, col: number) => void
  nowMission: number
  isRetry: boolean
}

// Ippon Bashi section
interface IpponBashiSectionProps {
  pointCount: number | null
  isRetry: boolean
  nowMission: number
  handleBack: () => void
  setModalOpen: (value: number) => void
  isGoal: boolean
  botPosition: { row: number; col: number }
  botDirection: MissionValue
  missionPair: MissionValue[][]
  handleNext: (row: number, col: number) => void
}

function IpponBashiSection({
  pointCount,
  isRetry,
  nowMission,
  handleBack,
  setModalOpen,
  isGoal,
  botPosition,
  botDirection,
  missionPair,
  handleNext,
}: IpponBashiSectionProps) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between border-base-300 border-b bg-base-100 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-sm">
            THE 一本橋
          </span>
          <span className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent text-sm">
            {isRetry ? "2回目" : "1回目"}
            {nowMission < IPPON_BASHI_SIZE - 1 ? " 行き" : " 帰り"}
          </span>
        </div>
        <div className="score-display text-right">
          <p className="text-base-content/50 text-xs">現在のスコア</p>
          <p className="font-bold text-2xl text-accent">
            {pointCount}
            <span className="text-sm">pt</span>
          </p>
        </div>
      </div>

      {/* Mission hint */}
      <div className="px-4 py-2 text-center text-base-content/60 text-sm">
        パネルをタップで進みます
      </div>

      {/* Field - centered */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-4">
        <IpponBashiUI
          botPosition={botPosition}
          botDirection={botDirection}
          nextMissionPair={isGoal ? [null, null] : missionPair[nowMission]}
          onPanelClick={handleNext}
        />
      </div>

      {/* Action bar */}
      <div className="border-base-300 border-t bg-base-100 px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          {/* 上段: 補助アクション（控えめ） */}
          <BackButton
            onClick={handleBack}
            disabled={nowMission === 0}
            variant="outline"
            className="btn-sm"
          />
          <CourseOutButton
            onClick={() => setModalOpen(3)}
            variant="outline"
            className="btn-sm"
          />
          {/* 下段: メインアクション（目立つ） */}
          <RetryButton
            onClick={() => setModalOpen(2)}
            label="再挑戦"
            disabled={isRetry}
            className="min-h-[44px]"
          />
          <SubmitButton
            onClick={() => setModalOpen(1)}
            className="min-h-[44px] shadow-accent/25 shadow-lg"
          />
        </div>
        <div className="mt-2 flex justify-center">
          <SoundController />
        </div>
      </div>
    </div>
  )
}

// 通常チャレンジ用セクション
interface NormalChallengeSectionProps {
  isGoal: boolean
  pointState: PointState
  nowMission: number
  missionPair: MissionValue[][]
  pointCount: number | null
  handleBack: () => void
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
  setModalOpen,
  loading,
  isSuccess,
  message,
  FieldProps,
}: NormalChallengeSectionProps) {
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
          {pointState[1] !== null && pointState[1] > 0 && (
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
                : panelOrDegree(missionPair[nowMission][0])}
            </p>
            <p className="text-accent text-xs">
              +{pointState[nowMission + 2]}pt
            </p>
          </div>
        </div>
      )}

      {/* Field - centered */}
      <div className="flex flex-1 items-center justify-center overflow-auto px-4">
        <Field {...FieldProps} />
      </div>

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
  compeId,
  courseId,
  playerId,
  umpireId,
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
  const [result1, setResult1] = useState(0)
  const [result2, setResult2] = useState<number | null>(null)
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
            setResult1(result1 + 1)
          } else if (result2 !== null && !isGoal) {
            setResult2(result2 + 1)
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
      result1,
      result2,
      muted,
      goalSound,
      nextSound,
    ],
  )

  const handleBack = useCallback(() => {
    if (nowMission > 0) {
      if (!isRetry) {
        setResult1(result1 - 1)
      } else if (result2 !== null) {
        setResult2(result2 - 1)
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
    result1,
    result2,
    isGoal,
    pointState,
    start,
    missionState,
    muted,
    backSound,
  ])

  const handleRetry = useCallback(() => {
    setIsRetry(true)
    setResult2(0)
    setPointCount(0)
    setNowMission(0)
    setIsGoal(false)
    setBotPosition({ row: start?.[0] || 0, col: start?.[1] || 0 })
    setBotDirection(missionState[0])
  }, [start, missionState])

  const FieldProps = {
    type: "challenge" as FieldPropsType["type"],
    field: fieldState,
    botPosition,
    botDirection,
    nextMissionPair: isGoal ? [null, null] : missionPair[nowMission],
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
      {Number(courseId) === RESERVED_COURSE_IDS.IPPON ? (
        <IpponBashiSection
          pointCount={pointCount}
          isRetry={isRetry}
          nowMission={nowMission}
          handleBack={handleBack}
          setModalOpen={setModalOpen}
          isGoal={isGoal}
          botPosition={botPosition}
          botDirection={botDirection}
          missionPair={missionPair}
          handleNext={handleNext}
        />
      ) : (
        <NormalChallengeSection
          isGoal={isGoal}
          pointState={pointState}
          nowMission={nowMission}
          missionPair={missionPair}
          pointCount={pointCount}
          handleBack={handleBack}
          setModalOpen={setModalOpen}
          loading={loading}
          isSuccess={isSuccess}
          message={message}
          FieldProps={FieldProps}
        />
      )}
      {modalOpen === 1 && (
        <ChallengeModal
          setModalOpen={setModalOpen}
          handleSubmit={() =>
            resultSubmit(
              result1,
              result2,
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
          result1Point={isRetry ? calcPoint(pointState, result1) : pointCount}
          result2Point={isRetry ? pointCount : null}
          isGoal={isGoal}
        />
      )}
      {modalOpen === 2 && (
        <RetryModal
          setModalOpen={setModalOpen}
          handleRetry={handleRetry}
          result1Point={pointCount}
        />
      )}
      {modalOpen === 3 && (
        <CourseOutModal
          setModalOpen={setModalOpen}
          setResult1={setResult1}
          handleSubmit={() =>
            resultSubmit(
              isRetry ? result1 : 0,
              isRetry ? 0 : result2,
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
          result1Point={isRetry ? calcPoint(pointState, result1) : pointCount}
          result2Point={isRetry ? pointCount : null}
        />
      )}
    </>
  )
}
