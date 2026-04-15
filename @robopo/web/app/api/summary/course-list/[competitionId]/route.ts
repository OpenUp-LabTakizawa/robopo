import { sql } from "drizzle-orm"
import { deserializePoint } from "@/lib/course/point"
import { db } from "@/lib/db/db"
import {
  getCourseById,
  getCourseSummaryByCompetition,
} from "@/lib/db/queries/queries"
import { calcPoint } from "@/lib/scoring/scoring"
import { isCompletedCourse } from "@/lib/summary/format"
import type { CourseCompetitionSummary } from "@/lib/summary/types"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await params
  const competitionIdNum = Number(competitionId)

  const courseSummaryRaw = await getCourseSummaryByCompetition(competitionIdNum)

  if (courseSummaryRaw.length === 0) {
    return Response.json([])
  }

  // Batch: preload all course data and point states
  const courseIds = courseSummaryRaw.map((row) => row.courseId)
  const courseDataList = await Promise.all(
    courseIds.map((id) => getCourseById(id)),
  )
  const pointStateMap = new Map<
    number,
    Awaited<ReturnType<typeof deserializePoint>>
  >()
  for (let i = 0; i < courseIds.length; i++) {
    const pointState = await deserializePoint(courseDataList[i]?.point || "")
    pointStateMap.set(courseIds[i], pointState)
  }

  // Batch: get per-player max results for ALL courses in one query
  const playerMaxResultsAll = await db.execute(sql`
    SELECT
      c.course_id AS "courseId",
      c.player_id AS "playerId",
      MAX(GREATEST(c.first_result, COALESCE(c.retry_result, 0)))::int AS "maxResult",
      TO_CHAR(
        MIN(
          CASE WHEN GREATEST(c.first_result, COALESCE(c.retry_result, 0)) = (
            SELECT MAX(GREATEST(c2.first_result, COALESCE(c2.retry_result, 0)))
            FROM challenge c2
            WHERE c2.player_id = c.player_id
              AND c2.course_id = c.course_id
              AND c2.competition_id = ${competitionIdNum}
          ) THEN c.created_at ELSE NULL END
        ) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo',
        'YYYY-MM-DD"T"HH24:MI:SS"+09:00"'
      ) AS "firstMaxTime"
    FROM challenge c
    WHERE c.competition_id = ${competitionIdNum}
      AND c.course_id = ANY(${sql`ARRAY[${sql.join(
        courseIds.map((id) => sql`${id}::int`),
        sql`, `,
      )}]`})
    GROUP BY c.course_id, c.player_id
  `)

  // Group by courseId
  const playerMaxByCourse = new Map<
    number,
    { playerId: number; maxResult: number; firstMaxTime: string | null }[]
  >()
  for (const row of playerMaxResultsAll.rows as {
    courseId: number
    playerId: number
    maxResult: number
    firstMaxTime: string | null
  }[]) {
    let list = playerMaxByCourse.get(row.courseId)
    if (!list) {
      list = []
      playerMaxByCourse.set(row.courseId, list)
    }
    list.push({
      playerId: row.playerId,
      maxResult: row.maxResult,
      firstMaxTime: row.firstMaxTime,
    })
  }

  const result: CourseCompetitionSummary[] = courseSummaryRaw.map((row) => {
    const pointState = pointStateMap.get(row.courseId) ?? []
    const playerMaxResults = playerMaxByCourse.get(row.courseId) ?? []

    let completionCount = 0
    let firstCompletionTime: string | null = null

    for (const pr of playerMaxResults) {
      if (isCompletedCourse(pointState, pr.maxResult)) {
        completionCount++
        if (
          pr.firstMaxTime &&
          (!firstCompletionTime || pr.firstMaxTime < firstCompletionTime)
        ) {
          firstCompletionTime = pr.firstMaxTime
        }
      }
    }

    const completionRate =
      row.challengerCount > 0
        ? Math.round((completionCount / row.challengerCount) * 1000) / 10
        : null

    const averageScore =
      row.averageRawScore !== null
        ? Math.round(
            calcPoint(pointState, Math.round(row.averageRawScore)) * 10,
          ) / 10
        : null

    const maxScore =
      row.maxRawScore !== null ? calcPoint(pointState, row.maxRawScore) : null

    return {
      courseId: row.courseId,
      courseName: row.courseName,
      firstChallengeTime: row.firstChallengeTime,
      firstCompletionTime,
      lastChallengeTime: row.lastChallengeTime,
      challengerCount: row.challengerCount,
      completionCount,
      completionRate,
      totalChallengeCount: row.totalChallengeCount,
      averageScore,
      maxScore,
      courseOutCount: row.courseOutCount,
      retryCount: row.retryCount,
    }
  })

  return Response.json(result)
}
