"use client"

import {
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
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
  const [name, setName] = useState(judge?.name ?? "")
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
    if (!name.trim()) {
      setError("名前は必須です。")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        note: note.trim() || null,
      }

      body.competitionIds = selectedCompetitionIds

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
          <div>
            <label className="label" htmlFor="judge-name">
              <span className="label-text">
                名前 <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="judge-name"
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="採点者名"
              required
            />
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
              <XMarkIcon className="size-4" />
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
                <PlusIcon className="size-4" />
              ) : (
                <CheckIcon className="size-4" />
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
              <CheckCircleIcon className="size-12 text-success" />
              <p className="text-center font-medium">{successMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ExclamationTriangleIcon className="size-12 text-warning" />
              <p className="text-center font-medium">
                選択した採点者を削除しますか?
              </p>
              <ul className="w-full list-inside list-disc text-sm">
                {judges.map((j) => (
                  <li key={j.id} className="font-medium">
                    {j.name}
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
              <XCircleIcon className="size-5 shrink-0" />
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
