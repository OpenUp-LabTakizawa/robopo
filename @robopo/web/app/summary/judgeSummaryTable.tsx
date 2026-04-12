"use client"

import { XMarkIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import { DataTableShell } from "@/app/components/summary/DataTableShell"
import { MultiSortToolbar } from "@/app/components/summary/MultiSortToolbar"
import { useMultiSort } from "@/app/components/summary/useMultiSort"
import {
  formatTimestamp,
  type JudgeSummary,
} from "@/app/components/summary/utils"

type JudgeSortKey =
  | "judgeName"
  | "scoredPlayerCount"
  | "firstScoringTime"
  | "lastScoringTime"
  | "totalScoringCount"
  | "courseCount"
  | "averageScore"
  | "courseOutCount"

const SORT_OPTIONS: { value: JudgeSortKey; label: string }[] = [
  { value: "judgeName", label: "採点者名" },
  { value: "scoredPlayerCount", label: "採点人数" },
  { value: "firstScoringTime", label: "初採点時刻" },
  { value: "lastScoringTime", label: "最終採点時刻" },
  { value: "totalScoringCount", label: "採点回数" },
  { value: "courseCount", label: "担当コース数" },
  { value: "averageScore", label: "平均スコア" },
  { value: "courseOutCount", label: "コースアウト判定数" },
]

const TIME_SORT_KEYS = new Set<JudgeSortKey>([
  "firstScoringTime",
  "lastScoringTime",
])

function getSortLabel(key: JudgeSortKey): string {
  return SORT_OPTIONS.find((o) => o.value === key)?.label ?? key
}

function getOrderLabel(key: JudgeSortKey, order: "asc" | "desc"): string {
  if (key === "judgeName") {
    return order === "desc" ? "Z→A" : "A→Z"
  }
  if (TIME_SORT_KEYS.has(key)) {
    return order === "desc" ? "新しい順" : "古い順"
  }
  return order === "desc" ? "大きい順" : "小さい順"
}

const compareByKey = (
  a: JudgeSummary,
  b: JudgeSummary,
  key: JudgeSortKey,
): number => {
  switch (key) {
    case "judgeName":
      return (a.judgeName ?? "").localeCompare(b.judgeName ?? "", "ja")
    case "firstScoringTime":
    case "lastScoringTime": {
      const aTime = a[key] ? Date.parse(a[key] as string) : Infinity
      const bTime = b[key] ? Date.parse(b[key] as string) : Infinity
      return aTime - bTime
    }
    default: {
      const aV = (a[key] as number) ?? 0
      const bV = (b[key] as number) ?? 0
      return aV - bV
    }
  }
}

type Props = {
  competitionId: number
}

export function JudgeSummaryTable({ competitionId }: Props) {
  const [rawData, setRawData] = useState<JudgeSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [playerDetailNames, setPlayerDetailNames] = useState<string[] | null>(
    null,
  )

  const filtered = (() => {
    if (!searchQuery.trim()) {
      return rawData
    }
    const q = searchQuery.trim().toLowerCase()
    return rawData.filter(
      (j) => j.judgeName?.toLowerCase().includes(q) ?? false,
    )
  })()

  const {
    sorted: filteredAndSorted,
    conditions: sortConditions,
    addSort,
    removeSort,
    toggleOrder,
    resetSort,
    availableKeys,
  } = useMultiSort<JudgeSummary, JudgeSortKey>({
    data: filtered,
    defaultSort: [{ key: "totalScoringCount", order: "desc" }],
    compareByKey,
    allKeys: SORT_OPTIONS,
  })

  useEffect(() => {
    if (!competitionId) {
      setRawData([])
      return
    }
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/summary/judge/${competitionId}`, {
          cache: "no-store",
        })
        const data = await res.json()
        setRawData(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [competitionId])

  const columns = [
    "ID",
    "採点者名",
    "採点人数",
    "初採点時刻",
    "最終採点時刻",
    "採点回数",
    "担当コース数",
    "担当コース",
    "平均スコア",
    "コースアウト判定数",
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MultiSortToolbar<JudgeSortKey>
        searchPlaceholder="採点者名で検索"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortConditions={sortConditions}
        availableKeys={availableKeys}
        getSortLabel={getSortLabel}
        getOrderLabel={getOrderLabel}
        onToggleOrder={toggleOrder}
        onRemoveSort={removeSort}
        onAddSort={addSort}
        onReset={sortConditions.length > 1 ? resetSort : undefined}
      />

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <DataTableShell
          columns={columns}
          loading={loading}
          rowCount={filteredAndSorted.length}
          hasSearchQuery={!!searchQuery}
          noMatchMessage="条件に一致する採点者が見つかりません"
        >
          {filteredAndSorted.map((judge) => (
            <tr
              key={judge.judgeId}
              className="transition-colors duration-150 hover:bg-primary/5"
            >
              <td className="py-3">{judge.judgeId}</td>
              <td className="whitespace-nowrap py-3 font-medium">
                {judge.judgeName}
              </td>
              <td className="py-3">
                <button
                  type="button"
                  className="badge badge-primary badge-outline cursor-pointer transition-colors hover:bg-primary hover:text-primary-content"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPlayerDetailNames(judge.scoredPlayerNames ?? [])
                  }}
                >
                  {judge.scoredPlayerCount}
                </button>
              </td>
              <td className="whitespace-nowrap py-3">
                {formatTimestamp(judge.firstScoringTime)}
              </td>
              <td className="whitespace-nowrap py-3">
                {formatTimestamp(judge.lastScoringTime)}
              </td>
              <td className="py-3">{judge.totalScoringCount}</td>
              <td className="py-3">{judge.courseCount}</td>
              <td className="max-w-[200px] py-3">
                <div className="line-clamp-2 text-xs">
                  {judge.courseNames?.join(", ") || "-"}
                </div>
              </td>
              <td className="py-3">{judge.averageScore ?? "-"}</td>
              <td className="py-3">{judge.courseOutCount}</td>
            </tr>
          ))}
        </DataTableShell>
      </div>

      {/* Player detail modal */}
      {playerDetailNames !== null && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">採点選手一覧</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setPlayerDetailNames(null)}
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {playerDetailNames.length > 0 ? (
                <ul className="space-y-1.5">
                  {playerDetailNames.map((name) => (
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
                  採点した選手はいません
                </p>
              )}
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn rounded-lg"
                onClick={() => setPlayerDetailNames(null)}
              >
                閉じる
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setPlayerDetailNames(null)}
            onKeyDown={(e) => e.key === "Escape" && setPlayerDetailNames(null)}
          >
            <button type="button" className="cursor-default">
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  )
}
