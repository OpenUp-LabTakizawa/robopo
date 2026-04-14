"use client"

import { Check, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"
import type {
  SelectCompetitionWithCourse,
  SelectCourse,
} from "@/app/lib/db/schema"

const DEFAULT_COURSE_NAMES = ["THE一本橋", "センサーコース"]

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) {
    return ""
  }
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type CompetitionFormModalProps = {
  mode: "create" | "edit"
  competition?: SelectCompetitionWithCourse | null
  courseList: SelectCourse[]
  onClose: () => void
  onSuccess: (newList: SelectCompetitionWithCourse[]) => void
}

export function CompetitionFormModal({
  mode,
  competition,
  courseList,
  onClose,
  onSuccess,
}: CompetitionFormModalProps) {
  const [name, setName] = useState(competition?.name ?? "")
  const [description, setDescription] = useState(competition?.description ?? "")
  const [startDate, setStartDate] = useState(
    formatDateForInput(competition?.startDate),
  )
  const [endDate, setEndDate] = useState(
    formatDateForInput(competition?.endDate),
  )
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>(
    mode === "create"
      ? courseList
          .filter((c) => DEFAULT_COURSE_NAMES.includes(c.name))
          .map((c) => c.id)
      : (competition?.courseIds ?? []),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCourse(courseId: number) {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    )
  }

  function validate(): string | null {
    if (!name.trim()) {
      return "名前は必須です。"
    }
    if (startDate && endDate && startDate > endDate) {
      return "開催日は終了日より前でなければなりません。"
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim() || null,
        startDate: startDate || null,
        endDate: endDate || null,
        courseIds: selectedCourseIds,
      }

      const url =
        mode === "create"
          ? "/api/competition"
          : `/api/competition/${competition?.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onSuccess(result.newList.competitions)
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
          {mode === "create" ? "大会を作成" : "大会を編集"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="comp-name">
              <span className="label-text">
                名前 <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="comp-name"
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="大会名"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="comp-desc">
              <span className="label-text">説明</span>
            </label>
            <textarea
              id="comp-desc"
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="大会の説明（任意）"
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label" htmlFor="comp-start">
                <span className="label-text">開催日</span>
              </label>
              <input
                id="comp-start"
                type="date"
                className="input input-bordered w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="label" htmlFor="comp-end">
                <span className="label-text">終了日</span>
              </label>
              <input
                id="comp-end"
                type="date"
                className="input input-bordered w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {startDate && endDate && startDate > endDate && (
            <p className="text-error text-sm">
              開催日は終了日より前でなければなりません。
            </p>
          )}

          {/* Course selection */}
          <div>
            <span className="label">
              <span className="label-text">コース</span>
            </span>
            {courseList.length > 0 ? (
              <div className="max-h-[8.5rem] overflow-y-auto rounded-xl border border-base-300/50 bg-base-200/30">
                {courseList.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-base-200/60"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={selectedCourseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                    />
                    <span className="text-sm">{c.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-base-200/30 px-3 py-2 text-base-content/40 text-sm">
                コースが登録されていません
              </p>
            )}
            <p className="mt-1 text-base-content/40 text-xs">
              コースの選択は任意です
            </p>
          </div>

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
              {mode === "create" ? "作成" : "保存"}
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

type DeleteCompetitionModalProps = {
  selectedIds: number[]
  competitions: SelectCompetitionWithCourse[]
  onClose: () => void
  onSuccess: (newList: SelectCompetitionWithCourse[]) => void
}

export function DeleteCompetitionModal({
  selectedIds,
  competitions,
  onClose,
  onSuccess,
}: DeleteCompetitionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedNames = competitions
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.name)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    try {
      for (const id of selectedIds) {
        const response = await fetch("/api/competition/", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "delete", id }),
        })
        const result = await response.json()

        if (!response.ok || !result.success) {
          setError(`ID ${id} の削除に失敗しました。`)
          setLoading(false)
          return
        }

        if (id === selectedIds[selectedIds.length - 1]) {
          onSuccess(result.newList.competitions)
        }
      }
    } catch {
      setError("送信中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="mb-4 font-bold text-lg">大会を削除</h3>
        <p className="mb-2">以下の大会を削除しますか？</p>
        <ul className="mb-4 list-inside list-disc text-sm">
          {selectedNames.map((name) => (
            <li key={name} className="font-medium">
              {name}
            </li>
          ))}
        </ul>
        <p className="text-sm text-warning">この操作は取り消せません。</p>
        {error && <p className="mt-2 text-error text-sm">{error}</p>}
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
            type="button"
            className="btn btn-error gap-1.5 rounded-lg shadow-error/20 shadow-lg transition-all duration-200 hover:shadow-error/30 hover:shadow-xl"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Trash2 className="size-4" />
            )}
            削除する
          </button>
        </div>
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
