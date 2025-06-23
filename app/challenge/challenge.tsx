import { useRouter } from "next/navigation"
import type React from "react"
import { useMemo, useState } from "react"
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
  findStart,
  getRobotPosition,
  IPPON_BASHI_SIZE,
  MissionString,
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

export function Challenge({
  field,
  mission,
  point,
  compeId,
  courseId,
  playerId,
  umpireId,
  setIsEnabled,
}: {
  field: string | null
  mission: string | null
  point: string | null
  compeId: number
  courseId: number
  playerId: number
  umpireId: number
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>
}): React.JSX.Element {
  const router = useRouter()
  if (field === null || mission === null || point === null) {
    return (
      <>
        <div>エラーです。</div>
        <ReloadButton />
      </>
    )
  }
  const fieldState = deserializeField(field)
  const missionState = deserializeMission(mission)
  const missionPair = missionStatePair(missionState)
  const pointState: PointState = deserializePoint(point)
  const [isRetry, setIsRetry] = useState<boolean>(false)
  const [isGoal, setIsGoal] = useState<boolean>(false)
  const [nowMission, setNowMission] = useState<number>(0) // 今のミッションのindex
  const [pointCount, setPointCount] = useState<number | null>(0) // 今の得点
  const [result1, setResult1] = useState<number>(0) // 進んだmission
  const [result2, setResult2] = useState<number | null>(null) // 進んだmission, やり直してない場合はnull
  const [loading, setLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [modalOpen, setModalOpen] = useState<number>(0)

  const start = findStart(fieldState)
  const [botPosition, setBotPosition] = useState({
    row: start?.[0] || 0,
    col: start?.[1] || 0,
  })
  const [botDirection, setBotDirection] = useState(missionState[0])

  const [strictMode, _setStrictMode] = useState<boolean>(false)

  const { soundOn, setSoundOn } = useAudioContext()
  const nextSound = useMemo(() => {
    const audio = new Audio(NextSound)
    audio.volume = 0.4
    return audio
  }, [])
  const backSound = useMemo(() => {
    const audio = new Audio(BackSound)
    audio.volume = 0.4
    return audio
  }, [])
  backSound.volume = 0.2
  const goalSound = new Audio(GoalSound)

  // クリックされたpanelの情報を入れる
  function handleNext(row: number, col: number) {
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
      // 厳密タップモードonで正しい次のミッションの位置を押した場合又は厳密タップモードOffの場合
      if ((strictMode && newRow === row && newCol === col) || !strictMode) {
        // ポイントを加算
        const point = calcPoint(pointState, nowMission + 1)
        setPointCount(point)
        // これでゴールか
        if (nowMission === missionPair.length - 1) {
          setIsGoal(true)
          setModalOpen(1)
          soundOn && goalSound.play()
        } else {
          // goal以外の時は次のミッションに進む
          setNowMission(nowMission + 1)
          soundOn && nextSound.play()
        }
        // 一回目か
        if (!isRetry) {
          setResult1(result1 + 1)
        } else if (result2 !== null) {
          // リトライか
          setResult2(result2 + 1)
        }
        // ロボットを動かす
        setBotPosition({ row: newRow, col: newCol })
        setBotDirection(direction)
      }
    } else {
      setNowMission(0)
    }
  }

  // 押し間違えた時1つ前のミッションに戻る
  function handleBack() {
    if (nowMission > 0) {
      if (!isRetry) {
        setResult1(result1 - 1)
      } else if (result2 !== null) {
        // リトライか
        setResult2(result2 - 1)
      }
      const turnBackMission = isGoal ? nowMission : nowMission - 1
      // ポイントを戻す
      const point = calcPoint(pointState, turnBackMission)
      setPointCount(point)
      // ロボットを戻す
      const [row, col, direction] = getRobotPosition(
        start?.[0] || 0,
        start?.[1] || 0,
        missionState,
        turnBackMission,
      )
      setBotPosition({ row: row, col: col })
      setBotDirection(direction)
      // nowMissionを戻す
      setNowMission(turnBackMission)
      // goalしたのを戻す
      // うまいことisGoalでnowmissionを-1するかそのままにするかで直して。
      if (isGoal) {
        setIsGoal(false)
      }
      soundOn && backSound.play()
    }
  }

  // やり直しする時
  function handleRetry() {
    setIsRetry(true)
    setResult2(0)
    setPointCount(0)
    setNowMission(0)
    setIsGoal(false)
    setBotPosition({ row: start?.[0] || 0, col: start?.[1] || 0 })
    setBotDirection(missionState[0])
  }

  return (
    <>
      {Number(courseId) === RESERVED_COURSE_IDS.IPPON ? (
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
              // ゴール後の表示はゴール前のmissionPairで出すので、おかしくなるかも。
              nextMissionPair={
                isGoal ? missionPair[nowMission - 1] : missionPair[nowMission]
              }
              onPanelClick={(row: number, col: number) => handleNext(row, col)}
            />
          </div>
        </div>
      ) : (
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
                // チャレンジ終了後、画面読み込み直して初期状態に戻る
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
              {/* <div className="flex flex-row w-full">
                                <div className="w-1/3" />
                                <div className="w-1/3 grid justify-items-center"> */}
              <p className="font-bold text-3xl text-orange-600">
                チャレンジ{isRetry ? "2回目" : "1回目"}
              </p>
              <p>↓ミッション↓</p>
              {/* </div> */}
              {/* 厳密タップモードにできないようにしておく。要らなそうなら機能毎削除する。 */}
              {/* <div className="w-1/3 grid items-center justify-end">
                                  <label className="cursor-pointer flex items-center w-full">
                                    <div className="grid grid-col">
                                      <span className="mr-2">厳密タップモード</span>
                                      <input
                                        type="checkbox"
                                        checked={strictMode}
                                        className="toggle toggle-primary ml-auto mr-2"
                                        onChange={() => (strictMode ? setStrictMode(false) : setStrictMode(true))}
                                      />
                                    </div>
                                  </label>
                                </div> */}
              {/* </div> */}
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
          <Field
            type="challenge"
            field={fieldState}
            botPosition={botPosition}
            botDirection={botDirection}
            // ゴール後の表示はゴール前のmissionPairで出すので、おかしくなるかも。
            nextMissionPair={
              isGoal ? missionPair[nowMission - 1] : missionPair[nowMission]
            }
            onPanelClick={(row, col) => handleNext(row, col)}
          />

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
              disabled={nowMission === 0}
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
      )}
      {/* 結果送信のモーダル */}
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
      {/* やり直しのモーダル */}
      {modalOpen === 2 && (
        <RetryModal
          setModalOpen={setModalOpen}
          handleRetry={handleRetry}
          result1Point={pointCount}
        />
      )}
      {/* コースアウトのモーダル */}
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
