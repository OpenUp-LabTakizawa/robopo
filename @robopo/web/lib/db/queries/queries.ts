import { and, eq, inArray, ne, type SQLWrapper, sql } from "drizzle-orm"
import { db } from "@/lib/db/db"
import {
  challenge,
  competition,
  competitionCourse,
  competitionJudge,
  competitionPlayer,
  course,
  judge,
  player,
  type SelectCompetitionWithCourse,
  type SelectCourse,
  type SelectCourseWithCompetition,
  type SelectJudgeWithCompetition,
  type SelectPlayerWithCompetition,
  session,
  user,
} from "@/lib/db/schema"
import type { CourseSummary, JudgeSummary } from "@/lib/summary/types"

// Check if a course name already exists (optionally excluding a specific course ID)
export async function getCourseByName(
  name: string,
  excludeId?: number,
): Promise<{ id: number } | null> {
  const conditions = [eq(course.name, name)]
  if (excludeId) {
    conditions.push(ne(course.id, excludeId))
  }
  const result = await db
    .select({ id: course.id })
    .from(course)
    .where(and(...conditions))
    .limit(1)
  return result.length > 0 ? result[0] : null
}

// Delete course from DB by ID
// Consider moving to @/lib/db/queries/delete.ts
export async function deleteCourseById(id: number) {
  return await db
    .delete(course)
    .where(eq(course.id, id))
    .returning({ deletedId: course.id })
}

// Get course by ID
export async function getCourseById(id: number): Promise<SelectCourse | null> {
  const result = await db
    .select()
    .from(course)
    .where(eq(course.id, id))
    .limit(1)

  return result.length > 0 ? result[0] : null
}

// Delete player from DB by ID
export async function deletePlayerById(id: number) {
  return await db
    .delete(player)
    .where(eq(player.id, id))
    .returning({ deletedId: player.id })
}

// Get player by QR code
// Get player by ID
export async function getPlayerById(id: number) {
  const result = await db
    .select()
    .from(player)
    .where(eq(player.id, id))
    .limit(1)
  return result.length > 0 ? result[0] : null
}

// Delete challenge from DB by ID
export async function deleteChallengeById(id: number) {
  return await db
    .delete(challenge)
    .where(eq(challenge.id, id))
    .returning({ deletedId: challenge.id })
}

// Delete judge from DB by ID
export async function deleteJudgeById(id: number) {
  return await db
    .delete(judge)
    .where(eq(judge.id, id))
    .returning({ deletedId: judge.id })
}

// Delete competition from DB by ID
export async function deleteCompetitionById(id: number) {
  return await db
    .delete(competition)
    .where(eq(competition.id, id))
    .returning({ deletedId: competition.id })
}

// Get competition by ID
export const getCompetitionById = async (id: number) => {
  const result = await db
    .select()
    .from(competition)
    .where(eq(competition.id, id))
    .limit(1)
  return result.length > 0 ? result[0] : null
}

// SQL helper: subquery for count of attempts until the max result is achieved
function firstCountSubquery(
  playerIdRef: SQLWrapper,
  competitionId: number,
  courseId: number,
) {
  return sql`
    (SELECT SUM(attempts_up_to_max) FROM (
      SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
      GREATEST(first_result, COALESCE(retry_result, 0)) AS result,
      CASE WHEN first_result IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN retry_result IS NOT NULL THEN 1 ELSE 0 END AS attempts_up_to_max
      FROM challenge
      WHERE player_id = ${playerIdRef}
      AND course_id = ${courseId}
      AND (first_result IS NOT NULL OR retry_result IS NOT NULL)
    ) AS RankedAttempts
      WHERE attempt_number <= (
        SELECT MIN(attempt_number)
        FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
          GREATEST(first_result, COALESCE(retry_result, 0)) AS result
          FROM challenge
          WHERE player_id = ${playerIdRef}
          AND course_id = ${courseId}
          AND competition_id = ${competitionId}
        ) AS Attempts
        WHERE result = (
          SELECT MAX(GREATEST(first_result, COALESCE(retry_result, 0)))
          FROM challenge
          WHERE player_id = ${playerIdRef}
          AND course_id = ${courseId}
          AND competition_id = ${competitionId}
        )
      )
    )`
}

