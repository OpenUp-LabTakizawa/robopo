import type React from "react"
import { BackLabelWithIcon, RETRY_CONST, SendIcon } from "@/app/lib/const"

export function ChallengeModal({
  setModalOpen,
  handleSubmit,
  handleRetry,
  loading,
  isSuccess,
  message,
  result1Point,
  result2Point,
  isGoal,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<number>>
  handleSubmit: () => void
  handleRetry: () => void
  loading: boolean
  isSuccess: boolean
  message: string
  result1Point: number | null
  result2Point: number | null
  isGoal: boolean
}) {
  function handleClick() {
    setModalOpen(0)
  }
  function thisHandleRetry() {
    handleRetry()
    setModalOpen(0)
  }
  return (
    <dialog className="modal modal-open" onClose={() => setModalOpen(0)}>
      <div className="modal-box max-w-sm">
        {isSuccess ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-base text-base-content/70">{message}</p>
            <p className="text-base-content/50 text-sm">
              ホーム画面へ自動遷移します
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-center font-bold text-lg">
              チャレンジを終了しますか?
            </h3>

            {/* Score summary card */}
            <div className="rounded-lg bg-base-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-base-content/60 text-sm">1回目</span>
                <span className="score-display font-bold text-primary text-xl">
                  {result1Point}pt
                </span>
              </div>
              {result2Point !== null && (
                <div className="mt-2 flex items-center justify-between border-base-300 border-t pt-2">
                  <span className="text-base-content/60 text-sm">2回目</span>
                  <span className="score-display font-bold text-primary text-xl">
                    {result2Point}pt
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {/* Primary action */}
              <button
                type="button"
                className="btn btn-accent w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  <>
                    結果を送信して終了
                    <SendIcon />
                  </>
                )}
              </button>

              {/* Secondary action */}
              {result2Point === null && !isGoal && (
                <RetryButton handleRetry={thisHandleRetry} loading={loading} />
              )}

              {/* Tertiary action */}
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={handleClick}
                disabled={loading}
              >
                採点に
                <BackLabelWithIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}

export function RetryModal({
  setModalOpen,
  handleRetry,
  result1Point,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<number>>
  handleRetry: () => void
  result1Point: number | null
}) {
  function thisHandleRetry() {
    handleRetry()
    setModalOpen(0)
  }
  return (
    <dialog className="modal modal-open" onClose={() => setModalOpen(0)}>
      <div className="modal-box max-w-sm">
        <div className="flex flex-col gap-4">
          <h3 className="text-center font-bold text-lg">再チャレンジ</h3>
          <div className="rounded-lg bg-base-200 p-4 text-center">
            <p className="text-base-content/60 text-sm">1回目のスコア</p>
            <p className="score-display font-bold text-2xl text-primary">
              {result1Point}pt
            </p>
          </div>
          <p className="text-center text-base-content/60 text-sm">
            1回目のポイントを保存して再チャレンジしますか?
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="btn btn-warning w-full"
              onClick={thisHandleRetry}
            >
              再チャレンジする{RETRY_CONST.icon}
            </button>
            <button
              type="button"
              className="btn btn-ghost w-full"
              onClick={() => setModalOpen(0)}
            >
              <BackLabelWithIcon />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export function CourseOutModal({
  setModalOpen,
  handleSubmit,
  handleRetry,
  setResult1,
  loading,
  isSuccess,
  message,
  result1Point,
  result2Point,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<number>>
  setResult1: React.Dispatch<React.SetStateAction<number>>
  handleSubmit: () => void
  handleRetry: () => void
  loading: boolean
  isSuccess: boolean
  message: string
  result1Point: number | null
  result2Point: number | null
}) {
  function thisHandleRetry() {
    setResult1(0)
    handleRetry()
    setModalOpen(0)
  }
  return (
    <dialog className="modal modal-open" onClose={() => setModalOpen(0)}>
      <div className="modal-box max-w-sm">
        {isSuccess ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-base text-base-content/70">{message}</p>
            <p className="text-base-content/50 text-sm">
              ホーム画面へ自動遷移します
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-center font-bold text-error text-lg">
              コースアウト
            </h3>

            <div className="rounded-lg bg-error/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-base-content/60 text-sm">1回目</span>
                <span className="score-display font-bold text-xl">
                  {result2Point === null ? 0 : result1Point}pt
                </span>
              </div>
              {result2Point !== null && (
                <div className="mt-2 flex items-center justify-between border-base-300 border-t pt-2">
                  <span className="text-base-content/60 text-sm">2回目</span>
                  <span className="score-display font-bold text-xl">0pt</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="btn btn-accent w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  <>
                    結果送信
                    <SendIcon />
                  </>
                )}
              </button>
              {result2Point === null && (
                <RetryButton handleRetry={thisHandleRetry} loading={loading} />
              )}
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => setModalOpen(0)}
                disabled={loading}
              >
                採点に
                <BackLabelWithIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}

function RetryButton({
  handleRetry,
  loading,
}: {
  handleRetry: () => void
  loading: boolean
}) {
  return (
    <button
      type="button"
      className="btn btn-warning w-full"
      onClick={handleRetry}
      disabled={loading}
    >
      {RETRY_CONST.label}
      {RETRY_CONST.icon}
    </button>
  )
}
