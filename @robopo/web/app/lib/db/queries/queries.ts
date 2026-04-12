import { and, eq, type SQLWrapper, sql } from "drizzle-orm"
import type { CourseSummary } from "@/app/components/summary/utils"
import { db } from "@/app/lib/db/db"
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
} from "@/app/lib/db/schema"

// Check if a course name already exists (optionally excluding a specific course ID)
export async function getCourseByName(
  name: string,
  excludeId?: number,
): Promise<{ id: number } | null> {
  const conditions = [eq(course.name, name)]
  if (excludeId) {
    conditions.push(sql`${course.id} != ${excludeId}`)
  }
  const result = await db
    .select({ id: course.id })
    .from(course)
    .where(and(...conditions))
    .limit(1)
  return result.length > 0 ? result[0] : null
}

// Delete course from DB by ID
// Consider moving to @/app/lib/db/queries/delete.ts
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
export async function getPlayerByQR(qr: string) {
  const result = await db
    .select()
    .from(player)
    .where(eq(player.qr, qr))
    .limit(1)
  return result.length > 0 ? result[0] : null
}
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

// Get judge by ID
export async function getJudgeById(id: number) {
  const result = await db.select().from(judge).where(eq(judge.id, id)).limit(1)
  return result.length > 0 ? result[0] : null
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
      SELECT created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo' FROM (
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
    conditions.push(sql`${player.id} != ${excludeId}`)
  }
  const result = await db
    .select({ id: player.id })
    .from(player)
    .where(and(...conditions))
    .limit(1)
  return result.length > 0 ? result[0] : null
}

// Check if a judge name already exists (optionally excluding a specific judge ID)
export async function getJudgeByName(
  name: string,
  excludeId?: number,
): Promise<{ id: number } | null> {
  const conditions = [eq(judge.name, name)]
  if (excludeId) {
    conditions.push(sql`${judge.id} != ${excludeId}`)
  }
  const result = await db
    .select({ id: judge.id })
    .from(judge)
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

// Get judges with their competitions
export async function getJudgeWithCompetition() {
  return await db
    .select({
      id: judge.id,
      name: judge.name,
      note: judge.note,
      createdAt: judge.createdAt,
      competitionId: competition.id,
      competitionName: competition.name,
    })
    .from(judge)
    .leftJoin(competitionJudge, eq(judge.id, competitionJudge.judgeId))
    .leftJoin(competition, eq(competitionJudge.competitionId, competition.id))
    .orderBy(judge.id)
}

// Group flat rows by judge, collecting competition IDs and names
export function groupByJudge(
  flatRows: {
    id: number
    name: string
    note: string | null
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
        name: row.name,
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

// Get courses with their competitions
export async function getCourseWithCompetition() {
  return await db
    .select({
      id: course.id,
      name: course.name,
      description: course.description,
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

// Count how many competitions a course is linked to
export async function getCourseCompetitionCount(
  courseId: number,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(competitionCourse)
    .where(eq(competitionCourse.courseId, courseId))
  return result[0]?.count ?? 0
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
    .where(
      sql`${competitionCourse.courseId} IN (${sql.join(
        courseIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    )
    .groupBy(competitionCourse.courseId)
  return result.map((r) => r.courseId)
}