// SQL helper: subquery for the time when the max result was first achieved
function firstTimeSubquery(
  playerIdRef: SQLWrapper,
  competitionId: number,
  courseId: number,
) {
  return sql`
    (
      SELECT TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') FROM (
        SELECT
          ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
          created_at,
          GREATEST(first_result, COALESCE(retry_result, 0)) AS result
        FROM challenge
        WHERE
          player_id = ${playerIdRef}
          AND course_id = ${courseId}
          AND (first_result IS NOT NULL OR retry_result IS NOT NULL)
      ) AS RankedAttemptsWithDate
      WHERE attempt_number = (
        SELECT MIN(attempt_number) FROM (
          SELECT
            ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
            GREATEST(first_result, COALESCE(retry_result, 0)) AS result
          FROM challenge
          WHERE
            player_id = ${playerIdRef}
            AND course_id = ${courseId}
            AND competition_id = ${competitionId}
        ) AS Attempts
        WHERE result = (
          SELECT MAX(GREATEST(first_result, COALESCE(retry_result, 0)))
          FROM challenge
          WHERE
            player_id = ${playerIdRef}
            AND course_id = ${courseId}
            AND competition_id = ${competitionId}
        )
      )
    )
  `
}

// SQL helper: timestamp of the very first challenge attempt for a player in a competition
function firstAttemptTimeSubquery(
  playerIdRef: SQLWrapper,
  competitionId: number,
) {
  return sql`
    (
      SELECT TO_CHAR(MIN(created_at) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"')
      FROM challenge
      WHERE
        player_id = ${playerIdRef}
        AND competition_id = ${competitionId}
    )
  `
}

// SQL helper: timestamp of the last challenge attempt for a player in a competition (specific course)
function lastAttemptTimeSubquery(
  playerIdRef: SQLWrapper,
  competitionId: number,
  courseId: number,
) {
  return sql`
    (
      SELECT TO_CHAR(MAX(created_at) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"')
      FROM challenge
      WHERE
        player_id = ${playerIdRef}
        AND competition_id = ${competitionId}
        AND course_id = ${courseId}
    )
  `
}

// SQL helper: score of the very first challenge attempt (best of first/retry) for a player in a specific course
function firstAttemptScoreSubquery(
  playerIdRef: SQLWrapper,
  competitionId: number,
  courseId: number,
) {
  return sql`
    (
      SELECT GREATEST(first_result, COALESCE(retry_result, 0))
      FROM challenge
      WHERE
        player_id = ${playerIdRef}
        AND competition_id = ${competitionId}
        AND course_id = ${courseId}
      ORDER BY created_at ASC, id ASC
      LIMIT 1
    )
  `
}

// SQL helper: count of course-out events for a player in a specific course
function courseOutCountExpr(courseId: number) {
  return sql`SUM(CASE WHEN ${challenge.courseId} = ${courseId} THEN
    (CASE WHEN ${challenge.detail} = 'courseOut:first' THEN 1 ELSE 0 END)
    + (CASE WHEN ${challenge.detail} = 'courseOut:retry' THEN 1 ELSE 0 END)
    ELSE 0 END)`
}

// SQL helper: count of retry attempts (retryResult IS NOT NULL) for a specific course
function retryCountExpr(courseId: number) {
  return sql`SUM(CASE WHEN ${challenge.courseId} = ${courseId} AND ${challenge.retryResult} IS NOT NULL THEN 1 ELSE 0 END)`
}

// SQL helper: max result across firstResult and retryResult for a specific course
function maxResultExpr(courseIdExpr: number | ReturnType<typeof sql>) {
  return sql`MAX(CASE WHEN ${challenge.courseId} = ${courseIdExpr} THEN GREATEST(${challenge.firstResult}, COALESCE(${challenge.retryResult}, 0)) ELSE NULL END)`
}

