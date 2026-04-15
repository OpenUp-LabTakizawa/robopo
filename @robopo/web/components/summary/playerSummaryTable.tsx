"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { DataTableShell } from "@/components/summary/DataTableShell"
import { MultiSortToolbar } from "@/components/summary/MultiSortToolbar"
import { makeOrderLabel, makeSortLabel } from "@/components/summary/sortHelpers"
import { useMultiSort } from "@/hooks/useMultiSort"
import { deserializePoint } from "@/lib/course/point"
import type { PointState } from "@/lib/course/types"
import type { SelectCourse } from "@/lib/db/schema"
import { calcPoint } from "@/lib/scoring/scoring"
import { formatTimestamp, isCompletedCourse } from "@/lib/summary/format"
import type { CourseSummary } from "@/lib/summary/types"

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

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "playerFurigana", label: "ふりがな" },
  { value: "playerBibNumber", label: "ゼッケン" },
  { value: "firstAttemptTime", label: "初挑戦時刻" },
  { value: "firstMaxAttemptTime", label: "完走時刻" },
  { value: "elapsedToComplete", label: "完走経過時間" },
  { value: "lastAttemptTime", label: "最終挑戦時刻" },
  { value: "firstMaxAttemptCount", label: "完走数" },
  { value: "firstAttemptScore", label: "初回得点" },
  { value: "maxResult", label: "最高得点" },
  { value: "averageScore", label: "平均得点" },
  { value: "totalPoint", label: "総得点" },
  { value: "sumPoint", label: "合計得点" },
  { value: "courseOutCount", label: "コースアウト数" },
  { value: "retryCount", label: "リトライ回数" },
  { value: "challengeCount", label: "挑戦回数" },
]

const TIME_SORT_KEYS = new Set<SortKey>([
  "firstAttemptTime",
  "firstMaxAttemptTime",
  "lastAttemptTime",
])

const NAME_SORT_KEYS = new Set<SortKey>(["playerFurigana"])

const getSortLabel = makeSortLabel(SORT_OPTIONS)
const getOrderLabel = makeOrderLabel(NAME_SORT_KEYS, TIME_SORT_KEYS)

type Props = {
  competitionId: number
}

export function PlayerSummaryTable({ competitionId }: Props) {
  const [courses, setCourses] = useState<SelectCourse[]>([])
  const [courseId, setCourseId] = useState<number | null>(null)
  const [pointData, setPointData] = useState<PointState>([])
  const [rawSummary, setRawSummary] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const compareByKey = useCallback(
    (a: CourseSummary, b: CourseSummary, key: SortKey): number => {
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
    },
    [pointData],
  )

  const filtered = (() => {
    if (!searchQuery.trim()) {
      return rawSummary
    }
    const q = searchQuery.trim().toLowerCase()
    return rawSummary.filter(
      (p) =>
        (p.playerName?.toLowerCase().includes(q) ?? false) ||
        (p.playerFurigana?.toLowerCase().includes(q) ?? false) ||
        (p.playerBibNumber?.toLowerCase().includes(q) ?? false),
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
  } = useMultiSort<CourseSummary, SortKey>({
    data: filtered,
    defaultSort: [{ key: "totalPoint", order: "desc" }],
    compareByKey,
    allKeys: SORT_OPTIONS,
  })

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

  const columns = [
    "名前",
    "ふりがな",
    "ゼッケン",
    "初挑戦時刻",
    "完走時刻",
    "完走経過時間",
    "最終挑戦時刻",
    "完走数",
    "初回得点",
    "最高得点",
    "平均得点",
    "総得点",
    "合計得点",
    "コースアウト数",
    "リトライ回数",
    "挑戦回数",
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MultiSortToolbar<SortKey>
        searchPlaceholder="名前・ふりがな・ゼッケン番号で検索"
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
        isTextKey={(key) => key === "playerFurigana"}
        leadingSlot={
          <div className="min-w-[180px] lg:max-w-[220px]">
            <select
              id="player-summary-course"
              aria-label="コース"
              className="select select-bordered w-full"
              value={courseId ?? 0}
              onChange={(e) => setCourseId(Number(e.target.value))}
              disabled={courses.length === 0}
            >
              <option value={0} disabled>
                コースを選択
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <DataTableShell
          columns={columns}
          loading={loading}
          rowCount={filteredAndSorted.length}
          hasSearchQuery={!!searchQuery}
          noMatchMessage="条件に一致する選手が見つかりません"
        >
          {filteredAndSorted.map((player) => (
            <PlayerRow
              key={player.playerId}
              player={player}
              competitionId={competitionId}
              courseId={Number(courseId)}
              pointData={pointData}
            />
          ))}
        </DataTableShell>
      </div>
    </div>
  )
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
