import { useRouter } from "next/navigation"
import type React from "react"
import { useCallback, useMemo, useState } from "react"
import {
  SoundControlUI,
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
import { ReloadButton } from "@/app/components/parts/buttons"
import { BackLabelWithIcon, SendIcon } from "@/app/lib/const"
import NextSound from "@/app/lib/sound/02_next.mp3"
import BackSound from "@/app/lib/sound/03_back.mp3"
import GoalSound from "@/app/lib/sound/04_goal.mp3"

// 型定義
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

// サウンド管理用カスタムフック
const useAudio = () => {
  const { soundOn, setSoundOn } = useAudioContext()
  const nextSound = useMemo(() => {
    const audio = new Audio(NextSound)
    audio.volume = 0.4
    return audio
  }, [])
  const backSound = useMemo(() => {
    const audio = new Audio(BackSound)
    audio.volume = 0.2
    return audio
  }, [])
  const goalSound = useMemo(() => new Audio(GoalSound), [])
  return { soundOn, setSoundOn, nextSound, backSound, goalSound }
}

// 一本橋用セクション
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
  soundOn: boolean
  setSoundOn: React.Dispatch<React.SetStateAction<boolean>>
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
  soundOn,
  setSoundOn,
}: IpponBashiSectionProps) {
  return (
    <div className="relative flex h-[calc(100vh-100px)] w-full flex-col justify-items-center">
      <div className="grid w-full justify-items-center">
        <p className="font-bold text-xl">THE 一本橋</p>
      </div>
      <div className="grid h-1/2 w-full grid-cols-2 justify-items-center">
        <div className="flex flex-col">
          <div className="stats shadow-sm">
            <div className="stat">
              <div className="stat-title font-bold text-3xl text-orange-600">
                現在:
              </div>
              <div className="stat-value font-bold text-3xl text-orange-600">
                {pointCount}ポイント
              </div>
              <p className="font-bold text-3xl text-orange-600">
                {isRetry ? "2回目" : "1回目"}
                {nowMission < IPPON_BASHI_SIZE - 1 ? "行き" : "帰り"}
              </p>
            </div>
          </div>
          <p className="mt-5 ml-3 text-lg">パネルをタップ</p>
          <p className="ml-3 text-lg">で進みます</p>
        </div>
      </div>
      <div className="grid h-1/2 w-full grid-cols-2 justify-items-center">
        <div className="flex w-full flex-col" />
        <div className="flex w-full flex-col justify-items-end">
          <button
            type="button"
            id="add"
            className="btn btn-primary m-3 mx-auto"
            onClick={handleBack}
            disabled={nowMission === 0}
          >
            1つ
            <BackLabelWithIcon />
          </button>
          <button
            type="button"
            className="btn btn-accent m-3 mx-auto"
            onClick={() => setModalOpen(1)}
          >
            結果送信
            <SendIcon />
          </button>
          <div className="grid grid-cols-2">
            <button
              type="button"
              className="btn btn-primary m-3 mx-auto"
              onClick={() => setModalOpen(3)}
            >
              コース
              <br />
              アウト
            </button>
            <button
              type="button"
              className="btn btn-primary m-3 mx-auto"
              onClick={() => setModalOpen(2)}
              disabled={isRetry}
            >
              再挑戦
            </button>
          </div>
          <SoundControlUI soundOn={soundOn} setSoundOn={setSoundOn} />
        </div>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex transform">
        <IpponBashiUI
          botPosition={botPosition}
          botDirection={botDirection}
          nextMissionPair={isGoal ? [null, null] : missionPair[nowMission]}
          onPanelClick={handleNext}
        />
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
  FieldProps: FieldPropsType // You can further type this if you know the shape
  soundOn: boolean
  setSoundOn: React.Dispatch<React.SetStateAction<boolean>>
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
  soundOn,
  setSoundOn,
}: NormalChallengeSectionProps) {
  return (
    <div className="grid h-full w-screen justify-items-center sm:w-5/6">
      {isGoal ? (
        <div className="grid max-h-32 w-full justify-items-center">
          <p className="font-bold text-2xl text-orange-600">おめでとう!</p>
          {pointState[1] !== null && pointState[1] > 0 && (
            <p className="font-bold text-2xl text-orange-600">
              ゴールポイント: {pointState[1]}ポイント
            </p>
          )}
          {isSuccess ? (
            <button
              type="button"
              className="btn btn-accent mx-auto text-2xl"
              onClick={() => window.location.reload()}
            >
              コース一覧に
              <BackLabelWithIcon />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-accent m-3 mx-auto text-2xl"
              onClick={() => setModalOpen(1)}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner" />
              ) : (
                "結果送信"
              )}
            </button>
          )}
          {message && <p className="mx-auto mt-12">{message}</p>}
        </div>
      ) : (
        <div className="grid h-full min-h-32 w-full justify-items-center">
          <p className="font-bold text-3xl text-orange-600">
            チャレンジ{FieldProps.isRetry ? "2回目" : "1回目"}
          </p>
          <p>↓ミッション↓</p>
          <p className="font-bold text-3xl text-orange-600">
            {nowMission + 1} :{" "}
            {missionPair[nowMission][0] === null
              ? "-"
              : MissionString[missionPair[nowMission][0]]}
            {missionPair[nowMission][1] === null
              ? "-"
              : missionPair[nowMission][1]}
            {missionPair[nowMission][0] === null
              ? "-"
              : panelOrDegree(missionPair[nowMission][0])}
          </p>
          <p>{pointState[nowMission + 2]}ポイント</p>
        </div>
      )}
      <Field {...FieldProps} />
      <p className="font-bold text-3xl text-orange-600">
        {isGoal ? "クリア" : "現在"}: {pointCount}ポイント
      </p>
      <SoundControlUI soundOn={soundOn} setSoundOn={setSoundOn} />
      <div className="grid grid-cols-2 gap-4 p-4">
        <button
          type="button"
          id="add"
          className="btn btn-primary mx-auto"
          onClick={handleBack}
          disabled={FieldProps.nowMission === 0}
        >
          1つ
          <BackLabelWithIcon />
        </button>
        <button
          type="button"
          className="btn btn-neutral mx-auto"
          onClick={() => setModalOpen(1)}
          disabled={isGoal}
        >
          失敗
        </button>
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
  const { soundOn, setSoundOn, nextSound, backSound, goalSound } = useAudio()

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
            soundOn && goalSound.play()
          } else if (nowMission < missionPair.length - 1) {
            setNowMission(nowMission + 1)
            soundOn && nextSound.play()
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
      soundOn,
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
      soundOn && backSound.play()
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
    soundOn,
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
        <div>エラーです。</div>
        <ReloadButton />
      </>
    )
  }

  return (
    <>
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
          soundOn={soundOn}
          setSoundOn={setSoundOn}
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
          soundOn={soundOn}
          setSoundOn={setSoundOn}
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
