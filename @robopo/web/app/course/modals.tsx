"use client"

import {
  CheckCircleIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import type {
  SelectCompetition,
  SelectCourseWithCompetition,
} from "@/app/lib/db/schema"

type CourseFormModalProps = {
  mode: "create" | "edit"
  course?: SelectCourseWithCompetition | null
  competitionList: SelectCompetition[]
  onClose: () => void
  onSuccess: (newList: SelectCourseWithCompetition[]) => void
}

export function CourseFormModal({
  mode,
  course,
  competitionList,
  onClose,
  onSuccess,
}: CourseFormModalProps) {
  const [name, setName] = useState(course?.name ?? "")
  const [description, setDescription] = useState(course?.description ?? "")
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<
    number[]
  >(course?.competitionIds ?? [])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCompetition(id: number) {
    setSelectedCompetitionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError("コース名は必須です。")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        // Step 1: Create course with empty content
        const createRes = await fetch("/api/course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            field: null,
            mission: null,
            point: null,
            courseOutRule: "keep",
          }),
        })
        const createResult = await createRes.json()
        if (!createRes.ok || !createResult.success) {
          setError(createResult.message || "エラーが発生しました。")
          setLoading(false)
          return
        }

        const newCourseId = createResult.data[0].id

        // Step 2: Link competitions if any selected
        if (selectedCompetitionIds.length > 0) {
          const assignRes = await fetch("/api/assign/course", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseId: newCourseId,
              competitionIds: selectedCompetitionIds,
            }),
          })
          const assignResult = await assignRes.json()
          if (!assignRes.ok || !assignResult.success) {
            setError(
              assignResult.message ||
                "大会との紐付けに失敗しました。コース自体は作成されています。",
            )
            setLoading(false)
            return
          }
        }

        // Step 3: Show success then navigate to course editor
        setSuccess(true)
        setTimeout(() => {
          window.location.href = `/course/edit/${newCourseId}`
        }, 800)
      } else {
        // Edit mode
        // Step 1: Update name & description
        const patchRes = await fetch(`/api/course?id=${course?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
          }),
        })
        const patchResult = await patchRes.json()
        if (!patchRes.ok || !patchResult.success) {
          setError(patchResult.message || "エラーが発生しました。")
          setLoading(false)
          return
        }

        // Step 2: Update competition links
        const assignRes = await fetch("/api/assign/course", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course?.id,
            competitionIds: selectedCompetitionIds,
          }),
        })
        const assignResult = await assignRes.json()
        if (assignRes.ok && assignResult.success) {
          setLoading(false)
          onSuccess(assignResult.newList)
        } else {
          setError(assignResult.message || "エラーが発生しました。")
          setLoading(false)
        }
      }
    } catch {
      setError("送信中にエラーが発生しました。")
      setLoading(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="mb-4 font-bold text-lg">
          {mode === "create" ? "コースを登録" : "コースを編集"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="course-name">
              <span className="label-text">
                コース名 <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="course-name"
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="コース名"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="course-description">
              <span className="label-text">説明</span>
            </label>
            <textarea
              id="course-description"
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="コースの説明（任意）"
              rows={3}
            />
          </div>

          {/* Competition selection */}
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

          {error && <p className="text-error text-sm">{error}</p>}
          <div className="modal-action">
            <button
              type="button"
              className="btn gap-1.5 rounded-lg"
              onClick={onClose}
              disabled={loading || success}
            >
              <XMarkIcon className="size-4" />
              キャンセル
            </button>
            {success ? (
              <button
                type="button"
                disabled
                className="btn btn-success gap-1.5 rounded-lg shadow-lg shadow-success/20 transition-all duration-200"
              >
                <CheckCircleIcon className="size-4 animate-[scale-in_0.3s_ease-out]" />
                登録成功
              </button>
            ) : (
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
            )}
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
