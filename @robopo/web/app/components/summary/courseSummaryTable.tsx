"use client"

import { useEffect, useState } from "react"
import { DataTableShell } from "@/app/components/summary/DataTableShell"
import { MultiSortToolbar } from "@/app/components/summary/MultiSortToolbar"
import {
  makeOrderLabel,
  makeSortLabel,
} from "@/app/components/summary/sortHelpers"
import { useMultiSort } from "@/app/hooks/useMultiSort"
import { formatTimestamp } from "@/app/lib/summary/format"
import type { CourseCompetitionSummary } from "@/app/lib/summary/types"

type CourseSortKey =
  | "courseName"
  | "firstChallengeTime"
  | "firstCompletionTime"
  | "lastChallengeTime"
  | "challengerCount"
  | "completionCount"
  | "completionRate"
  | "totalChallengeCount"
  | "averageScore"
  | "maxScore"
  | "courseOutCount"
  | "retryCount"

const SORT_OPTIONS: { value: CourseSortKey; label: string }[] = [
  { value: "courseName", label: "コース名" },
  { value: "firstChallengeTime", label: "初挑戦時刻" },
  { value: "firstCompletionTime", label: "初完走時刻" },
  { value: "lastChallengeTime", label: "最終挑戦時刻" },
  { value: "challengerCount", label: "挑戦者数" },
  { value: "completionCount", label: "完走者数" },
  { value: "completionRate", label: "完走率" },
  { value: "totalChallengeCount", label: "総挑戦回数" },
  { value: "averageScore", label: "平均スコア" },
  { value: "maxScore", label: "最高スコア" },
  { value: "courseOutCount", label: "コースアウト数" },
  { value: "retryCount", label: "リトライ数" },
]

const TIME_SORT_KEYS = new Set<CourseSortKey>([
  "firstChallengeTime",
  "firstCompletionTime",
  "lastChallengeTime",
])

const NAME_SORT_KEYS = new Set<CourseSortKey>(["courseName"])

const getSortLabel = makeSortLabel(SORT_OPTIONS)
const getOrderLabel = makeOrderLabel(NAME_SORT_KEYS, TIME_SORT_KEYS)

const compareByKey = (
  a: CourseCompetitionSummary,
  b: CourseCompetitionSummary,
  key: CourseSortKey,
): number => {
  switch (key) {
    case "courseName":
      return (a.courseName ?? "").localeCompare(b.courseName ?? "", "ja")
    case "firstChallengeTime":
    case "firstCompletionTime":
    case "lastChallengeTime": {
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

export function CourseSummaryTable({ competitionId }: Props) {
  const [rawData, setRawData] = useState<CourseCompetitionSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = (() => {
    if (!searchQuery.trim()) {
      return rawData
    }
    const q = searchQuery.trim().toLowerCase()
    return rawData.filter(
      (c) => c.courseName?.toLowerCase().includes(q) ?? false,
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
  } = useMultiSort<CourseCompetitionSummary, CourseSortKey>({
    data: filtered,
    defaultSort: [{ key: "challengerCount", order: "desc" }],
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
        const res = await fetch(`/api/summary/course-list/${competitionId}`, {
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
    "コース名",
    "初挑戦時刻",
    "初完走時刻",
    "最終挑戦時刻",
    "挑戦者数",
    "完走者数",
    "完走率",
    "総挑戦回数",
    "平均スコア",
    "最高スコア",
    "コースアウト数",
    "リトライ数",
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MultiSortToolbar<CourseSortKey>
        searchPlaceholder="コース名で検索"
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
        isTextKey={(key) => key === "courseName"}
      />

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <DataTableShell
          columns={columns}
          loading={loading}
          rowCount={filteredAndSorted.length}
          hasSearchQuery={!!searchQuery}
          noMatchMessage="条件に一致するコースが見つかりません"
        >
          {filteredAndSorted.map((course) => (
            <tr
              key={course.courseId}
              className="transition-colors duration-150 hover:bg-primary/5"
            >
              <td className="py-3">{course.courseId}</td>
              <td className="whitespace-nowrap py-3 font-medium">
                {course.courseName}
              </td>
              <td className="whitespace-nowrap py-3">
                {formatTimestamp(course.firstChallengeTime)}
              </td>
              <td className="whitespace-nowrap py-3">
                {formatTimestamp(course.firstCompletionTime)}
              </td>
              <td className="whitespace-nowrap py-3">
                {formatTimestamp(course.lastChallengeTime)}
              </td>
              <td className="py-3">{course.challengerCount}</td>
              <td className="py-3">{course.completionCount}</td>
              <td className="py-3">
                {course.completionRate !== null
                  ? `${course.completionRate}%`
                  : "-"}
              </td>
              <td className="py-3">{course.totalChallengeCount}</td>
              <td className="py-3">{course.averageScore ?? "-"}</td>
              <td className="py-3">{course.maxScore ?? "-"}</td>
              <td className="py-3">{course.courseOutCount}</td>
              <td className="py-3">{course.retryCount}</td>
            </tr>
          ))}
        </DataTableShell>
      </div>
    </div>
  )
}
