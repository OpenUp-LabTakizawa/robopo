"use client"

import {
  House,
  Play,
  RefreshCw,
  SendHorizontal,
  TriangleAlert,
  Undo2,
} from "lucide-react"
import { useRouter } from "next/navigation"

export function ReloadButton() {
  return (
    <button
      type="button"
      className="btn btn-primary mx-auto mt-5 min-w-28 max-w-fit"
      onClick={() => window.location.reload()}
    >
      <RefreshCw className="size-6" />
      再読み込み
    </button>
  )
}

export function HomeButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      className="btn btn-primary m-5 mx-auto min-w-28 max-w-fit"
      onClick={() => router.push("/")}
    >
      <House className="size-6" />
      ホーム
    </button>
  )
}

/** 戻るボタン汎用コンポーネント */
export function BackButton({
  onClick,
  label = "戻る",
  disabled = false,
  variant = "ghost",
  fullWidth = false,
  className: extraClassName,
}: {
  onClick: () => void
  label?: string
  disabled?: boolean
  variant?: "ghost" | "outline"
  fullWidth?: boolean
  className?: string
}) {
  const base =
    variant === "ghost"
      ? "btn btn-ghost rounded-xl text-base-content/60 transition-colors hover:text-base-content"
      : "btn btn-outline rounded-xl transition-all duration-200"
  const width = fullWidth ? "w-full" : ""
  return (
    <button
      type="button"
      className={`${base} ${width} ${extraClassName ?? ""}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      <Undo2 className="size-5" />
      {label}
    </button>
  )
}

/** 送信ボタン汎用コンポーネント */
export function SubmitButton({
  onClick,
  label = "結果送信",
  disabled = false,
  loading = false,
  fullWidth = false,
  className: extraClassName,
}: {
  onClick: () => void
  label?: string
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
}) {
  const width = fullWidth ? "w-full" : ""
  return (
    <button
      type="button"
      className={`btn btn-accent rounded-xl shadow-accent/20 shadow-lg transition-all duration-200 hover:shadow-accent/30 hover:shadow-xl ${width} ${extraClassName ?? ""}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="loading loading-spinner" />
      ) : (
        <>
          <SendHorizontal className="size-5" />
          {label}
        </>
      )}
    </button>
  )
}

/** リトライボタン汎用コンポーネント */
export function RetryButton({
  onClick,
  label = "2回目のチャレンジへ",
  disabled = false,
  fullWidth = false,
  className: extraClassName,
}: {
  onClick: () => void
  label?: string
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}) {
  const width = fullWidth ? "w-full" : ""
  return (
    <button
      type="button"
      className={`btn btn-warning rounded-xl shadow-lg shadow-warning/20 transition-all duration-200 hover:shadow-warning/30 hover:shadow-xl ${width} ${extraClassName ?? ""}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      <Play className="size-5" />
      {label}
    </button>
  )
}

/** コースアウトボタン */
export function CourseOutButton({
  onClick,
  disabled = false,
  variant = "solid",
  className: extraClassName,
}: {
  onClick: () => void
  disabled?: boolean
  variant?: "solid" | "outline"
  className?: string
}) {
  const base =
    variant === "outline"
      ? "btn btn-outline btn-error rounded-xl transition-all duration-200"
      : "btn btn-error rounded-xl transition-all duration-200"
  return (
    <button
      type="button"
      className={`${base} ${extraClassName ?? ""}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      <TriangleAlert className="size-4" />
      コースアウト
    </button>
  )
}

/** 失敗ボタン */
export function FailButton({
  onClick,
  className: extraClassName,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={`btn btn-error rounded-xl transition-all duration-200 ${extraClassName ?? ""}`.trim()}
      onClick={onClick}
    >
      <TriangleAlert className="size-5" />
      失敗
    </button>
  )
}
