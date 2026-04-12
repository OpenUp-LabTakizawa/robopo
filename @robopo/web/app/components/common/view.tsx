"use client"

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import type React from "react"
import { useMemo, useState } from "react"
import { CommonCheckboxList } from "@/app/components/common/commonList"
import { CourseFormModal } from "@/app/course/modals"
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
    onEditClick,
    onDeleteClick,
  }: {
    commonId: number[] | null
    onEditClick?: () => void
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
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1.5 rounded-lg"
            onClick={() => {
              setSuccessMessage(null)
              setCreateModalOpen(true)
            }}
          >
            <PlusIcon className="size-4" />
            新規作成
          </button>
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
              onEditClick?.()
            }}
          >
            <PencilSquareIcon className="size-4" />
            編集
          </button>
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
            <Cog6ToothIcon className="size-4" />
            コース編集
          </Link>
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
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
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

  function handleEditSuccess(newList: SelectCourseWithCompetition[]) {
    const parsed = newList.map((c) => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt) : null,
    }))
    setCommonDataList(parsed)
    setSuccessMessage("コースを更新しました")
    setErrorMessage(null)
    setEditModalOpen(false)
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
          onEditClick={() => setEditModalOpen(true)}
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
      <div className="min-h-0 flex-1 overflow-y-auto">
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

      {/* Course create modal */}
      {createModalOpen && competitionList && (
        <CourseFormModal
          mode="create"
          competitionList={competitionList}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Course edit modal */}
      {editModalOpen && selectedCourse && competitionList && (
        <CourseFormModal
          mode="edit"
          course={selectedCourse}
          competitionList={competitionList}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
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
