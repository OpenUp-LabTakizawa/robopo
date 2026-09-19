import { deserializePoint } from "@/lib/course/point"
import type { PointState } from "@/lib/course/types"
import {
  getCourseById,
  getCourseSummaryByPlayerId,
} from "@/lib/db/queries/queries"
import {
  applyCourseOutRule,
  COURSE_OUT_FIRST,
  COURSE_OUT_RETRY,
  parseCourseOutRule,
} from "@/lib/scoring/course-out"
import { calcPoint } from "@/lib/scoring/scoring"

// The subset of a challenge row the point calculations need
export type ChallengeResult = {
  firstResult: number
  retryResult: number | null
  detail: string | null
}

export const DEFAULT_COURSE_OUT_RULE = "keep"

// Apply course-out penalty to a score based on the rule and detail
export function applyPenalty(
  score: number,
  courseOutRule: string,
  detail: string | null,
  attempt: "first" | "retry",
): number {
  if (!detail) {
    return score
  }
  const isCourseOut =
    (attempt === "first" && detail === COURSE_OUT_FIRST) ||
    (attempt === "retry" && detail === COURSE_OUT_RETRY)
  if (!isCourseOut) {
    return score
  }
  return applyCourseOutRule(score, parseCourseOutRule(courseOutRule))
}

// Points for the first and retry attempts of one challenge row
// (retry is null when the row has no retry)
export function attemptPoints(
  result: ChallengeResult,
  pointState: PointState,
  courseOutRule: string,
): { first: number; retry: number | null } {
  const first = applyPenalty(
    calcPoint(pointState, result.firstResult),
    courseOutRule,
    result.detail,
    "first",
  )
  const retry =
    result.retryResult === null
      ? null
      : applyPenalty(
          calcPoint(pointState, result.retryResult),
          courseOutRule,
          result.detail,
          "retry",
        )
  return { first, retry }
}

// Total score across all attempts (pure)
export function sumPointsFromResults(
  results: readonly ChallengeResult[],
  pointState: PointState,
  courseOutRule: string,
): number {
  return results.reduce((sum, result) => {
    const { first, retry } = attemptPoints(result, pointState, courseOutRule)
    return sum + first + (retry ?? 0)
  }, 0)
}

// Best single attempt score, never below 0 (pure)
export function maxPointFromResults(
  results: readonly ChallengeResult[],
  pointState: PointState,
  courseOutRule: string,
): number {
  let max = 0
  for (const result of results) {
    const { first, retry } = attemptPoints(result, pointState, courseOutRule)
    max = Math.max(max, first, retry ?? 0)
  }
  return max
}

async function loadCourseResults(
  competitionId: number,
  playerId: number,
  courseId: number,
) {
  const [results, course] = await Promise.all([
    getCourseSummaryByPlayerId(competitionId, courseId, playerId),
    getCourseById(courseId),
  ])
  return {
    results,
    pointState: deserializePoint(course?.point || ""),
    courseOutRule: course?.courseOutRule || DEFAULT_COURSE_OUT_RULE,
  }
}

// Calculate total score for a course (sum of all attempts)
export async function sumCoursePoint(
  competitionId: number,
  playerId: number,
  courseId: number,
): Promise<number> {
  const { results, pointState, courseOutRule } = await loadCourseResults(
    competitionId,
    playerId,
    courseId,
  )
  return sumPointsFromResults(results, pointState, courseOutRule)
}

// Calculate max score for a course (best single attempt)
export async function maxCoursePoint(
  competitionId: number,
  playerId: number,
  courseId: number,
): Promise<number> {
  const { results, pointState, courseOutRule } = await loadCourseResults(
    competitionId,
    playerId,
    courseId,
  )
  return maxPointFromResults(results, pointState, courseOutRule)
}
