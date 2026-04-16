"use client"

import { ArrowLeft, Printer } from "lucide-react"
import { useRouter } from "next/navigation"
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

type PrintCourseData = {
  id: number
  name: string
  missionPair: MissionValue[][]
  point: PointState
  resultArray: ChallengeResult[]
  firstCount: number | null
  maxResult: number | null
  maxPt: number | null
  challengeCount: number
}

type PrintScoreSheetProps = {
  player: { name: string; furigana: string | null; bibNumber: string | null }
  competitionName: string
  courses: PrintCourseData[]
  totalPoint: number
  totalChallengeCount: number
}

// Flatten challenge attempts into individual columns with stable keys
type AttemptColumn = {
  key: string
  type: "first" | "retry"
  result: number | null
}

function flattenAttempts(
  resultArray: ChallengeResult[],
  courseId: number,
): AttemptColumn[] {
  const columns: AttemptColumn[] = []
  for (const r of resultArray) {
    columns.push({
      key: `${courseId}-${r.id}-first`,
      type: "first",
      result: r.firstResult,
    })
    if (r.retryResult !== null) {
      columns.push({
        key: `${courseId}-${r.id}-retry`,
        type: "retry",
        result: r.retryResult,
      })
    }
  }
  return columns
}

export function PrintScoreSheet({
  player,
  competitionName,
  courses,
  totalPoint,
  totalChallengeCount,
}: PrintScoreSheetProps) {
  const router = useRouter()

  return (
    <>
      {/* Toolbar - hidden when printing */}
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-base-300 border-b bg-base-100 px-4 py-3 shadow-sm print:hidden">
        <button
          type="button"
          className="btn btn-ghost btn-sm rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          戻る
        </button>
        <div className="flex items-center gap-3">
          <span className="text-base-content/50 text-sm">印刷プレビュー</span>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            印刷する
          </button>
        </div>
      </div>

      {/* A4 Sheet */}
      <div className="mx-auto mt-16 mb-8 print:mt-0 print:mb-0">
        <div className="mx-auto box-border min-h-[297mm] w-[210mm] bg-white p-6 shadow-lg print:p-0 print:shadow-none">
          {/* Header */}
          <div className="mb-2 flex items-baseline justify-between border-gray-400 border-b pb-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-gray-500">ゼッケンNo：</span>
              <span className="font-bold text-sm">
                {player.bibNumber ?? "-"}
              </span>
            </div>
            <span className="text-[10px] text-gray-500">{competitionName}</span>
          </div>

          {/* Player info + totals */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <ruby className="font-bold text-base">
                {player.name}
                {player.furigana && (
                  <rt className="font-normal text-[8px] text-gray-400">
                    {player.furigana}
                  </rt>
                )}
              </ruby>
            </div>
            <div className="flex items-center gap-3 text-[9px]">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">試行回数</span>
                <span className="font-bold tabular-nums">
                  {totalChallengeCount}
                </span>
              </div>
              <div className="flex items-center gap-1 border border-gray-800 px-2 py-0.5 font-bold">
                <span>総得点</span>
                <span className="text-sm tabular-nums">{totalPoint}</span>
              </div>
            </div>
          </div>

          {/* Course Tables */}
          {courses.map((course) => (
            <PrintCourseTable key={course.id} course={course} />
          ))}
        </div>
      </div>
    </>
  )
}

// Compact course table for A4 print
function PrintCourseTable({ course }: { course: PrintCourseData }) {
  const columns = flattenAttempts(course.resultArray, course.id)
  const maxCols = 25
  const visibleColumns = columns.slice(0, maxCols)
  const padCount = Math.max(0, maxCols - visibleColumns.length)

  // Pre-generate stable keys for mission rows
  const missionKeys = course.missionPair.map(
    (pair, idx) =>
      `pm-${course.id}-${idx}-${String(pair[0])}-${String(pair[1])}`,
  )

  return (
    <div className="mb-2">
      {/* Course name + max point */}
      <div className="mb-0.5 flex items-center justify-between text-[9px]">
        <span className="font-bold">■ {course.name}</span>
        <div className="flex items-center gap-1 border border-gray-400 px-1.5 py-0.5">
          <span>最高得点</span>
          <span className="font-bold tabular-nums">
            {course.maxPt !== null ? course.maxPt : "-"}
          </span>
        </div>
      </div>

      {/* Table */}
      <table className="w-full table-fixed border-collapse text-[9px]">
        <colgroup>
          <col className="w-[18px]" />
          <col className="w-[72px]" />
          <col className="w-[20px]" />
          {visibleColumns.map((col) => (
            <col key={`col-${col.key}`} />
          ))}
          {Array.from({ length: padCount }, (_, i) => {
            const key = `col-pad-${course.id}-${visibleColumns.length + i}`
            return <col key={key} />
          })}
        </colgroup>
        <thead>
          <tr>
            <th className="border border-gray-400 bg-gray-50 p-0.5 text-center">
              No
            </th>
            <th className="whitespace-nowrap border border-gray-400 bg-gray-50 p-0.5 text-left">
              ミッション
            </th>
            <th className="border border-gray-400 bg-gray-50 p-0.5 text-center">
              点
            </th>
            {visibleColumns.map((col, i) => (
              <th
                key={`h-${col.key}`}
                className="border border-gray-400 bg-gray-50 p-0.5 text-center tabular-nums"
              >
                {i + 1}
              </th>
            ))}
            {Array.from({ length: padCount }, (_, i) => {
              const key = `hp-${course.id}-${visibleColumns.length + i}`
              return (
                <th
                  key={key}
                  className="border border-gray-400 bg-gray-50 p-0.5"
                />
              )
            })}
          </tr>
        </thead>
        <tbody>
          {/* Mission rows */}
          {course.missionPair.map((pair, mIdx) => (
            <tr key={missionKeys[mIdx]}>
              <td className="border border-gray-400 p-0.5 text-center tabular-nums">
                {mIdx + 1}
              </td>
              <td className="whitespace-nowrap border border-gray-400 p-0.5">
                {pair[0] !== null && MissionString[pair[0]]}
                {pair[1] !== null && String(pair[1])}
                {pair[0] !== null && getMissionParameterUnit(pair[0])}
              </td>
              <td className="border border-gray-400 p-0.5 text-center tabular-nums">
                {course.point[mIdx + 2] !== null &&
                  (Array.isArray(course.point[mIdx + 2])
                    ? (course.point[mIdx + 2] as number[])[0]
                    : course.point[mIdx + 2])}
              </td>
              {visibleColumns.map((col) => {
                const done = col.result !== null && col.result > mIdx
                return (
                  <td
                    key={`pc-${col.key}-${missionKeys[mIdx]}`}
                    className="border border-gray-400 p-0.5 text-center"
                  >
                    {done ? "○" : ""}
                  </td>
                )
              })}
              {Array.from({ length: padCount }, (_, i) => {
                const key = `pp-${course.id}-${mIdx}-${visibleColumns.length + i}`
                return <td key={key} className="border border-gray-400 p-0.5" />
              })}
            </tr>
          ))}

          {/* Goal row */}
          <tr>
            <td
              colSpan={2}
              className="border border-gray-400 p-0.5 text-center"
            >
              ゴール
            </td>
            <td className="border border-gray-400 p-0.5 text-center tabular-nums">
              {course.point[1]}
            </td>
            {visibleColumns.map((col) => {
              const done = isCompletedCourse(course.point, col.result)
              return (
                <td
                  key={`pg-${col.key}`}
                  className="border border-gray-400 p-0.5 text-center"
                >
                  {done ? "○" : ""}
                </td>
              )
            })}
            {Array.from({ length: padCount }, (_, i) => {
              const key = `pgp-${course.id}-${visibleColumns.length + i}`
              return <td key={key} className="border border-gray-400 p-0.5" />
            })}
          </tr>

          {/* Course points row */}
          <tr className="bg-gray-50">
            <td
              colSpan={3}
              className="border border-gray-400 bg-gray-100 p-0.5 text-center font-bold"
            >
              コースポイント
            </td>
            {visibleColumns.map((col) => (
              <td
                key={`pts-${col.key}`}
                className="border border-gray-400 p-0.5 text-center font-bold tabular-nums"
              >
                {calcPoint(course.point, col.result)}
              </td>
            ))}
            {Array.from({ length: padCount }, (_, i) => {
              const key = `ppp-${course.id}-${visibleColumns.length + i}`
              return <td key={key} className="border border-gray-400 p-0.5" />
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
