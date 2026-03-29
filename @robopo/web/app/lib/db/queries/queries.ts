import { and, eq, or, type SQLWrapper, sql } from "drizzle-orm"
import { RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import type { CourseSummary } from "@/app/components/summary/utils"
import { db } from "@/app/lib/db/db"
import {
  challenge,
  competition,
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
  course,
  player,
  type SelectCourse,
  type SelectCourseWithCompetition,
  type SelectPlayerWithCompetition,
  type SelectUmpireWithCompetition,
  umpire,
} from "@/app/lib/db/schema"

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

// Delete umpire from DB by ID
export async function deleteUmpireById(id: number) {
  return await db
    .delete(umpire)
    .where(eq(umpire.id, id))
    .returning({ deletedId: umpire.id })
}

// Get umpire by ID
export async function getUmpireById(id: number) {
  const result = await db
    .select()
    .from(umpire)
    .where(eq(umpire.id, id))
    .limit(1)
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
      GREATEST(result1, COALESCE(result2, 0)) AS result,
      CASE WHEN result1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN result2 IS NOT NULL THEN 1 ELSE 0 END AS attempts_up_to_max
      FROM challenge
      WHERE player_id = ${playerIdRef}
      AND course_id = ${courseId}
      AND (result1 IS NOT NULL OR result2 IS NOT NULL)
    ) AS RankedAttempts
      WHERE attempt_number <= (
        SELECT MIN(attempt_number)
        FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
          GREATEST(result1, COALESCE(result2, 0)) AS result
          FROM challenge
          WHERE player_id = ${playerIdRef}
          AND course_id = ${courseId}
          AND competition_id = ${competitionId}
        ) AS Attempts
        WHERE result = (
          SELECT MAX(GREATEST(result1, COALESCE(result2, 0)))
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
          GREATEST(result1, COALESCE(result2, 0)) AS result
        FROM challenge
        WHERE
          player_id = ${playerIdRef}
          AND course_id = ${courseId}
          AND (result1 IS NOT NULL OR result2 IS NOT NULL)
      ) AS RankedAttemptsWithDate
      WHERE attempt_number = (
        SELECT MIN(attempt_number) FROM (
          SELECT
            ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
            GREATEST(result1, COALESCE(result2, 0)) AS result
          FROM challenge
          WHERE
            player_id = ${playerIdRef}
            AND course_id = ${courseId}
            AND competition_id = ${competitionId}
        ) AS Attempts
        WHERE result = (
          SELECT MAX(GREATEST(result1, COALESCE(result2, 0)))
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

// SQL helper: max result across result1 and result2 for a specific course
function maxResultExpr(courseIdExpr: number | ReturnType<typeof sql>) {
  return sql`MAX(CASE WHEN ${challenge.courseId} = ${courseIdExpr} THEN GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)) ELSE NULL END)`
}

// SQL helper: total challenge count (counting retries as 2) across the given course, Ippon Bashi, and Sensor courses
function totalChallengeCountExpr(courseId: number) {
  return sql`SUM(CASE
    WHEN ${challenge.courseId} = ${courseId} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
    WHEN ${challenge.courseId} = ${RESERVED_COURSE_IDS.IPPON} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
    WHEN ${challenge.courseId} = ${RESERVED_COURSE_IDS.SENSOR} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
    ELSE 0
  END)`
}

// SQL helper: course attempt count (counting retries as 2) for a specific course
function tCourseCountExpr(courseId: number) {
  return sql`SUM(CASE WHEN ${challenge.courseId} = ${courseId} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END) ELSE 0 END)`
}

// Get data based on specific competition_id and course_id
// firstTCourseCount gets the max from result1 and result2,
// then sums the count of result1 and result2 (ordered by created_at and id asc) until the max is reached.
// Even when not completed, it shows the count up to the current max result, so display should toggle based on completion status.
// firstTCourseTime gets the created_at of the entry found by firstTCourseCount.
export async function getCourseSummary(
  competitionId: number,
  courseId: number,
): Promise<CourseSummary[]> {
  const result = await db
    .select({
      playerId: player.id,
      playerName: player.name,
      playerFurigana: player.furigana,
      playerZekken: player.zekken,
      firstTCourseCount: firstCountSubquery(
        player.id,
        competitionId,
        courseId,
      ).as("firstTCourseCount"),
      firstTCourseTime: firstTimeSubquery(
        player.id,
        competitionId,
        courseId,
      ).as("firstTCourseTime"),
      tCourseCount: tCourseCountExpr(courseId).as("tCourseCount"),
      tCourseMaxResult: maxResultExpr(courseId).as("tCourseMaxResult"),
      sensorMaxResult: maxResultExpr(RESERVED_COURSE_IDS.SENSOR).as(
        "sensorMaxResult",
      ),
      ipponMaxResult: maxResultExpr(RESERVED_COURSE_IDS.IPPON).as(
        "ipponMaxResult",
      ),
      challengeCount: totalChallengeCountExpr(courseId).as("challengeCount"),
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
      results1: challenge.result1,
      results2: challenge.result2,
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
      tCourseCount: tCourseCountExpr(courseId).as("tCourseCount"),
      tCourseMaxResult: maxResultExpr(courseId).as("tCourseMaxResult"),
      ipponMaxResult: maxResultExpr(RESERVED_COURSE_IDS.IPPON).as(
        "ipponMaxResult",
      ),
      sensorMaxResult: maxResultExpr(RESERVED_COURSE_IDS.SENSOR).as(
        "sensorMaxResult",
      ),
      challengeCount: totalChallengeCountExpr(courseId).as("challengeCount"),
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
        sql`SUM(CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)`.as(
          "challengeCount",
        ),
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        or(
          eq(challenge.courseId, courseId),
          eq(challenge.courseId, RESERVED_COURSE_IDS.IPPON),
          eq(challenge.courseId, RESERVED_COURSE_IDS.SENSOR),
        ),
      ),
    )
  return result as { challengeCount: number }[]
}

// Set competition to open status by ID
export async function openCompetitionById(id: number) {
  return await db
    .update(competition)
    .set({ step: 1 })
    .where(eq(competition.id, id))
}

// Set competition to pre-open status by ID
export async function returnCompetitionById(id: number) {
  // 1) Check the current step to enforce valid state transition
  const existing = await db
    .select({ step: competition.step })
    .from(competition)
    .where(eq(competition.id, id))
    .limit(1)

  if (!existing) {
    throw new Error(`Competition with id ${id} not found`)
  }
  if (existing[0]?.step !== 1) {
    throw new Error(
      `Invalid state transition: cannot return competition from step ${existing[0]?.step} to before state`,
    )
  }

  // 2) Perform the permitted update
  return await db
    .update(competition)
    .set({ step: 0 })
    .where(eq(competition.id, id))
}

// Set competition to closed status by ID
export async function closeCompetitionById(id: number) {
  return await db
    .update(competition)
    .set({ step: 2 })
    .where(eq(competition.id, id))
}

// Get players with their competitions
export async function getPlayersWithCompetition() {
  return await db
    .select({
      id: player.id,
      name: player.name,
      furigana: player.furigana,
      zekken: player.zekken,
      competitionId: competition.id,
      competitionName: competition.name,
    })
    .from(player)
    .leftJoin(competitionPlayer, eq(player.id, competitionPlayer.playerId))
    .leftJoin(competition, eq(competitionPlayer.competitionId, competition.id))
    .orderBy(player.id)
}

// Generic helper: group flat rows by id and collect competitionName into arrays
type FlatRowWithCompetition = {
  id: number
  competitionId: number | null
  competitionName: string | null
}

function groupByIdWithCompetitions<
  TFlat extends FlatRowWithCompetition,
  TResult extends { competitionName: string[] },
>(flatRows: TFlat[], toResult: (row: TFlat) => TResult): TResult[] {
  const map = new Map<number, TResult>()

  for (const row of flatRows) {
    let existing = map.get(row.id)

    if (!existing) {
      existing = toResult(row)
      map.set(row.id, existing)
    }

    if (row.competitionName) {
      existing.competitionName.push(row.competitionName)
    }
  }

  return Array.from(map.values())
}

// Group flat rows by player
export function groupByPlayer(
  flatRows: {
    id: number
    name: string
    furigana: string | null
    zekken: string | null
    competitionId: number | null
    competitionName: string | null
  }[],
): SelectPlayerWithCompetition[] {
  return groupByIdWithCompetitions(flatRows, (row) => ({
    id: row.id,
    name: row.name,
    furigana: row.furigana,
    zekken: row.zekken,
    competitionId: row.competitionId,
    competitionName: [],
  }))
}

// Get umpires with their competitions
export async function getUmpireWithCompetition() {
  return await db
    .select({
      id: umpire.id,
      name: umpire.name,
      competitionId: competition.id,
      competitionName: competition.name,
    })
    .from(umpire)
    .leftJoin(competitionUmpire, eq(umpire.id, competitionUmpire.umpireId))
    .leftJoin(competition, eq(competitionUmpire.competitionId, competition.id))
    .orderBy(umpire.id)
}

// Group flat rows by umpire
export function groupByUmpire(
  flatRows: {
    id: number
    name: string
    competitionId: number | null
    competitionName: string | null
  }[],
): SelectUmpireWithCompetition[] {
  return groupByIdWithCompetitions(flatRows, (row) => ({
    id: row.id,
    name: row.name,
    competitionId: row.competitionId,
    competitionName: [],
  }))
}

// Get courses with their competitions
export async function getCourseWithCompetition() {
  return await db
    .select({
      id: course.id,
      name: course.name,
      createdAt: course.createdAt,
      competitionId: competition.id,
      competitionName: competition.name,
    })
    .from(course)
    .leftJoin(competitionCourse, eq(course.id, competitionCourse.courseId))
    .leftJoin(competition, eq(competitionCourse.competitionId, competition.id))
    .orderBy(course.id)
}

// Group flat rows by course
export function groupByCourse(
  flatRows: {
    id: number
    name: string
    createdAt: Date | null
    competitionId: number | null
    competitionName: string | null
  }[],
): SelectCourseWithCompetition[] {
  return groupByIdWithCompetitions(flatRows, (row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    competitionId: row.competitionId,
    competitionName: [],
  }))
}