// SQL helper: attempt count (counting retries as 2) for a specific course
function attemptCountExpr(courseId: number) {
  return sql`SUM(CASE WHEN ${challenge.courseId} = ${courseId} THEN (CASE WHEN ${challenge.retryResult} IS NULL THEN 1 ELSE 2 END) ELSE 0 END)`
}

// Get data based on specific competition_id and course_id
// firstMaxAttemptCount gets the max from firstResult and retryResult,
// then sums the count of firstResult and retryResult (ordered by created_at and id asc) until the max is reached.
// Even when not completed, it shows the count up to the current max result, so display should toggle based on completion status.
// firstMaxAttemptTime gets the created_at of the entry found by firstMaxAttemptCount.
export async function getCourseSummary(
  competitionId: number,
  courseId: number,
): Promise<CourseSummary[]> {
  const result = await db
    .select({
      playerId: player.id,
      playerName: player.name,
      playerFurigana: player.furigana,
      playerBibNumber: player.bibNumber,
      firstAttemptTime: firstAttemptTimeSubquery(player.id, competitionId).as(
        "firstAttemptTime",
      ),
      firstMaxAttemptCount: firstCountSubquery(
        player.id,
        competitionId,
        courseId,
      ).as("firstMaxAttemptCount"),
      firstMaxAttemptTime: firstTimeSubquery(
        player.id,
        competitionId,
        courseId,
      ).as("firstMaxAttemptTime"),
      lastAttemptTime: lastAttemptTimeSubquery(
        player.id,
        competitionId,
        courseId,
      ).as("lastAttemptTime"),
      firstAttemptScore: firstAttemptScoreSubquery(
        player.id,
        competitionId,
        courseId,
      ).as("firstAttemptScore"),
      courseOutCount: courseOutCountExpr(courseId).as("courseOutCount"),
      retryCount: retryCountExpr(courseId).as("retryCount"),
      attemptCount: attemptCountExpr(courseId).as("attemptCount"),
      maxResult: maxResultExpr(courseId).as("maxResult"),
      challengeCount: attemptCountExpr(courseId).as("challengeCount"),
    })
    .from(player)
    .leftJoin(challenge, eq(player.id, challenge.playerId))
    .where(eq(challenge.competitionId, competitionId))
    .groupBy(player.id)
    .orderBy(player.id)
  return result as CourseSummary[]
}

// Get individual result array by competition_id, course_id, player_id
export async function getCourseSummaryByPlayerId(
  competitionId: number,
  courseId: number,
  playerId: number,
) {
  // Get results as array
  return await db
    .select({
      id: challenge.id,
      firstResult: challenge.firstResult,
      retryResult: challenge.retryResult,
      detail: challenge.detail,
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        eq(challenge.courseId, courseId),
      ),
    )
    .orderBy(challenge.id)
    .groupBy(challenge.id)
}

// Get individual player results
export async function getPlayerResult(
  competitionId: number,
  courseId: number,
  playerId: number,
) {
  const result = await db
    .select({
      maxResult: maxResultExpr(courseId).as("maxResult"),
      firstCount: firstCountSubquery(
        sql`${playerId}`,
        competitionId,
        courseId,
      ).as("firstCount"),
      attemptCount: attemptCountExpr(courseId).as("attemptCount"),
      maxResultForCourse: maxResultExpr(courseId).as("maxResultForCourse"),
      challengeCount: attemptCountExpr(courseId).as("challengeCount"),
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
      ),
    )
    .groupBy(challenge.playerId) // Group by player
  return result as { maxResult: number }[]
}

// Get max value from result1 and result2
export async function getMaxResult(
  competitionId: number,
  courseId: number,
  playerId: number,
) {
  const result = await db
    .select({
      maxResult: maxResultExpr(courseId).as("maxResult"),
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        eq(challenge.courseId, courseId),
      ),
    )
    .groupBy(challenge.playerId) // Group by player
  return result as { maxResult: number }[]
}

// Count of attempts until the max result is achieved (not necessarily a goal)
export async function getFirstCount(
  competitionId: number,
  courseId: number,
  playerId: number,
) {
  const result = await db
    .select({
      firstCount: firstCountSubquery(
        sql`${playerId}`,
        competitionId,
        courseId,
      ).as("firstCount"),
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        eq(challenge.courseId, courseId),
      ),
    )
  return result as { firstCount: number }[]
}

