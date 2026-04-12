"use client"

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { calcPoint } from "@/app/components/challenge/utils"
import {
  deserializePoint,
  type PointState,
} from "@/app/components/course/utils"
import {
  type CourseSummary,
  isCompletedCourse,
} from "@/app/components/summary/utils"
import type { SelectCompetition, SelectCourse } from "@/app/lib/db/schema"

type SortKey =
  | "playerFurigana"
  | "playerBibNumber"
  | "firstAttemptTime"
  | "firstMaxAttemptTime"
  | "elapsedToComplete"
  | "lastAttemptTime"
  | "firstMaxAttemptCount"
  | "firstAttemptScore"
  | "maxResult"
  | "averageScore"
  | "totalPoint"
  | "sumPoint"
  | "courseOutCount"
  | "retryCount"
  | "challengeCount"

type SortCondition = {
  key: SortKey
  order: "asc" | "desc"
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "playerFurigana", label: "ふりがな" },
  { value: "playerBibNumber", label: "ゼッケン" },
  { value: "firstAttemptTime", label: "初試行時刻" },
  { value: "firstMaxAttemptTime", label: "完走時刻" },
  { value: "elapsedToComplete", label: "完走経過時間" },
  { value: "lastAttemptTime", label: "最終試行時刻" },
  { value: "firstMaxAttemptCount", label: "完走数" },
  { value: "firstAttemptScore", label: "初回得点" },
  { value: "maxResult", label: "最高得点" },
  { value: "averageScore", label: "平均得点" },
  { value: "totalPoint", label: "総得点" },
  { value: "sumPoint", label: "合計得点" },
  { value: "courseOutCount", label: "コースアウト数" },
  { value: "retryCount", label: "リトライ回数" },
  { value: "challengeCount", label: "試行回数" },
]

const TIME_SORT_KEYS = new Set<SortKey>([
  "firstAttemptTime",
  "firstMaxAttemptTime",
  "lastAttemptTime",
])

function getSortLabel(key: SortKey): string {
  return SORT_OPTIONS.find((o) => o.value === key)?.label ?? key
}

function getOrderLabel(key: SortKey, order: "asc" | "desc"): string {
  if (key === "playerFurigana") {
    return order === "desc" ? "Z→A" : "A→Z"
  }
  if (TIME_SORT_KEYS.has(key)) {
    return order === "desc" ? "新しい順" : "古い順"
  }
  return order === "desc" ? "大きい順" : "小さい順"
}

function compareBySortKey(
  a: CourseSummary,
  b: CourseSummary,
  key: SortKey,
  pointData: PointState,
): number {
  switch (key) {
    case "playerFurigana":
      return (a.playerFurigana ?? "").localeCompare(
        b.playerFurigana ?? "",
        "ja",
      )
    case "playerBibNumber": {
      const aNum = Number(a.playerBibNumber)
      const bNum = Number(b.playerBibNumber)
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return aNum - bNum
      }
      return (a.playerBibNumber ?? "").localeCompare(
        b.playerBibNumber ?? "",
        "ja",
        { numeric: true },
      )
    }
    case "firstAttemptTime":
    case "lastAttemptTime": {
      const aTime = a[key] ? Date.parse(a[key] as string) : Infinity
      const bTime = b[key] ? Date.parse(b[key] as string) : Infinity
      return aTime - bTime
    }
    case "firstMaxAttemptTime": {
      const aC = isCompletedCourse(pointData, a.maxResult)
      const bC = isCompletedCourse(pointData, b.maxResult)
      const aT =
        aC && a.firstMaxAttemptTime
          ? Date.parse(a.firstMaxAttemptTime)
          : Infinity
      const bT =
        bC && b.firstMaxAttemptTime
          ? Date.parse(b.firstMaxAttemptTime)
          : Infinity
      return aT - bT
    }
    case "elapsedToComplete": {
      const aV = a.elapsedToCompleteSeconds ?? Infinity
      const bV = b.elapsedToCompleteSeconds ?? Infinity
      return aV - bV
    }
    case "firstMaxAttemptCount": {
      const aC = isCompletedCourse(pointData, a.maxResult)
      const bC = isCompletedCourse(pointData, b.maxResult)
      const aV = aC ? (a.firstMaxAttemptCount ?? Infinity) : Infinity
      const bV = bC ? (b.firstMaxAttemptCount ?? Infinity) : Infinity
      return aV - bV
    }
    default: {
      const aV = (a[key] as number) ?? 0
      const bV = (b[key] as number) ?? 0
      return aV - bV
    }
  }
}

type Props = {
  competitions: SelectCompetition[]
  defaultCompetitionId: number | null
}

