"use client"

import { Check, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getMissionParameterUnit } from "@/lib/course/mission"
import {
  MissionString,
  type MissionValue,
  type PointState,
} from "@/lib/course/types"
import { calcPoint } from "@/lib/scoring/scoring"
import { isCompletedCourse } from "@/lib/summary/format"

type ChallengeResult = {
  id: number
  firstResult: number
  retryResult: number | null
  detail: string | null
}

type CourseDetailTableProps = {
  courseId: number
  missionPair: MissionValue[][]
  point: PointState
  resultArray: ChallengeResult[]
  isEditing: boolean
  onDataChange: () => void
}

// Flatten attempts into individual columns
type AttemptColumn = {
  challengeId: number
  type: "first" | "retry"
  result: number | null
}

function flattenAttempts(resultArray: ChallengeResult[]): AttemptColumn[] {
  const columns: AttemptColumn[] = []
  for (const r of resultArray) {
    columns.push({
      challengeId: r.id,
      type: "first",
      result: r.firstResult,
    })
    if (r.retryResult !== null) {
      columns.push({
        challengeId: r.id,
        type: "retry",
        result: r.retryResult,
      })
    }
  }
  return columns
}

export function CourseDetailTable({
  courseId,
  missionPair,
  point,
  resultArray,
  isEditing,
  onDataChange,
}: CourseDetailTableProps) {
  const [currentTab, setCurrentTab] = useState(0)
  const [itemsPerTab, setItemsPerPage] = useState(5)
  const [editValues, setEditValues] = useState<Map<string, number | null>>(
    new Map(),
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const mq640 = window.matchMedia("(min-width: 640px)")
    const mq1024 = window.matchMedia("(min-width: 1024px)")

    function update() {
      if (mq1024.matches) {
        setItemsPerPage(20)
      } else if (mq640.matches) {
        setItemsPerPage(10)
      } else {
        setItemsPerPage(5)
      }
    }

    mq640.addEventListener("change", update)
    mq1024.addEventListener("change", update)
    update()
    return () => {
      mq640.removeEventListener("change", update)
      mq1024.removeEventListener("change", update)
    }
  }, [])

  // Reset edit values when editing mode changes
  useEffect(() => {
    if (!isEditing) {
      setEditValues(new Map())
    }
  }, [isEditing])

  const allColumns = flattenAttempts(resultArray)
  const totalColumns = allColumns.length
  const totalPages = Math.ceil(totalColumns / itemsPerTab)
  const startIndex = currentTab * itemsPerTab
  const visibleColumns = allColumns.slice(startIndex, startIndex + itemsPerTab)
  const padCount = Math.max(0, itemsPerTab - visibleColumns.length)

  // Pre-generate stable keys for mission rows (static list, never reordered)
  const missionKeys = missionPair.map(
    (pair, idx) => `m-${idx}-${String(pair[0])}-${String(pair[1])}`,
  )

  const hasEdits = editValues.size > 0

  function getEditKey(challengeId: number, type: "first" | "retry"): string {
    return `${challengeId}:${type}`
  }

  function getDisplayResult(col: AttemptColumn): number | null {
    const key = getEditKey(col.challengeId, col.type)
    if (editValues.has(key)) {
      return editValues.get(key) ?? null
    }
    return col.result
  }

  function handleEditChange(col: AttemptColumn, value: string) {
    const key = getEditKey(col.challengeId, col.type)
    const num = value === "" ? null : Number.parseInt(value, 10)
    const next = new Map(editValues)
    if (num === col.result) {
      next.delete(key)
    } else {
      next.set(key, Number.isNaN(num) ? null : num)
    }
    setEditValues(next)
  }

  async function handleSave() {
    setSaving(true)
    // Group edits by challengeId
    const updates = new Map<
      number,
      { firstResult?: number; retryResult?: number | null }
    >()
    for (const [key, value] of editValues) {
      const [idStr, type] = key.split(":")
      const id = Number(idStr)
      if (!updates.has(id)) {
        updates.set(id, {})
      }
      const u = updates.get(id)
      if (!u) {
        continue
      }
      if (type === "first") {
        u.firstResult = value ?? 0
      } else {
        u.retryResult = value
      }
    }
    const results = await Promise.allSettled(
      Array.from(updates, ([id, data]) =>
        fetch("/api/challenge", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...data }),
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to update challenge ${id}`)
          }
          return id
        }),
      ),
    )

    // Keep failed edits in state so the user can retry
    const failedIds = new Set(
      results
        .filter((r) => r.status === "rejected")
        .map((_, i) => Array.from(updates.keys())[i]),
    )

    if (failedIds.size > 0) {
      const next = new Map(editValues)
      for (const key of next.keys()) {
        const id = Number(key.split(":")[0])
        if (!failedIds.has(id)) {
          next.delete(key)
        }
      }
      setEditValues(next)
      setSaving(false)
      alert(`${failedIds.size}件の更新に失敗しました。再度お試しください。`)
      return
    }

    setEditValues(new Map())
    setSaving(false)
    onDataChange()
  }

  async function handleDelete(challengeId: number) {
    try {
      const res = await fetch("/api/challenge", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: challengeId }),
      })
      if (!res.ok) {
        throw new Error("Delete failed")
      }
      onDataChange()
    } catch {
      alert("削除に失敗しました。再度お試しください。")
    }
  }

  function missionCompleted(result: number | null, missionIndex: number) {
    return result !== null && result > missionIndex
  }

  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm print:shadow-none">
      <div className="card-body p-4">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-compact table w-full border-collapse">
            <thead>
              {/* Column numbers + delete buttons */}
              <tr>
                <th
                  colSpan={3}
                  className="border border-base-300 bg-base-200 p-2 text-center text-xs"
                />
                {visibleColumns.map((col, i) => (
                  <th
                    key={`hdr-${col.challengeId}-${col.type}`}
                    className="relative min-w-10 border border-base-300 bg-base-200 p-2 text-center font-mono text-xs"
                  >
                    <span className="tabular-nums">{startIndex + i + 1}</span>
                    {col.type === "retry" && (
                      <span className="ml-0.5 text-warning text-xs">R</span>
                    )}
                    {isEditing && col.type === "first" && (
                      <button
                        type="button"
                        className="btn btn-circle btn-error btn-xs absolute -top-1 -right-1 opacity-70 hover:opacity-100"
                        onClick={() => handleDelete(col.challengeId)}
                        title="この試行を削除"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </th>
                ))}
                {Array.from({ length: padCount }, (_, i) => {
                  const key = `pad-h-${startIndex + visibleColumns.length + i}`
                  return (
                    <th
                      key={key}
                      className="min-w-10 border border-base-300 bg-base-200"
                    />
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {/* Mission rows */}
              {missionPair.map((pair, mIdx) => (
                <tr key={missionKeys[mIdx]}>
                  <td className="w-8 border border-base-300 p-2 text-center font-mono text-xs tabular-nums">
                    {mIdx + 1}
                  </td>
                  <td className="whitespace-nowrap border border-base-300 p-2 text-sm">
                    {pair[0] !== null && MissionString[pair[0]]}
                    {pair[1] !== null && String(pair[1])}
                    {pair[0] !== null && getMissionParameterUnit(pair[0])}
                  </td>
                  <td className="w-10 border border-base-300 bg-base-200/50 p-2 text-center font-mono text-xs tabular-nums">
                    {point[mIdx + 2] !== null &&
                      (Array.isArray(point[mIdx + 2])
                        ? (point[mIdx + 2] as number[])[0]
                        : point[mIdx + 2])}
                  </td>
                  {visibleColumns.map((col) => {
                    const res = getDisplayResult(col)
                    const completed = missionCompleted(res, mIdx)
                    return (
                      <td
                        key={`c-${col.challengeId}-${col.type}-${missionKeys[mIdx]}`}
                        className={`min-w-10 border border-base-300 p-2 text-center ${
                          completed ? "text-success" : "text-base-content/20"
                        }`}
                      >
                        {completed ? (
                          <Check className="mx-auto size-4" strokeWidth={3} />
                        ) : (
                          ""
                        )}
                      </td>
                    )
                  })}
                  {Array.from({ length: padCount }, (_, i) => {
                    const key = `pad-${missionKeys[mIdx]}-${startIndex + visibleColumns.length + i}`
                    return <td key={key} className="min-w-10" />
                  })}
                </tr>
              ))}

              {/* Goal row */}
              <tr>
                <td
                  colSpan={2}
                  className="border border-base-300 p-2 text-center text-sm"
                >
                  ゴール
                </td>
                <td className="border border-base-300 bg-base-200/50 p-2 text-center font-mono text-xs tabular-nums">
                  {point[1]}
                </td>
                {visibleColumns.map((col) => {
                  const res = getDisplayResult(col)
                  const completed = isCompletedCourse(point, res)
                  return (
                    <td
                      key={`goal-${col.challengeId}-${col.type}`}
                      className={`min-w-10 border border-base-300 p-2 text-center ${
                        completed ? "text-success" : "text-base-content/20"
                      }`}
                    >
                      {completed ? (
                        <Check className="mx-auto size-4" strokeWidth={3} />
                      ) : (
                        ""
                      )}
                    </td>
                  )
                })}
                {Array.from({ length: padCount }, (_, i) => {
                  const key = `pad-g-${startIndex + visibleColumns.length + i}`
                  return <td key={key} className="min-w-10" />
                })}
              </tr>

              {/* Course points row */}
              <tr className="bg-base-200/30">
                <td
                  colSpan={3}
                  className="border border-base-300 bg-base-200 p-2 text-center font-bold text-sm"
                >
                  コースポイント
                </td>
                {visibleColumns.map((col) => {
                  const res = getDisplayResult(col)
                  return (
                    <td
                      key={`pts-${col.challengeId}-${col.type}`}
                      className="min-w-10 border border-base-300 p-2 text-center font-bold font-mono tabular-nums"
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={99}
                          className="input input-xs w-12 text-center font-mono tabular-nums"
                          value={res ?? ""}
                          onChange={(e) =>
                            handleEditChange(col, e.target.value)
                          }
                        />
                      ) : (
                        calcPoint(point, res)
                      )}
                    </td>
                  )
                })}
                {Array.from({ length: padCount }, (_, i) => {
                  const key = `pad-p-${startIndex + visibleColumns.length + i}`
                  return <td key={key} className="min-w-10" />
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex justify-center print:hidden">
            <div className="join">
              <button
                type="button"
                className="join-item btn btn-sm btn-square"
                disabled={currentTab === 0}
                onClick={() => setCurrentTab(currentTab - 1)}
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, i) => {
                const key = `page-${courseId}-${i}`
                return (
                  <input
                    key={key}
                    className="join-item btn btn-sm btn-square"
                    type="radio"
                    name={`tab-${courseId}`}
                    aria-label={(i + 1).toString()}
                    checked={currentTab === i}
                    onChange={() => setCurrentTab(i)}
                  />
                )
              })}
              <button
                type="button"
                className="join-item btn btn-sm btn-square"
                disabled={currentTab === totalPages - 1}
                onClick={() => setCurrentTab(currentTab + 1)}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}

        {/* Edit save/cancel bar */}
        {isEditing && hasEdits && (
          <div className="mt-3 flex justify-end gap-2 print:hidden">
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-xl"
              onClick={() => setEditValues(new Map())}
            >
              キャンセル
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm rounded-xl"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "保存"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