// Challenge count per player
export async function getChallengeCount(
  competitionId: number,
  courseId: number,
  playerId: number,
) {
  const result = await db
    .select({
      challengeCount:
        sql`SUM(CASE WHEN ${challenge.retryResult} IS NULL THEN 1 ELSE 2 END)`.as(
          "challengeCount",
        ),
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        eq(challenge.courseId, courseId),
      ),
    )
  return result as { challengeCount: number }[]
}

// Check if a player name already exists (optionally excluding a specific player ID)
export async function getPlayerByName(
  name: string,
  excludeId?: number,
): Promise<{ id: number } | null> {
  const conditions = [eq(player.name, name)]
  if (excludeId) {
    conditions.push(ne(player.id, excludeId))
  }
  const result = await db
    .select({ id: player.id })
    .from(player)
    .where(and(...conditions))
    .limit(1)
  return result.length > 0 ? result[0] : null
}

// Get players with their competitions
export async function getPlayersWithCompetition() {
  return await db
    .select({
      id: player.id,
      name: player.name,
      furigana: player.furigana,
      bibNumber: player.bibNumber,
      note: player.note,
      createdAt: player.createdAt,
      competitionId: competition.id,
      competitionName: competition.name,
    })
    .from(player)
    .leftJoin(competitionPlayer, eq(player.id, competitionPlayer.playerId))
    .leftJoin(competition, eq(competitionPlayer.competitionId, competition.id))
    .orderBy(player.id)
}

// Group flat rows by player, collecting competition IDs and names
export function groupByPlayer(
  flatRows: {
    id: number
    name: string
    furigana: string | null
    bibNumber: string | null
    note: string | null
    createdAt: Date | null
    competitionId: number | null
    competitionName: string | null
  }[],
): SelectPlayerWithCompetition[] {
  const map = new Map<number, SelectPlayerWithCompetition>()

  for (const row of flatRows) {
    let existing = map.get(row.id)
    if (!existing) {
      existing = {
        id: row.id,
        name: row.name,
        furigana: row.furigana,
        bibNumber: row.bibNumber,
        note: row.note,
        createdAt: row.createdAt,
        competitionId: row.competitionId,
        competitionIds: [],
        competitionName: [],
      }
      map.set(row.id, existing)
    }
    if (
      row.competitionId &&
      row.competitionName &&
      !existing.competitionIds.includes(row.competitionId)
    ) {
      existing.competitionIds.push(row.competitionId)
      existing.competitionName?.push(row.competitionName)
    }
  }

  return Array.from(map.values())
}

// Get judges with their competitions (username from user table)
export async function getJudgeWithCompetition() {
  // Subquery: latest session createdAt per userId
  const lastLoginSubquery = db
    .select({
      userId: session.userId,
      lastLoginAt: sql<Date>`MAX(${session.createdAt})`.as("last_login_at"),
    })
    .from(session)
    .groupBy(session.userId)
    .as("last_login")

  return await db
    .select({
      id: judge.id,
      username: user.username,
      note: judge.note,
      userId: judge.userId,
      lastLoginAt: lastLoginSubquery.lastLoginAt,
      createdAt: judge.createdAt,
      competitionId: competition.id,
      competitionName: competition.name,
    })
    .from(judge)
    .innerJoin(user, eq(judge.userId, user.id))
    .leftJoin(lastLoginSubquery, eq(user.id, lastLoginSubquery.userId))
    .leftJoin(competitionJudge, eq(judge.id, competitionJudge.judgeId))
    .leftJoin(competition, eq(competitionJudge.competitionId, competition.id))
    .orderBy(judge.id)
}

