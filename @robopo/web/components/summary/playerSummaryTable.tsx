"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DataTableShell } from "@/components/summary/DataTableShell"
import { MultiSortToolbar } from "@/components/summary/MultiSortToolbar"
import {
  buildPlayerRowCells,
  comparePlayerSummary,
  matchesPlayerQuery,
  PLAYER_NAME_SORT_KEYS,
  PLAYER_SORT_OPTIONS,
  PLAYER_TIME_SORT_KEYS,
  type PlayerSortKey,
} from "@/components/summary/playerSummarySort"
import { makeOrderLabel, makeSortLabel } from "@/components/summary/sortHelpers"
import { useMultiSort } from "@/hooks/useMultiSort"
import { deserializePoint } from "@/lib/course/point"
import type { PointState } from "@/lib/course/types"
import type { SelectCourse } from "@/lib/db/schema"
import { formatTimestamp } from "@/lib/summary/format"
import type { CourseSummary } from "@/lib/summary/types"

const getSortLabel = makeSortLabel(PLAYER_SORT_OPTIONS)
const getOrderLabel = makeOrderLabel(
  PLAYER_NAME_SORT_KEYS,
  PLAYER_TIME_SORT_KEYS,
)

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

  const compareByKey = (
    a: CourseSummary,
    b: CourseSummary,
    key: PlayerSortKey,
  ) => comparePlayerSummary(a, b, key, pointData)

  const filtered = rawSummary.filter((p) => matchesPlayerQuery(p, searchQuery))

  const {
    sorted: filteredAndSorted,
    conditions: sortConditions,
    addSort,
    removeSort,
    toggleOrder,
    resetSort,
    availableKeys,
  } = useMultiSort<CourseSummary, PlayerSortKey>({
    data: filtered,
    defaultSort: [{ key: "totalPoint", order: "desc" }],
    compareByKey,
    allKeys: PLAYER_SORT_OPTIONS,
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
          const point = deserializePoint(selectedCourse.point)
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
      <MultiSortToolbar<PlayerSortKey>
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
  const cells = buildPlayerRowCells(player, pointData)

  return (
    <tr className="transition-colors duration-150 hover:bg-primary/5">
      <td className="whitespace-nowrap py-3 font-medium">
        <Link
          href={`/summary/${competitionId}/${courseId}/${player.playerId}`}
          className="text-primary underline-offset-2 hover:underline"
        >
          {cells.name}
        </Link>
      </td>
      <td className="whitespace-nowrap py-3">{cells.furigana}</td>
      <td className="py-3">{cells.bibNumber}</td>
      <td className="whitespace-nowrap py-3">
        {formatTimestamp(player.firstAttemptTime)}
      </td>
      <td className="whitespace-nowrap py-3">
        {formatTimestamp(cells.completionTime)}
      </td>
      <td className="whitespace-nowrap py-3">{cells.elapsedToComplete}</td>
      <td className="whitespace-nowrap py-3">
        {formatTimestamp(player.lastAttemptTime)}
      </td>
      <td className="py-3">{cells.completionCount}</td>
      <td className="py-3">{cells.firstScore}</td>
      <td className="py-3">{cells.maxScore}</td>
      <td className="py-3">{cells.averageScore}</td>
      <td className="py-3 font-medium">{cells.totalPoint}</td>
      <td className="py-3">{cells.sumPoint}</td>
      <td className="py-3">{cells.courseOutCount}</td>
      <td className="py-3">{cells.retryCount}</td>
      <td className="py-3">{player.challengeCount}</td>
    </tr>
  )
}
