"use client"

import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  Filter,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { CommonCheckboxList } from "@/components/common/commonList"
import { JudgeDeleteModal, JudgeFormModal } from "@/components/judge/modals"
import type {
  SelectCompetition,
  SelectJudgeWithCompetition,
} from "@/lib/db/schema"

type SortKey = "username" | "id"

export function JudgeView({
  initialJudgeList,
  competitionList,
}: {
  initialJudgeList: SelectJudgeWithCompetition[]
  competitionList: SelectCompetition[]
}) {
  const [judgeList, setJudgeList] = useState(initialJudgeList)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("id")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [competitionFilter, setCompetitionFilter] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const selectedJudge =
    selectedIds.length === 1
      ? (judgeList.find((j) => j.id === selectedIds[0]) ?? null)
      : null

  const selectedJudges = judgeList.filter((j) => selectedIds.includes(j.id))

  const competitionNames = (() => {
    const names = new Set<string>()
    for (const j of judgeList) {
      for (const name of j.competitionName ?? []) {
        names.add(name)
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b, "ja"))
  })()

  const filteredAndSortedList = (() => {
    let list = judgeList
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (j) =>
          j.username.toLowerCase().includes(q) ||
          (j.note?.toLowerCase().includes(q) ?? false),
      )
    }
    if (competitionFilter) {
      list = list.filter((j) => j.competitionName?.includes(competitionFilter))
    }
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "username") {
        cmp = a.username.localeCompare(b.username)
      } else {
        cmp = a.id - b.id
      }
      return sortOrder === "asc" ? cmp : -cmp
    })
  })()

  function handleSuccess(
    newList: SelectJudgeWithCompetition[],
    message: string,
  ) {
    const parsed = newList.map((j) => ({
      ...j,
      createdAt: j.createdAt ? new Date(j.createdAt) : null,
    }))
    setJudgeList(parsed)
    setSuccessMessage(message)
    setErrorMessage(null)
    setSelectedIds([])
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Action bar */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        {successMessage && (
          <div className="bg-success/10 text-success mb-3 rounded-lg px-4 py-2 text-sm font-medium">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-error/10 text-error mb-3 rounded-lg px-4 py-2 text-sm font-medium">
            {errorMessage}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-primary shadow-primary/20 hover:shadow-primary/30 gap-1.5 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            onClick={() => {
              setSuccessMessage(null)
              setCreateModalOpen(true)
            }}
          >
            <Plus className="size-4" />
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
            <SquarePen className="size-4" />
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
            <Trash2 className="size-4" />
            削除
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
        <label className="input input-bordered bg-base-200/40 focus-within:bg-base-100 flex items-center gap-2 rounded-xl transition-colors">
          <Search className="text-base-content/40 size-4 shrink-0" />
          <input
            type="text"
            placeholder="ユーザー名・備考で検索"
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-base-200/50 flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5">
            <Filter className="text-base-content/40 size-3.5 shrink-0" />
            <span className="shrink-0 text-xs">大会</span>
            <select
              className="select select-ghost select-xs [&>option]:bg-base-100 [&>option]:text-base-content bg-transparent [background-image:none] pe-0 font-medium focus:outline-none"
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
          <div className="bg-base-200/50 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5">
            <select
              className="select select-ghost select-xs [&>option]:bg-base-100 [&>option]:text-base-content bg-transparent font-medium focus:outline-none"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="id">ID</option>
              <option value="username">ユーザー名</option>
            </select>
            <button
              type="button"
              className="bg-base-100 hover:bg-base-300/40 flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs shadow-sm transition-colors"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortKey === "username" ? (
                sortOrder === "desc" ? (
                  <ArrowDownAZ className="size-3.5" />
                ) : (
                  <ArrowUpAZ className="size-3.5" />
                )
              ) : sortOrder === "desc" ? (
                <ArrowDown01 className="size-3.5" />
              ) : (
                <ArrowUp01 className="size-3.5" />
              )}
              {sortKey === "username"
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

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {(searchQuery || competitionFilter) &&
        filteredAndSortedList.length === 0 ? (
          <div className="text-base-content/40 py-8 text-center">
            条件に一致する採点者が見つかりません
          </div>
        ) : (
          <CommonCheckboxList
            props={{
              type: "judge",
              commonDataList: filteredAndSortedList,
            }}
            commonId={selectedIds}
            setCommonId={setSelectedIds}
          />
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <JudgeFormModal
          mode="create"
          competitionList={competitionList}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={(newList) => {
            handleSuccess(newList, "採点者を登録しました")
            setCreateModalOpen(false)
          }}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedJudge && (
        <JudgeFormModal
          mode="edit"
          judge={selectedJudge}
          competitionList={competitionList}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(newList) => {
            handleSuccess(newList, "採点者を更新しました")
            setEditModalOpen(false)
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedJudges.length > 0 && (
        <JudgeDeleteModal
          judges={selectedJudges}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => {
            setSuccessMessage("採点者を削除しました")
            setErrorMessage(null)
            setDeleteModalOpen(false)
            setSelectedIds([])
            window.location.href = "/judge"
          }}
        />
      )}
    </div>
  )
}
