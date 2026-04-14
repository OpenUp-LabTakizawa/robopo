"use client"

import {
  Check,
  CircleCheck,
  CircleX,
  Eye,
  EyeOff,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react"
import { useState } from "react"
import type {
  SelectCompetition,
  SelectJudgeWithCompetition,
} from "@/app/lib/db/schema"

type JudgeFormModalProps = {
  mode: "create" | "edit"
  judge?: SelectJudgeWithCompetition | null
  competitionList?: SelectCompetition[]
  onClose: () => void
  onSuccess: (newList: SelectJudgeWithCompetition[]) => void
}

export function JudgeFormModal({
  mode,
  judge,
  competitionList,
  onClose,
  onSuccess,
}: JudgeFormModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [note, setNote] = useState(judge?.note ?? "")
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<
    number[]
  >(judge?.competitionIds ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCompetition(id: number) {
    setSelectedCompetitionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (mode === "create") {
      if (!username.trim()) {
        setError("ユーザー名は必須です。")
        return
      }
      if (!/^[a-z0-9_]+$/.test(username.trim())) {
        setError("ユーザー名は英小文字・数字・アンダースコアのみ使用できます。")
        return
      }
      if (!password || password.length < 8) {
        setError("パスワードは8文字以上で入力してください。")
        return
      }
    }

    if (
      mode === "edit" &&
      password &&
      password.length > 0 &&
      password.length < 8
    ) {
      setError("パスワードは8文字以上で入力してください。")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        note: note.trim() || null,
        competitionIds: selectedCompetitionIds,
      }

      if (mode === "create") {
        body.username = username.trim()
        body.password = password
      } else if (password) {
        body.password = password
      }

      const url = mode === "create" ? "/api/judge" : `/api/judge/${judge?.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (mode === "create") {
          window.location.href = "/judge"
        } else {
          onSuccess(result.newList)
        }
      } else {
        setError(result.message || "エラーが発生しました。")
      }
    } catch {
      setError("送信中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="mb-4 font-bold text-lg">
          {mode === "create" ? "採点者を登録" : "採点者を編集"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "create" ? (
            <div>
              <label className="label" htmlFor="judge-username">
                <span className="label-text">
                  ユーザー名 <span className="text-error">*</span>
                </span>
              </label>
              <input
                id="judge-username"
                type="text"
                className="input input-bordered w-full lowercase"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="英小文字・数字（例: judge1）"
                pattern="[a-z0-9_]+"
                required
              />
              <p className="mt-1 text-base-content/40 text-xs">
                英小文字・数字・アンダースコアのみ使用可能（ログインにも使用）
              </p>
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="judge-username-display">
                <span className="label-text">ユーザー名</span>
              </label>
              <input
                id="judge-username-display"
                type="text"
                className="input input-bordered w-full"
                value={judge?.username ?? ""}
                disabled
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="judge-password">
              <span className="label-text">
                パスワード
                {mode === "create" && <span className="text-error"> *</span>}
              </span>
            </label>
            <div className="relative">
              <input
                id="judge-password"
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "create"
                    ? "8文字以上"
                    : "変更する場合のみ入力（8文字以上）"
                }
                minLength={mode === "create" ? 8 : undefined}
                required={mode === "create"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center rounded-lg p-1.5 text-base-content/40 transition-colors hover:bg-base-300/50 hover:text-base-content/70"
                aria-label="パスワードを表示"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
            {mode === "edit" && (
              <p className="mt-1 text-base-content/40 text-xs">
                空欄の場合、パスワードは変更されません
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="judge-note">
              <span className="label-text">備考</span>
            </label>
            <textarea
              id="judge-note"
              className="textarea textarea-bordered w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="備考（任意）"
              rows={3}
            />
          </div>

          {/* Competition selection */}
          {competitionList && (
            <div>
              <span className="label">
                <span className="label-text">大会紐付け</span>
              </span>
              {competitionList.length > 0 ? (
                <div className="max-h-[8.5rem] overflow-y-auto rounded-xl border border-base-300/50 bg-base-200/30">
                  {competitionList.map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-base-200/60"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        checked={selectedCompetitionIds.includes(c.id)}
                        onChange={() => toggleCompetition(c.id)}
                      />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-base-200/30 px-3 py-2 text-base-content/40 text-sm">
                  大会が登録されていません
                </p>
              )}
              <p className="mt-1 text-base-content/40 text-xs">
                紐付けは任意です（0件でも可）
              </p>
            </div>
          )}

          {error && <p className="text-error text-sm">{error}</p>}
          <div className="modal-action">
            <button
              type="button"
              className="btn gap-1.5 rounded-lg"
              onClick={onClose}
              disabled={loading}
            >
              <X className="size-4" />
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-1.5 rounded-lg shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : mode === "create" ? (
                <Plus className="size-4" />
              ) : (
                <Check className="size-4" />
              )}
              {mode === "create" ? "登録" : "保存"}
            </button>
          </div>
        </form>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <button type="button" className="cursor-default">
          close
        </button>
      </form>
    </dialog>
  )
}

export function JudgeDeleteModal({
  judges,
  onClose,
  onSuccess,
}: {
  judges: SelectJudgeWithCompetition[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/judge", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: judges.map((j) => j.id) }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSuccessMessage("採点者を正常に削除しました")
      } else {
        setErrorMessage(result.message || "採点者を削除できませんでした")
      }
    } catch {
      setErrorMessage("採点者を削除できませんでした")
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex flex-col items-center px-2 py-2">
          {successMessage ? (
            <div className="flex flex-col items-center gap-3">
              <CircleCheck className="size-12 text-success" />
              <p className="text-center font-medium">{successMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <TriangleAlert className="size-12 text-warning" />
              <p className="text-center font-medium">
                選択した採点者を削除しますか?
              </p>
              <ul className="w-full list-inside list-disc text-sm">
                {judges.map((j) => (
                  <li key={j.id} className="font-medium">
                    {j.username}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-warning">
                この操作は取り消せません。関連するデータも全て削除されます。
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 flex w-full items-center gap-2 rounded-lg bg-error/10 px-4 py-2.5 text-error text-sm">
              <CircleX className="size-5 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex w-full flex-col gap-2">
            {!successMessage && (
              <button
                type="button"
                className="btn btn-error w-full rounded-xl shadow-error/20 shadow-lg transition-all duration-200 hover:shadow-error/30 hover:shadow-xl"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    削除中
                    <span className="loading loading-spinner loading-sm" />
                  </>
                ) : (
                  "削除する"
                )}
              </button>
            )}
            <button
              type="button"
              className="btn w-full rounded-xl"
              onClick={successMessage ? onSuccess : onClose}
              disabled={loading}
            >
              戻る
            </button>
          </div>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={successMessage ? onSuccess : onClose}
        onKeyDown={(e) =>
          e.key === "Escape" && (successMessage ? onSuccess() : onClose())
        }
      >
        <button type="button" className="cursor-default">
          close
        </button>
      </form>
    </dialog>
  )
}
