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
import { CommonCheckboxList } from "@/app/components/common/commonList"
import type {
  SelectCompetition,
  SelectPlayerWithCompetition,
} from "@/app/lib/db/schema"
import { PlayerDeleteModal, PlayerFormModal } from "@/app/player/modals"

type SortKey = "id" | "name" | "furigana" | "bibNumber"

export function PlayerView({
  initialPlayerList,
  competitionList,
}: {
  initialPlayerList: SelectPlayerWithCompetition[]
  competitionList: SelectCompetition[]
}) {
  const [playerList, setPlayerList] = useState(initialPlayerList)
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

  const selectedPlayer =
    selectedIds.length === 1
      ? (playerList.find((p) => p.id === selectedIds[0]) ?? null)
      : null

  const selectedPlayers = playerList.filter((p) => selectedIds.includes(p.id))

  const competitionNames = (() => {
    const names = new Set<string>()
    for (const p of playerList) {
      for (const name of p.competitionName ?? []) {
        names.add(name)
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b, "ja"))
  })()

  const filteredAndSortedList = (() => {
    let list = playerList
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.furigana?.toLowerCase().includes(q) ?? false) ||
          (p.bibNumber?.toLowerCase().includes(q) ?? false) ||
          (p.note?.toLowerCase().includes(q) ?? false),
      )
    }
    if (competitionFilter) {
      list = list.filter((p) => p.competitionName?.includes(competitionFilter))
    }
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "ja")
      } else if (sortKey === "furigana") {
        cmp = (a.furigana ?? "").localeCompare(b.furigana ?? "", "ja")
      } else if (sortKey === "bibNumber") {
        cmp = (a.bibNumber ?? "").localeCompare(b.bibNumber ?? "", "ja", {
          numeric: true,
        })
      } else {
        cmp = a.id - b.id
      }
      return sortOrder === "asc" ? cmp : -cmp
    })
  })()

  function handleSuccess(
    newList: SelectPlayerWithCompetition[],
    message: string,
  ) {
    const parsed = newList.map((p) => ({
      ...p,
      createdAt: p.createdAt ? new Date(p.createdAt) : null,
    }))
    setPlayerList(parsed)
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
        <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100">
          <Search className="size-4 shrink-0 text-base-content/40" />
          <input
            type="text"
            placeholder="名前・ふりがな・ゼッケン番号・備考で検索"
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5">
            <Filter className="size-3.5 shrink-0 text-base-content/40" />
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
              <option value="id">ID</option>
              <option value="name">名前</option>
              <option value="furigana">ふりがな</option>
              <option value="bibNumber">ゼッケン番号</option>
            </select>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-md bg-base-100 px-2 py-1 text-xs shadow-sm transition-colors hover:bg-base-300/40"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortKey === "name" || sortKey === "furigana" ? (
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
              {sortKey === "name" || sortKey === "furigana"
                ? sortOrder === "desc"
                  ? "Z→A"
                  : "A→Z"
                : sortKey === "bibNumber"
                  ? sortOrder === "desc"
                    ? "大きい順"
                    : "小さい順"
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
          <div className="py-8 text-center text-base-content/40">
            条件に一致する選手が見つかりません
          </div>
        ) : (
          <CommonCheckboxList
            props={{
              type: "player",
              commonDataList: filteredAndSortedList,
            }}
            commonId={selectedIds}
            setCommonId={setSelectedIds}
          />
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <PlayerFormModal
          mode="create"
          competitionList={competitionList}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={(newList) => {
            handleSuccess(newList, "選手を登録しました")
            setCreateModalOpen(false)
          }}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedPlayer && (
        <PlayerFormModal
          mode="edit"
          player={selectedPlayer}
          competitionList={competitionList}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(newList) => {
            handleSuccess(newList, "選手を更新しました")
            setEditModalOpen(false)
          }}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedPlayers.length > 0 && (
        <PlayerDeleteModal
          players={selectedPlayers}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => {
            setSuccessMessage("選手を削除しました")
            setErrorMessage(null)
            setDeleteModalOpen(false)
            setSelectedIds([])
            window.location.href = "/player"
          }}
        />
      )}
    </div>
  )
}
