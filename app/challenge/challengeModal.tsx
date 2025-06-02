import {
  BackLabelWithIcon,
  SendIcon,
  RETRY_CONST,
} from "@/app/lib/const"

type ChallengeModalProps = {
  setModalOpen: React.Dispatch<React.SetStateAction<number>>
  handleSubmit: () => void
  handleRetry: () => void
  loading: boolean
  isSuccess: boolean
  message: string
  result1Point: number | null
  result2Point: number | null
  isGoal: boolean
}

export const ChallengeModal = ({
  setModalOpen,
  handleSubmit,
  handleRetry,
  loading,
  isSuccess,
  message,
  result1Point,
  result2Point,
  isGoal,
}: ChallengeModalProps) => {
  const handleClick = () => {
    setModalOpen(0)
  }
  const thisHandleRetry = () => {
    handleRetry()
    setModalOpen(0)
  }
  return (
    <dialog id="challenge-modal" className="modal modal-open" onClose={() => setModalOpen(0)}>
      <div className="modal-box">
        {isSuccess ? (
          <>
            <p>{message}</p>
            <button className="btn btn-accent mx-auto text-2xl" onClick={() => window.location.reload()}>
              コース一覧に<BackLabelWithIcon />
            </button>
          </>
        ) : (
          <>
            <p className="text-2xl">チャレンジを終了しますか?</p>
            <p className="text-2xl">1回目: {result1Point}ポイント</p>
            {result2Point !== null && <p className="text-2xl">2回目: {result2Point}ポイント</p>}
            <div className="modal-action flex-col">
              <button className="btn btn-accent m-3" onClick={handleSubmit}>
                {loading ? <span className="loading loading-spinner"></span> : <>結果を送信してチャレンジを終わる<SendIcon /></>}
              </button>
              {result2Point === null && !isGoal && (
                <RetryButton handleRetry={thisHandleRetry} loading={loading} />
              )}
              <button className="btn btn-neutral m-3" onClick={handleClick} disabled={loading}>
                チャレンジに<BackLabelWithIcon />
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

type RetryModalProps = {
  setModalOpen: React.Dispatch<React.SetStateAction<number>>
  handleRetry: () => void
  result1Point: number | null
}

export const RetryModal = ({ setModalOpen, handleRetry, result1Point }: RetryModalProps) => {
  const thisHandleRetry = () => {
    handleRetry()
    setModalOpen(0)
  }
  return (
    <dialog id="retry-modal" className="modal modal-open" onClose={() => setModalOpen(0)}>
      <div className="modal-box">
        <p>1回目のポイントを保存して再チャレンジしますか?</p>
        <p>1回目: {result1Point}ポイント</p>
        <div className="modal-action">
          <button className="btn btn-accent" onClick={thisHandleRetry}>
            再チャレンジする{RETRY_CONST.icon}
          </button>
          <button className="btn btn-neutral" onClick={() => setModalOpen(0)}>
            <BackLabelWithIcon />
          </button>
        </div>
      </div>
    </dialog>
  )
}

type CourseOutModalProps = {
  setModalOpen: React.Dispatch<React.SetStateAction<number>>
  setResult1: React.Dispatch<React.SetStateAction<number>>
  handleSubmit: () => void
  handleRetry: () => void
  loading: boolean
  isSuccess: boolean
  message: string
  result1Point: number | null
  result2Point: number | null
}

export const CourseOutModal = ({
  setModalOpen,
  handleSubmit,
  handleRetry,
  setResult1,
  loading,
  isSuccess,
  message,
  result1Point,
  result2Point,
}: CourseOutModalProps) => {
  const thisHandleRetry = () => {
    setResult1(0)
    handleRetry()
    setModalOpen(0)
  }
  return (
    <dialog id="course-out-modal" className="modal modal-open" onClose={() => setModalOpen(0)}>
      <div className="modal-box">
        {isSuccess ? (
          <>
            <p>{message}</p>
            <button className="btn btn-accent mx-auto text-2xl" onClick={() => window.location.reload()}>
              コース一覧に<BackLabelWithIcon />
            </button>
          </>
        ) : (
          <>
            <p>コースアウトしました。</p>
            {result2Point === null && <p>1回目: 0ポイント</p>}
            {result2Point !== null && (
              <>
                <p>1回目: {result1Point}ポイント</p>
                <p>2回目: 0ポイント</p>
              </>
            )}
            <div className="modal-action flex-col">
              <button className="btn btn-accent m-3" onClick={handleSubmit}>
                {loading ? <span className="loading loading-spinner"></span> : <>結果送信<SendIcon /></>}
              </button>
              {result2Point === null && (
                <RetryButton handleRetry={thisHandleRetry} loading={loading} />
              )}
              <button className="btn btn-neutral m-3" onClick={() => setModalOpen(0)} disabled={loading}>
                チャレンジに<BackLabelWithIcon />
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

const RetryButton = ({
  handleRetry,
  loading
}: {
  handleRetry: () => void,
  loading: boolean
}) => {
  return (
    <button className="btn btn-accent m-3" onClick={handleRetry} disabled={loading}>
      {RETRY_CONST.label}{RETRY_CONST.icon}
    </button>)
}