// Group flat rows by judge, collecting competition IDs and names
export function groupByJudge(
  flatRows: {
    id: number
    username: string | null
    note: string | null
    userId: string
    lastLoginAt: Date | null
    createdAt: Date | null
    competitionId: number | null
    competitionName: string | null
  }[],
): SelectJudgeWithCompetition[] {
  const map = new Map<number, SelectJudgeWithCompetition>()

  for (const row of flatRows) {
    let existing = map.get(row.id)
    if (!existing) {
      existing = {
        id: row.id,
        username: row.username ?? "",
        note: row.note,
        userId: row.userId,
        lastLoginAt: row.lastLoginAt,
        createdAt: row.createdAt,
        competitionId: row.competitionId,
        competitionIds: [],
        competitionName: [],
      }
      map.set(row.id, existing)
    }
    if (
      row.competitionId &&
      row.competitionName &&
      !existing.competitionIds.includes(row.competitionId)
    ) {
      existing.competitionIds.push(row.competitionId)
      existing.competitionName?.push(row.competitionName)
    }
  }

  return Array.from(map.values())
}

// Get courses with their competitions
export async function getCourseWithCompetition() {
  return await db
    .select({
      id: course.id,
      name: course.name,
      description: course.description,
      isConfigured: course.isConfigured,
      createdAt: course.createdAt,
      competitionId: competition.id,
      competitionName: competition.name,
    })
    .from(course)
    .leftJoin(competitionCourse, eq(course.id, competitionCourse.courseId))
    .leftJoin(competition, eq(competitionCourse.competitionId, competition.id))
    .orderBy(course.id)
}

// Group flat rows by course, collecting competition IDs and names
export function groupByCourse(
  flatRows: {
    id: number
    name: string
    description: string | null
    isConfigured: boolean
    createdAt: Date | null
    competitionId: number | null
    competitionName: string | null
  }[],
): SelectCourseWithCompetition[] {
  const map = new Map<number, SelectCourseWithCompetition>()

  for (const row of flatRows) {
    let existing = map.get(row.id)
    if (!existing) {
      existing = {
        id: row.id,
        name: row.name,
        description: row.description,
        isConfigured: row.isConfigured,
        createdAt: row.createdAt,
        competitionId: row.competitionId,
        competitionIds: [],
        competitionName: [],
      }
      map.set(row.id, existing)
    }
    if (
      row.competitionId &&
      row.competitionName &&
      !existing.competitionIds.includes(row.competitionId)
    ) {
      existing.competitionIds.push(row.competitionId)
      existing.competitionName?.push(row.competitionName)
    }
  }

  return Array.from(map.values())
}

// Get competitions with their courses
export async function getCompetitionWithCourse() {
  return await db
    .select({
      id: competition.id,
      name: competition.name,
      description: competition.description,
      startDate: competition.startDate,
      endDate: competition.endDate,
      maskEnabled: competition.maskEnabled,
      maskMinutesBefore: competition.maskMinutesBefore,
      createdAt: competition.createdAt,
      courseId: course.id,
      courseName: course.name,
    })
    .from(competition)
    .leftJoin(
      competitionCourse,
      eq(competition.id, competitionCourse.competitionId),
    )
    .leftJoin(course, eq(competitionCourse.courseId, course.id))
    .orderBy(competition.id)
}

// Group flat rows by competition, collecting course IDs and names
export function groupByCompetition(
  flatRows: {
    id: number
    name: string
    description: string | null
    startDate: Date | null
    endDate: Date | null
    maskEnabled: boolean
    maskMinutesBefore: number
    createdAt: Date | null
    courseId: number | null
    courseName: string | null
  }[],
): SelectCompetitionWithCourse[] {
  const map = new Map<number, SelectCompetitionWithCourse>()

  for (const row of flatRows) {
    let existing = map.get(row.id)
    if (!existing) {
      existing = {
        id: row.id,
        name: row.name,
        description: row.description,
        startDate: row.startDate,
        endDate: row.endDate,
        maskEnabled: row.maskEnabled,
        maskMinutesBefore: row.maskMinutesBefore,
        createdAt: row.createdAt,
        courseIds: [],
        courseNames: [],
      }
      map.set(row.id, existing)
    }
    if (
      row.courseId &&
      row.courseName &&
      !existing.courseIds.includes(row.courseId)
    ) {
      existing.courseIds.push(row.courseId)
      existing.courseNames.push(row.courseName)
    }
  }

  return Array.from(map.values())
}

