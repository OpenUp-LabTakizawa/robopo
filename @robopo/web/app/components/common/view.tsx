"use client"

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import type React from "react"
import { useMemo, useState } from "react"
import { CommonCheckboxList } from "@/app/components/common/commonList"
import type {
  SelectCompetition,
  SelectCourseWithCompetition,
} from "@/app/lib/db/schema"

type SortKey = "createdAt" | "name" | "id"

export function View({
  initialCommonDataList,
  competitionList,
}: {
  initialCommonDataList: SelectCourseWithCompetition[]
  competitionList: SelectCompetition[]
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [commonDataList, setCommonDataList] = useState<
    SelectCourseWithCompetition[]
  >(initialCommonDataList)

  // Action options for selected items
  function ItemManager({
    commonId,
    onAssignClick,
    onDeleteClick,
  }: {
    commonId: number[] | null
    onAssignClick?: () => void
    onDeleteClick?: () => void
  }) {
    return (
      <div className="px-4 pt-2 pb-4">
        {successMessage && (
          <div className="mb-3 rounded-lg bg-success/10 px-4 py-2 font-medium text-sm text-success">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-3 rounded-lg bg-error/10 px-4 py-2 font-medium text-error text-sm">
            {errorMessage}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/course/edit/${commonId?.length === 1 ? commonId[0] : ""}`}
            className={`btn btn-sm gap-1.5 rounded-lg ${
              commonId?.length !== 1
                ? "btn-disabled pointer-events-none"
                : "btn-primary btn-outline"
            }`}
            aria-disabled={commonId?.length !== 1}
            tabIndex={commonId?.length !== 1 ? -1 : undefined}
            onClick={() => {
              setSuccessMessage(null)
            }}
          >
            <PencilSquareIcon className="size-4" />
            編集
          </Link>
          <button
            type="button"
            className={`btn btn-sm gap-1.5 rounded-lg ${
              commonId?.length !== 1
                ? "btn-disabled"
                : "btn-primary btn-outline"
            }`}
            disabled={commonId?.length !== 1}
            onClick={() => {
              setSuccessMessage(null)
              onAssignClick?.()
            }}
          >
            <LinkIcon className="size-4" />
            大会紐付け
          </button>
          <button
            type="button"
            className={`btn btn-sm gap-1.5 rounded-lg ${
              commonId === null || commonId?.length === 0
                ? "btn-disabled"
                : "btn-error btn-outline"
            }`}
            disabled={commonId === null || commonId?.length === 0}
            onClick={() => {
              setSuccessMessage(null)
              onDeleteClick?.()
            }}
          >
            <TrashIcon className="size-4" />
            削除
          </button>
        </div>
      </div>
    )
  }

  function CourseFilterBar({
    searchQuery,
    setSearchQuery,
    competitionFilter,
    setCompetitionFilter,
    competitionNames,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
  }: {
    searchQuery: string
    setSearchQuery: (v: string) => void
    competitionFilter: string
    setCompetitionFilter: (v: string) => void
    competitionNames: string[]
    sortKey: SortKey
    setSortKey: (v: SortKey) => void
    sortOrder: "asc" | "desc"
    setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>
  }) {
    return (
      <div className="flex flex-col gap-3 px-4 pb-4">
        <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-base-content/40" />
          <input
            type="text"
            placeholder="コース名・説明で検索"
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5">
            <FunnelIcon className="size-3.5 shrink-0 text-base-content/40" />
            <span className="shrink-0 text-xs">大会</span>
            <select
              className="select select-ghost select-xs bg-transparent pe-0 font-medium focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
              style={{ backgroundImage: "none" }}
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
            >
              <option value="">すべて</option>
              {competitionNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5">
            <select
              className="select select-ghost select-xs bg-transparent font-medium focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="createdAt">作成日時</option>
              <option value="name">コース名</option>
              <option value="id">ID</option>
            </select>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-md bg-base-100 px-2 py-1 text-xs shadow-sm transition-colors hover:bg-base-300/40"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortOrder === "desc" ? (
                <BarsArrowDownIcon className="size-3.5" />
              ) : (
                <BarsArrowUpIcon className="size-3.5" />
              )}
              {sortKey === "createdAt"
                ? sortOrder === "desc"
                  ? "新しい順"
                  : "古い順"
                : sortKey === "name"
                  ? sortOrder === "desc"
                    ? "Z→A"
                    : "A→Z"
                  : sortOrder === "desc"
                    ? "大きい順"
                    : "小さい順"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const [commonId, setCommonId] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [competitionFilter, setCompetitionFilter] = useState("")
  const [competitionDetailNames, setCompetitionDetailNames] = useState<
    string[] | null
  >(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const courseDataList = commonDataList

  const competitionNames = useMemo(() => {
    const names = new Set<string>()
    for (const c of courseDataList) {
      for (const name of c.competitionName ?? []) {
        names.add(name)
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b, "ja"))
  }, [courseDataList])

  const filteredAndSortedList = useMemo(() => {
    let list = courseDataList
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false),
      )
    }
    if (competitionFilter) {
      list = list.filter((c) => c.competitionName?.includes(competitionFilter))
    }
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "ja")
      } else if (sortKey === "createdAt") {
        cmp = (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
      } else {
        cmp = a.id - b.id
      }
      return sortOrder === "asc" ? cmp : -cmp
    })
  }, [courseDataList, searchQuery, sortKey, sortOrder, competitionFilter])

  const selectedCourse =
    commonId.length === 1
      ? (courseDataList.find((c) => c.id === commonId[0]) ?? null)
      : null

  const selectedCourses = courseDataList.filter((c) => commonId.includes(c.id))

  function handleAssignSuccess(newList: SelectCourseWithCompetition[]) {
    const parsed = newList.map((c) => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt) : null,
    }))
    setCommonDataList(parsed)
    setSuccessMessage("大会紐付けを更新しました")
    setErrorMessage(null)
    setAssignModalOpen(false)
    setCommonId([])
  }

  function handleDeleteSuccess() {
    setSuccessMessage("コースを削除しました")
    setErrorMessage(null)
    setDeleteModalOpen(false)
    setCommonId([])
    // Reload to get fresh data
    window.location.href = "/course"
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">
        <ItemManager
          commonId={commonId}
          onAssignClick={() => setAssignModalOpen(true)}
          onDeleteClick={() => setDeleteModalOpen(true)}
        />
        <CourseFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          competitionFilter={competitionFilter}
          setCompetitionFilter={setCompetitionFilter}
          competitionNames={competitionNames}
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>
      <div className="min-h-0 flex-1">
        {(searchQuery || competitionFilter) &&
        filteredAndSortedList.length === 0 ? (
          <div className="py-8 text-center text-base-content/40">
            条件に一致するコースが見つかりません
          </div>
        ) : (
          <CommonCheckboxList
            props={{ type: "course", commonDataList: filteredAndSortedList }}
            commonId={commonId}
            setCommonId={setCommonId}
            onCourseCompetitionClick={setCompetitionDetailNames}
          />
        )}
      </div>

      {/* Competition detail modal */}
      {competitionDetailNames !== null && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">使用大会一覧</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setCompetitionDetailNames(null)}
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {competitionDetailNames.length > 0 ? (
                <ul className="space-y-1.5">
                  {competitionDetailNames.map((name) => (
                    <li
                      key={name}
                      className="rounded-lg bg-base-200/50 px-3 py-2.5 text-sm"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-base-content/40 text-sm">
                  使用大会はありません
                </p>
              )}
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn rounded-lg"
                onClick={() => setCompetitionDetailNames(null)}
              >
                閉じる
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setCompetitionDetailNames(null)}
            onKeyDown={(e) =>
              e.key === "Escape" && setCompetitionDetailNames(null)
            }
          >
            <button type="button" className="cursor-default">
              close
            </button>
          </form>
        </dialog>
      )}

      {/* Course assign modal */}
      {assignModalOpen && selectedCourse && competitionList && (
        <CourseAssignModal
          course={selectedCourse}
          competitionList={competitionList}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* Course delete modal */}
      {deleteModalOpen && selectedCourses.length > 0 && (
        <CourseDeleteModal
          courses={selectedCourses}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}

// Course-specific assign modal with checkbox selection
function CourseAssignModal({
  course,
  competitionList,
  onClose,
  onSuccess,
}: {
  course: SelectCourseWithCompetition
  competitionList: SelectCompetition[]
  onClose: () => void
  onSuccess: (newList: SelectCourseWithCompetition[]) => void
}) {
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<
    number[]
  >(course.competitionIds ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCompetition(id: number) {
    setSelectedCompetitionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/assign/course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          competitionIds: selectedCompetitionIds,
        }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        onSuccess(result.newList)
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-lg">大会紐付け</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>
        <p className="mb-3 text-base-content/60 text-sm">
          <span className="font-medium text-base-content">{course.name}</span>{" "}
          に紐付ける大会を選択してください
        </p>
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
        {error && <p className="mt-2 text-error text-sm">{error}</p>}
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
            type="button"
            className="btn btn-primary gap-1.5 rounded-lg shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:shadow-xl"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <LinkIcon className="size-4" />
            )}
            保存
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

// Course delete modal with competition link protection
function CourseDeleteModal({
  courses,
  onClose,
  onSuccess,
}: {
  courses: SelectCourseWithCompetition[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasLinkedCourses = courses.some(
    (c) => (c.competitionName?.length ?? 0) > 0,
  )

  async function handleDelete() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/course", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: courses.map((c) => c.id) }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSuccessMessage("コースを正常に削除しました")
      } else {
        setErrorMessage(result.message || "コースを削除できませんでした")
      }
    } catch {
      setErrorMessage("コースを削除できませんでした")
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
          ) : hasLinkedCourses ? (
            <div className="flex flex-col items-center gap-3">
              <ExclamationTriangleIcon className="size-12 text-warning" />
              <p className="text-center font-medium">
                使用大会が0でないコースは削除できません。
                <br />
                先に紐付けを解除してください。
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ExclamationTriangleIcon className="size-12 text-warning" />
              <p className="text-center font-medium">
                選択したコースを削除しますか?
              </p>
              <ul className="w-full list-inside list-disc text-sm">
                {courses.map((c) => (
                  <li key={c.id} className="font-medium">
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 flex w-full items-center gap-2 rounded-lg bg-error/10 px-4 py-2.5 text-error text-sm">
              <XCircleIcon className="size-5 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex w-full flex-col gap-2">
            {!hasLinkedCourses && !successMessage && (
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
