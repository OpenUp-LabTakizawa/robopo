"use client"

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"
import { CommonCheckboxList } from "@/app/components/common/commonList"
import { CompetitionFormModal, DeleteCompetitionModal } from "@/app/config/tabs"
import {
  type CompetitionStatus,
  getCompetitionStatus,
} from "@/app/lib/competition"
import type {
  SelectCompetitionWithCourse,
  SelectCourse,
} from "@/app/lib/db/schema"

type SortKey = "name" | "id" | "startDate" | "endDate"
type StatusFilter = "" | CompetitionStatus

export function CompetitionView({
  initialCompetitionList,
  courseList,
}: {
  initialCompetitionList: SelectCompetitionWithCourse[]
  courseList: SelectCourse[]
}) {
  const [competitionList, setCompetitionList] = useState(initialCompetitionList)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("id")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const selectedCompetition =
    selectedIds.length === 1
      ? (competitionList.find((c) => c.id === selectedIds[0]) ?? null)
      : null

  const filteredAndSortedList = useMemo(() => {
    let list = competitionList

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false),
      )
    }

    if (statusFilter) {
      list = list.filter((c) => getCompetitionStatus(c) === statusFilter)
    }

    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "ja")
      } else if (sortKey === "startDate") {
        cmp = (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0)
      } else if (sortKey === "endDate") {
        cmp = (a.endDate?.getTime() ?? 0) - (b.endDate?.getTime() ?? 0)
      } else {
        cmp = a.id - b.id
      }
      return sortOrder === "asc" ? cmp : -cmp
    })
  }, [competitionList, searchQuery, statusFilter, sortKey, sortOrder])

  function handleSuccess(
    newList: SelectCompetitionWithCourse[],
    message: string,
  ) {
    // API JSON responses return dates as strings; convert them back to Date objects
    const parsed = newList.map((c) => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt) : null,
      startDate: c.startDate ? new Date(c.startDate) : null,
      endDate: c.endDate ? new Date(c.endDate) : null,
    }))
    setCompetitionList(parsed)
    setSuccessMessage(message)
    setErrorMessage(null)
    setSelectedIds([])
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Action bar */}
      <div className="shrink-0 px-4 pt-4 pb-2">
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
            className="btn btn-sm btn-primary gap-1.5 rounded-lg shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:shadow-xl"
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
              selectedIds.length !== 1
                ? "btn-disabled"
                : "btn-primary btn-outline"
            }`}
            disabled={selectedIds.length !== 1}
            onClick={() => {
              setSuccessMessage(null)
              setEditModalOpen(true)
            }}
          >
            <PencilSquareIcon className="size-4" />
            編集
          </button>
          <button
            type="button"
            className={`btn btn-sm gap-1.5 rounded-lg ${
              selectedIds.length === 0
                ? "btn-disabled"
                : "btn-error btn-outline"
            }`}
            disabled={selectedIds.length === 0}
            onClick={() => {
              setSuccessMessage(null)
              setDeleteModalOpen(true)
            }}
          >
            <TrashIcon className="size-4" />
            削除
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
        <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-base-content/40" />
          <input
            type="text"
            placeholder="名前・説明で検索"
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5">
            <FunnelIcon className="size-3.5 shrink-0 text-base-content/40" />
            <span className="shrink-0 text-xs">状態</span>
            <select
              className="select select-ghost select-xs bg-transparent pe-0 font-medium focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
              style={{ backgroundImage: "none" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="">すべて</option>
              <option value="before">開催前</option>
              <option value="active">開催中</option>
              <option value="ended">終了済</option>
              <option value="unknown">未設定</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5">
            <select
              className="select select-ghost select-xs bg-transparent font-medium focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="id">ID</option>
              <option value="name">名前</option>
              <option value="startDate">開催日</option>
              <option value="endDate">終了日</option>
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
              {sortKey === "name"
                ? sortOrder === "desc"
                  ? "Z→A"
                  : "A→Z"
                : sortKey === "startDate" || sortKey === "endDate"
                  ? sortOrder === "desc"
                    ? "新しい順"
                    : "古い順"
                  : sortOrder === "desc"
                    ? "大きい順"
                    : "小さい順"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1">
        {(searchQuery || statusFilter) && filteredAndSortedList.length === 0 ? (
          <div className="py-8 text-center text-base-content/40">
            条件に一致する大会が見つかりません
          </div>
        ) : (
          <CommonCheckboxList
            props={{
              type: "competition",
              commonDataList: filteredAndSortedList,
            }}
            commonId={selectedIds}
            setCommonId={setSelectedIds}
          />
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <CompetitionFormModal
          mode="create"
          courseList={courseList}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={(newList) => {
            handleSuccess(newList, "大会を作成しました")
            setCreateModalOpen(false)
          }}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedCompetition && (
        <CompetitionFormModal
          mode="edit"
          competition={selectedCompetition}
          courseList={courseList}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(newList) => {
            handleSuccess(newList, "大会を更新しました")
            setEditModalOpen(false)
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <DeleteCompetitionModal
          selectedIds={selectedIds}
          competitions={competitionList}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={(newList) => {
            handleSuccess(newList, "大会を削除しました")
            setDeleteModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
