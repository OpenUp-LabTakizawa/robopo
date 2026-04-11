import { calcPoint } from "@/app/components/challenge/utils"
import { deserializePoint } from "@/app/components/course/utils"
import {
  getCourseById,
  getCourseSummaryByPlayerId,
} from "@/app/lib/db/queries/queries"

// Calculate total score for a course (sum of all attempts)
export async function sumCoursePoint(
  compeId: number,
  playerId: number,
  courseId: number,
): Promise<number> {
  const resultArray = await getCourseSummaryByPlayerId(
    compeId,
    courseId,
    playerId,
  )
  const course = await getCourseById(courseId)
  const pointState = deserializePoint(course?.point || "")

  const sum = resultArray.reduce((sum, result) => {
    let temp: number = calcPoint(pointState, result.results1)
    if (result.results2 !== null) {
      temp += calcPoint(pointState, result.results2)
    }
    return sum + temp
  }, 0)

  return sum
}

// Calculate max score for a course (best single attempt)
export async function maxCoursePoint(
  compeId: number,
  playerId: number,
  courseId: number,
): Promise<number> {
  const resultArray = await getCourseSummaryByPlayerId(
    compeId,
    courseId,
    playerId,
  )
  const course = await getCourseById(courseId)
  const pointState = deserializePoint(course?.point || "")

  let max = 0
  for (const result of resultArray) {
    const p1 = calcPoint(pointState, result.results1)
    const p2 =
      result.results2 !== null ? calcPoint(pointState, result.results2) : 0
    max = Math.max(max, p1, p2)
  }

  return max
}