export function SummaryView({ competitions, defaultCompetitionId }: Props) {
  const [competitionId, setCompetitionId] = useState<number>(
    defaultCompetitionId ?? 0,
  )
  const [courses, setCourses] = useState<SelectCourse[]>([])
  const [courseId, setCourseId] = useState<number | null>(null)
  const [pointData, setPointData] = useState<PointState>([])
  const [rawSummary, setRawSummary] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Multi-sort: array of conditions, first = highest priority
  const [sortConditions, setSortConditions] = useState<SortCondition[]>([
    { key: "totalPoint", order: "desc" },
  ])

  // Available keys not yet used in sort conditions
  const availableKeys = useMemo(
    () =>
      SORT_OPTIONS.filter(
        (opt) => !sortConditions.some((sc) => sc.key === opt.value),
      ),
    [sortConditions],
  )

  const addSort = useCallback(
    (key: SortKey) => {
      if (sortConditions.some((sc) => sc.key === key)) {
        return
      }
      setSortConditions((prev) => [...prev, { key, order: "desc" }])
    },
    [sortConditions],
  )

  const removeSort = useCallback((index: number) => {
    setSortConditions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const toggleOrder = useCallback((index: number) => {
    setSortConditions((prev) =>
      prev.map((sc, i) =>
        i === index
          ? { ...sc, order: sc.order === "asc" ? "desc" : "asc" }
          : sc,
      ),
    )
  }, [])

  // Fetch courses when competition changes
  useEffect(() => {
    if (!competitionId) {
      setCourses([])
      setCourseId(null)
      return
    }
    async function fetchCourses() {
      try {
        const res = await fetch(`/api/competition/${competitionId}/courses`, {
          cache: "no-store",
        })
        if (res.ok) {
          const data: SelectCourse[] = await res.json()
          setCourses(data)
          if (data.length > 0) {
            const minId = data.reduce((min, c) => (c.id < min.id ? c : min)).id
            setCourseId(minId)
          } else {
            setCourseId(null)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchCourses()
  }, [competitionId])

  // Fetch summary data when course changes
  useEffect(() => {
    if (!competitionId || !courseId) {
      setRawSummary([])
      return
    }
    async function fetchData() {
      setLoading(true)
      try {
        const selectedCourse = courses.find((c) => c.id === courseId)
        if (selectedCourse) {
          const point = await deserializePoint(selectedCourse.point)
          setPointData(point)
        }

        const res = await fetch(`/api/summary/${competitionId}/${courseId}`, {
          cache: "no-store",
        })
        const data = await res.json()
        setRawSummary(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [competitionId, courseId, courses])

  const filteredAndSorted = useMemo(() => {
    let list = rawSummary

    // Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (p) =>
          (p.playerName?.toLowerCase().includes(q) ?? false) ||
          (p.playerFurigana?.toLowerCase().includes(q) ?? false) ||
          (p.playerBibNumber?.toLowerCase().includes(q) ?? false),
      )
    }

    // Multi-sort: iterate conditions from highest priority
    return [...list].sort((a, b) => {
      for (const { key, order } of sortConditions) {
        const cmp = compareBySortKey(a, b, key, pointData)
        if (cmp !== 0) {
          return order === "asc" ? cmp : -cmp
        }
      }
      return 0
    })
  }, [rawSummary, searchQuery, sortConditions, pointData])

  const columns = [
    "名前",
    "ふりがな",
    "ゼッケン",
    "初試行時刻",
    "完走時刻",
    "完走経過時間",
    "最終試行時刻",
    "完走数",
    "初回得点",
    "最高得点",
    "平均得点",
    "総得点",
    "合計得点",
    "コースアウト数",
    "リトライ回数",
    "試行回数",
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Competition & Course selectors */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="summary-competition"
              className="mb-1 block font-semibold text-base-content/60 text-xs uppercase tracking-wider"
            >
              大会
            </label>
            <select
              id="summary-competition"
              className="select select-bordered w-full"
              value={competitionId}
              onChange={(e) => setCompetitionId(Number(e.target.value))}
            >
              <option value={0} disabled>
                大会を選んでください
              </option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="summary-course"
              className="mb-1 block font-semibold text-base-content/60 text-xs uppercase tracking-wider"
            >
              コース
            </label>
            <select
              id="summary-course"
              className="select select-bordered w-full"
              value={courseId ?? 0}
              onChange={(e) => setCourseId(Number(e.target.value))}
              disabled={courses.length === 0}
            >
              <option value={0} disabled>
                コースを選んでください
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search & Multi-sort bar */}
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
        <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-base-content/40" />
          <input
            type="text"
            placeholder="名前・ふりがな・ゼッケン番号で検索"
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>

        {/* Sort chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-base-content/40 text-xs">ソート:</span>
          {sortConditions.map((sc, index) => (
            <div
              key={sc.key}
              className="flex items-center gap-1 rounded-lg border border-base-300 bg-base-100 px-2 py-1 shadow-sm"
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                {index + 1}
              </span>
              <span className="font-medium text-xs">
                {getSortLabel(sc.key)}
              </span>
              <button
                type="button"
                className="flex items-center gap-0.5 rounded-md bg-base-200/60 px-1.5 py-0.5 text-xs transition-colors hover:bg-base-300/60"
                onClick={() => toggleOrder(index)}
              >
                {sc.order === "desc" ? (
                  <BarsArrowDownIcon className="size-3" />
                ) : (
                  <BarsArrowUpIcon className="size-3" />
                )}
                {getOrderLabel(sc.key, sc.order)}
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-full p-0.5 text-base-content/40 transition-colors hover:bg-error/10 hover:text-error"
                onClick={() => removeSort(index)}
                aria-label={`${getSortLabel(sc.key)}のソートを削除`}
              >
                <XMarkIcon className="size-3.5" />
              </button>
            </div>
          ))}

          {/* Add sort button */}
          {availableKeys.length > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-base-200/50 px-1.5 py-1">
              <PlusIcon className="size-3.5 shrink-0 text-base-content/40" />
              <select
                className="select select-ghost select-xs bg-transparent font-medium text-base-content/60 focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addSort(e.target.value as SortKey)
                    e.target.value = ""
                  }
                }}
              >
                <option value="" disabled>
                  追加
                </option>
                {availableKeys.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear all */}
          {sortConditions.length > 1 && (
            <button
              type="button"
              className="text-base-content/40 text-xs transition-colors hover:text-error"
              onClick={() =>
                setSortConditions([{ key: "totalPoint", order: "desc" }])
              }
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        {competitionId === 0 ? (
          <div className="py-12 text-center text-base-content/40">
            大会を選択してください
          </div>
        ) : searchQuery && filteredAndSorted.length === 0 ? (
          <div className="py-8 text-center text-base-content/40">
            条件に一致する選手が見つかりません
          </div>
        ) : (
          <div className="m-3 min-h-0 overflow-x-auto overflow-y-auto rounded-xl border border-base-300/50">
            <table className="table-pin-rows table-zebra table">
              <thead>
                <tr className="border-base-300/50 border-b bg-base-200/60">
                  {columns.map((label) => (
                    <th
                      key={label}
                      className="whitespace-nowrap py-3 font-semibold text-base-content/50 text-xs uppercase tracking-wider"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center">
                      <span className="loading loading-spinner text-primary" />
                    </td>
                  </tr>
                ) : filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((player) => (
                    <PlayerRow
                      key={player.playerId}
                      player={player}
                      competitionId={competitionId}
                      courseId={Number(courseId)}
                      pointData={pointData}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-12 text-center text-base-content/40"
                    >
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimestamp(iso: string | null): string {
  if (!iso) {
    return "-"
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return "-"
  }
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function PlayerRow({
  player,
  competitionId,
  courseId,
  pointData,
}: {
  player: CourseSummary
  competitionId: number
  courseId: number
  pointData: PointState
}) {
  const completed = isCompletedCourse(pointData, player.maxResult)
  const maxScore =
    player.maxResult || player.maxResult === 0
      ? calcPoint(pointData, player.maxResult)
      : null
  const firstScore =
    player.firstAttemptScore !== null
      ? calcPoint(pointData, player.firstAttemptScore)
      : null

  return (
    <tr className="transition-colors duration-150 hover:bg-primary/5">
      <td className="whitespace-nowrap py-3 font-medium">
        <Link
          href={`/summary/${competitionId}/${courseId}/${player.playerId}`}
          className="text-primary underline-offset-2 hover:underline"
        >
          {player.playerName ?? "-"}
        </Link>
      </td>
      <td className="whitespace-nowrap py-3">{player.playerFurigana ?? "-"}</td>
      <td className="py-3">{player.playerBibNumber ?? "-"}</td>
      <td className="whitespace-nowrap py-3">
        {formatTimestamp(player.firstAttemptTime)}
      </td>
      <td className="whitespace-nowrap py-3">
        {completed ? formatTimestamp(player.firstMaxAttemptTime) : "-"}
      </td>
      <td className="whitespace-nowrap py-3">
        {completed ? (player.elapsedToComplete ?? "-") : "-"}
      </td>
      <td className="whitespace-nowrap py-3">
        {formatTimestamp(player.lastAttemptTime)}
      </td>
      <td className="py-3">
        {completed && player.firstMaxAttemptCount
          ? player.firstMaxAttemptCount
          : "-"}
      </td>
      <td className="py-3">{firstScore !== null ? firstScore : "-"}</td>
      <td className="py-3">{maxScore !== null ? maxScore : "-"}</td>
      <td className="py-3">{player.averageScore ?? "-"}</td>
      <td className="py-3 font-medium">{player.totalPoint ?? "-"}</td>
      <td className="py-3">{player.sumPoint ?? "-"}</td>
      <td className="py-3">{player.courseOutCount ?? 0}</td>
      <td className="py-3">{player.retryCount ?? 0}</td>
      <td className="py-3">{player.challengeCount}</td>
    </tr>
  )
}
