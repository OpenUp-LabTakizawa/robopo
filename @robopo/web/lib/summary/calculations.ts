import { deserializePoint } from "@/lib/course/point"
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

// Apply course-out penalty to a score based on the rule and detail
function applyPenalty(
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

// Calculate total score for a course (sum of all attempts)
export async function sumCoursePoint(
  competitionId: number,
  playerId: number,
  courseId: number,
): Promise<number> {
  const resultArray = await getCourseSummaryByPlayerId(
    competitionId,
    courseId,
    playerId,
  )
  const course = await getCourseById(courseId)
  const pointState = deserializePoint(course?.point || "")
  const courseOutRule = course?.courseOutRule || "keep"

  const sum = resultArray.reduce((sum, result) => {
    let p1 = calcPoint(pointState, result.firstResult)
    p1 = applyPenalty(p1, courseOutRule, result.detail, "first")
    let temp = p1
    if (result.retryResult !== null) {
      let p2 = calcPoint(pointState, result.retryResult)
      p2 = applyPenalty(p2, courseOutRule, result.detail, "retry")
      temp += p2
    }
    return sum + temp
  }, 0)

  return sum
}

// Calculate max score for a course (best single attempt)
export async function maxCoursePoint(
  competitionId: number,
  playerId: number,
  courseId: number,
): Promise<number> {
  const resultArray = await getCourseSummaryByPlayerId(
    competitionId,
    courseId,
    playerId,
  )
  const course = await getCourseById(courseId)
  const pointState = deserializePoint(course?.point || "")
  const courseOutRule = course?.courseOutRule || "keep"

  let max = 0
  for (const result of resultArray) {
    let p1 = calcPoint(pointState, result.firstResult)
    p1 = applyPenalty(p1, courseOutRule, result.detail, "first")
    let p2 = 0
    if (result.retryResult !== null) {
      p2 = calcPoint(pointState, result.retryResult)
      p2 = applyPenalty(p2, courseOutRule, result.detail, "retry")
    }
    max = Math.max(max, p1, p2)
  }

  return max
}
