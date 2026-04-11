import { calcPoint } from "@/app/components/challenge/utils"
import { deserializePoint } from "@/app/components/course/utils"
import {
  getCourseById,
  getCourseSummaryByPlayerId,
} from "@/app/lib/db/queries/queries"

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

  const sum = resultArray.reduce((sum, result) => {
    let temp: number = calcPoint(pointState, result.firstResult)
    if (result.retryResult !== null) {
      temp += calcPoint(pointState, result.retryResult)
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

  let max = 0
  for (const result of resultArray) {
    const p1 = calcPoint(pointState, result.firstResult)
    const p2 =
      result.retryResult !== null
        ? calcPoint(pointState, result.retryResult)
        : 0
    max = Math.max(max, p1, p2)
  }

  return max
}
