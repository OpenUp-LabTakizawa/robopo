// Sorting and display helpers for the player summary table, kept free of
// React so they can be unit-tested directly.

import type { PointState } from "@/lib/course/types"
import { calcPoint } from "@/lib/scoring/scoring"
import { isCompletedCourse } from "@/lib/summary/format"
import type { CourseSummary } from "@/lib/summary/types"

export type PlayerSortKey =
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

export const PLAYER_SORT_OPTIONS: { value: PlayerSortKey; label: string }[] = [
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

export const PLAYER_TIME_SORT_KEYS = new Set<PlayerSortKey>([
  "firstAttemptTime",
  "firstMaxAttemptTime",
  "lastAttemptTime",
])

export const PLAYER_NAME_SORT_KEYS = new Set<PlayerSortKey>(["playerFurigana"])

// Missing values sort last in ascending order
const LAST = Number.POSITIVE_INFINITY

function timeValue(iso: string | null): number {
  return iso ? Date.parse(iso) : LAST
}

function compareBibNumber(a: string | null, b: string | null): number {
  const aNum = Number(a)
  const bNum = Number(b)
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    return aNum - bNum
  }
  return (a ?? "").localeCompare(b ?? "", "ja", { numeric: true })
}

// Completion-dependent columns only count once the course was completed
function completedTime(row: CourseSummary, pointData: PointState): number {
  return isCompletedCourse(pointData, row.maxResult)
    ? timeValue(row.firstMaxAttemptTime)
    : LAST
}

function completedCount(row: CourseSummary, pointData: PointState): number {
  return isCompletedCourse(pointData, row.maxResult)
    ? (row.firstMaxAttemptCount ?? LAST)
    : LAST
}

type Comparator = (
  a: CourseSummary,
  b: CourseSummary,
  pointData: PointState,
) => number

const SPECIAL_COMPARATORS: Partial<Record<PlayerSortKey, Comparator>> = {
  playerFurigana: (a, b) =>
    (a.playerFurigana ?? "").localeCompare(b.playerFurigana ?? "", "ja"),
  playerBibNumber: (a, b) =>
    compareBibNumber(a.playerBibNumber, b.playerBibNumber),
  firstAttemptTime: (a, b) =>
    timeValue(a.firstAttemptTime) - timeValue(b.firstAttemptTime),
  lastAttemptTime: (a, b) =>
    timeValue(a.lastAttemptTime) - timeValue(b.lastAttemptTime),
  firstMaxAttemptTime: (a, b, p) => completedTime(a, p) - completedTime(b, p),
  elapsedToComplete: (a, b) =>
    (a.elapsedToCompleteSeconds ?? LAST) - (b.elapsedToCompleteSeconds ?? LAST),
  firstMaxAttemptCount: (a, b, p) =>
    completedCount(a, p) - completedCount(b, p),
}

// Compare two summary rows on one sort key. Numeric columns not listed above
// fall back to a plain numeric comparison with null as 0.
export function comparePlayerSummary(
  a: CourseSummary,
  b: CourseSummary,
  key: PlayerSortKey,
  pointData: PointState,
): number {
  const special = SPECIAL_COMPARATORS[key]
  if (special) {
    return special(a, b, pointData)
  }
  return ((a[key] as number) ?? 0) - ((b[key] as number) ?? 0)
}

// Case-insensitive match on name, furigana or bib number
export function matchesPlayerQuery(row: CourseSummary, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) {
    return true
  }
  return [row.playerName, row.playerFurigana, row.playerBibNumber].some(
    (v) => v?.toLowerCase().includes(q) ?? false,
  )
}

// Display strings for one table row; "-" stands in for missing values
export type PlayerRowCells = {
  name: string
  furigana: string
  bibNumber: string
  completionTime: string | null
  elapsedToComplete: string
  completionCount: string
  firstScore: string
  maxScore: string
  averageScore: string
  totalPoint: string
  sumPoint: string
  courseOutCount: number
  retryCount: number
}

function orDash(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "-" : String(value)
}

function scoreOf(pointData: PointState, result: number | null): string {
  return result === null ? "-" : String(calcPoint(pointData, result))
}

export function buildPlayerRowCells(
  player: CourseSummary,
  pointData: PointState,
): PlayerRowCells {
  const completed = isCompletedCourse(pointData, player.maxResult)
  return {
    name: orDash(player.playerName),
    furigana: orDash(player.playerFurigana),
    bibNumber: orDash(player.playerBibNumber),
    completionTime: completed ? player.firstMaxAttemptTime : null,
    elapsedToComplete: completed ? orDash(player.elapsedToComplete) : "-",
    completionCount:
      completed && player.firstMaxAttemptCount
        ? String(player.firstMaxAttemptCount)
        : "-",
    firstScore: scoreOf(pointData, player.firstAttemptScore),
    maxScore: scoreOf(pointData, player.maxResult),
    averageScore: orDash(player.averageScore),
    totalPoint: orDash(player.totalPoint),
    sumPoint: orDash(player.sumPoint),
    courseOutCount: player.courseOutCount ?? 0,
    retryCount: player.retryCount ?? 0,
  }
}