// Batch: check if any of the given course IDs have competition links
export async function getLinkedCourseIds(
  courseIds: number[],
): Promise<number[]> {
  if (courseIds.length === 0) {
    return []
  }
  const result = await db
    .select({ courseId: competitionCourse.courseId })
    .from(competitionCourse)
    .where(inArray(competitionCourse.courseId, courseIds))
    .groupBy(competitionCourse.courseId)
  return result.map((r) => r.courseId)
}

// Get judge summary by competition (aggregated stats per judge)
export async function getJudgeSummaryByCompetition(
  competitionId: number,
): Promise<JudgeSummary[]> {
  const result = await db.execute(sql`
    SELECT
      j.id AS "judgeId",
      u.username AS "judgeName",
      COUNT(DISTINCT c.player_id)::int AS "scoredPlayerCount",
      array_agg(DISTINCT p.name) AS "scoredPlayerNames",
      TO_CHAR(MIN(c.created_at) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS "firstScoringTime",
      TO_CHAR(MAX(c.created_at) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS "lastScoringTime",
      COUNT(c.id)::int AS "totalScoringCount",
      COUNT(DISTINCT c.course_id)::int AS "courseCount",
      array_agg(DISTINCT co.name) AS "courseNames",
      ROUND(AVG(GREATEST(c.first_result, COALESCE(c.retry_result, 0)))::numeric, 1)::float AS "averageScore",
      SUM(
        CASE WHEN c.detail = 'courseOut:first' THEN 1 ELSE 0 END
        + CASE WHEN c.detail = 'courseOut:retry' THEN 1 ELSE 0 END
      )::int AS "courseOutCount"
    FROM judge j
    INNER JOIN "user" u ON u.id = j.user_id
    INNER JOIN challenge c ON c.judge_id = j.id AND c.competition_id = ${competitionId}
    INNER JOIN player p ON p.id = c.player_id
    INNER JOIN course co ON co.id = c.course_id
    GROUP BY j.id, u.username
    ORDER BY j.id
  `)
  return result.rows as JudgeSummary[]
}

// Get course summary by competition (aggregated stats per course)
export async function getCourseSummaryByCompetition(
  competitionId: number,
): Promise<
  {
    courseId: number
    courseName: string
    firstChallengeTime: string | null
    lastChallengeTime: string | null
    challengerCount: number
    totalChallengeCount: number
    averageRawScore: number | null
    maxRawScore: number | null
    courseOutCount: number
    retryCount: number
  }[]
> {
  const result = await db.execute(sql`
    SELECT
      co.id AS "courseId",
      co.name AS "courseName",
      TO_CHAR(MIN(c.created_at) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS "firstChallengeTime",
      TO_CHAR(MAX(c.created_at) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS "lastChallengeTime",
      COUNT(DISTINCT c.player_id)::int AS "challengerCount",
      SUM(CASE WHEN c.retry_result IS NULL THEN 1 ELSE 2 END)::int AS "totalChallengeCount",
      ROUND(AVG(GREATEST(c.first_result, COALESCE(c.retry_result, 0)))::numeric, 1)::float AS "averageRawScore",
      MAX(GREATEST(c.first_result, COALESCE(c.retry_result, 0)))::int AS "maxRawScore",
      SUM(
        CASE WHEN c.detail = 'courseOut:first' THEN 1 ELSE 0 END
        + CASE WHEN c.detail = 'courseOut:retry' THEN 1 ELSE 0 END
      )::int AS "courseOutCount",
      SUM(CASE WHEN c.retry_result IS NOT NULL THEN 1 ELSE 0 END)::int AS "retryCount"
    FROM course co
    INNER JOIN challenge c ON c.course_id = co.id AND c.competition_id = ${competitionId}
    GROUP BY co.id, co.name
    ORDER BY co.id
  `)
  return result.rows as {
    courseId: number
    courseName: string
    firstChallengeTime: string | null
    lastChallengeTime: string | null
    challengerCount: number
    totalChallengeCount: number
    averageRawScore: number | null
    maxRawScore: number | null
    courseOutCount: number
    retryCount: number
  }[]
}
