import { deserializeMission, missionStatePair } from "@/lib/course/mission"
import { deserializePoint } from "@/lib/course/point"
import type { MissionValue, PointState } from "@/lib/course/types"
import {
  getChallengeCount,
  getCourseById,
  getCourseSummaryByPlayerId,
  getFirstCount,
  getMaxResult,
} from "@/lib/db/queries/queries"
import {
  DEFAULT_COURSE_OUT_RULE,
  maxPointFromResults,
} from "@/lib/summary/calculations"
import { getCompetitionCourseList } from "@/server/db"

export type CourseData = {
  id: number
  name: string
  missionPair: MissionValue[][]
  point: PointState
  resultArray: {
    id: number
    firstResult: number
    retryResult: number | null
    detail: string | null
  }[]
  firstCount: number | null
  maxResult: number | null
  maxPt: number | null
  challengeCount: number
}

export async function buildCoursesForPlayer(
  competitionId: number,
  playerId: number,
): Promise<{
  courses: CourseData[]
  totalPoint: number
  totalChallengeCount: number
}> {
  const { competitionCourses } = await getCompetitionCourseList(competitionId)

  const courses = await Promise.all(
    competitionCourses.map(async (c) => {
      // The five lookups are independent, so issue them together
      const [
        course,
        resultArray,
        firstCountResult,
        maxResultData,
        challengeCountResult,
      ] = await Promise.all([
        getCourseById(c.id),
        getCourseSummaryByPlayerId(competitionId, c.id, playerId),
        getFirstCount(competitionId, c.id, playerId),
        getMaxResult(competitionId, c.id, playerId),
        getChallengeCount(competitionId, c.id, playerId),
      ])
      const mPair = missionStatePair(deserializeMission(course?.mission || ""))
      const pointState = deserializePoint(course?.point || "")
      // Reuse the rows we already fetched instead of re-querying via maxCoursePoint
      const maxPt = maxPointFromResults(
        resultArray,
        pointState,
        course?.courseOutRule || DEFAULT_COURSE_OUT_RULE,
      )

      return {
        id: c.id,
        name: c.name,
        missionPair: mPair,
        point: pointState,
        resultArray,
        firstCount:
          firstCountResult.length > 0 ? firstCountResult[0].firstCount : null,
        maxResult: maxResultData.length > 0 ? maxResultData[0].maxResult : null,
        maxPt,
        challengeCount: Number(challengeCountResult[0]?.challengeCount ?? 0),
      }
    }),
  )

  const totalPoint = courses.reduce((sum, c) => sum + c.maxPt, 0)
  const totalChallengeCount = courses.reduce(
    (sum, c) => sum + c.challengeCount,
    0,
  )

  return { courses, totalPoint, totalChallengeCount }
}
