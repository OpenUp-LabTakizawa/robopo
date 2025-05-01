import { CourseSummary } from "@/app/components/summary/utils"
import { db } from "@/app/lib/db/db"
import {
  course,
  SelectCourse,
  player,
  challenge,
  competition,
  umpire,
  umpireCourse,
  SelectAssignList,
  competitionPlayer,
  competitionUmpire,
  competitionCourse,
  SelectPlayerWithCompetition,
  SelectUmpireWithCompetition,
  SelectCourseWithCompetition,
} from "@/app/lib/db/schema"
import { eq, sql, and, or } from "drizzle-orm"

// IDを指定してDBからコースを削除する関数
// @/app/lib/db/queries/delete.tsを作成して移動させる方がいいかもしれない。
export const deleteCourseById = async (id: number) => {
  const result = await db.delete(course).where(eq(course.id, id)).returning({ deleatedId: course.id })
  return result
}

// コースをIDから取得する関数
export const getCourseById = async (id: number): Promise<SelectCourse | null> => {
  const result = await db.select().from(course).where(eq(course.id, id)).limit(1)

  return result.length > 0 ? result[0] : null
}

// IDを指定してDBからPlayerを削除する関数
export const deletePlayerById = async (id: number) => {
  const result = await db.delete(player).where(eq(player.id, id)).returning({ deleatedId: player.id })
  return result
}

// QRからPlayerを取得する関数
export const getPlayerByQR = async (qr: string) => {
  const result = await db.select().from(player).where(eq(player.qr, qr)).limit(1)
  return result.length > 0 ? result[0] : null
}
// IDからPlayerを取得する関数
export const getPlayerById = async (id: number) => {
  const result = await db.select().from(player).where(eq(player.id, id)).limit(1)
  return result.length > 0 ? result[0] : null
}

// IDを指定してDBからChallengeを削除する関数
export const deleteChallengeById = async (id: number) => {
  const result = await db.delete(challenge).where(eq(challenge.id, id)).returning({ deleatedId: challenge.id })
  return result
}

// IDを指定してDBからUmpireを削除する関数
export const deleteUmpireById = async (id: number) => {
  const result = await db.delete(umpire).where(eq(umpire.id, id)).returning({ deleatedId: umpire.id })
  return result
}

// IDからUmpireを取得する関数
export const getUmpireById = async (id: number) => {
  const result = await db.select().from(umpire).where(eq(umpire.id, id)).limit(1)
  return result.length > 0 ? result[0] : null
}

// IDを指定してDBからCompetitionを削除する関数
export const deleteCompetitionById = async (id: number) => {
  const result = await db.delete(competition).where(eq(competition.id, id)).returning({ deleatedId: competition.id })
  return result
}

// IDからCompetitionを取得する関数
export const getCompetitionById = async (id: number) => {
  const result = await db.select().from(competition).where(eq(competition.id, id)).limit(1)
  return result.length > 0 ? result[0] : null
}

// 特定の competition_id と course_id に基づくデータを取得
// firstTCourseCountはresult1とresult2から最大のものを取得し、
// それまで(created_atとidを昇順に並べた際の古いもの)のresult1とresult2の個数を最大のものが出るまで足している。
// 完走してない時もその時点で最大のresultまでの回数が出るので、完走したかどうかで表示非表示を変える必要がある。
// firstTCourseTimeは、firstTCourseCountで取得したもののcreated_atを取得している。
export const getCourseSummary = async (competitionId: number, courseId: number): Promise<CourseSummary[]> => {
  const result = await db
    .select({
      playerId: player.id,
      playerName: player.name,
      playerFurigana: player.furigana,
      playerZekken: player.zekken,
      firstTCourseCount: sql`
        (SELECT SUM(attempts_up_to_max) FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
          GREATEST(result1, COALESCE(result2, 0)) AS result,
          CASE WHEN result1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN result2 IS NOT NULL THEN 1 ELSE 0 END AS attempts_up_to_max
          FROM challenge
          WHERE player_id = ${player.id}
          AND course_id = ${courseId}
          AND (result1 IS NOT NULL OR result2 IS NOT NULL)
        ) AS RankedAttempts
          WHERE attempt_number <= (
            SELECT MIN(attempt_number) 
            FROM (
              SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
              GREATEST(result1, COALESCE(result2, 0)) AS result
              FROM challenge
              WHERE player_id = ${player.id}
              AND course_id = ${courseId}
              AND competition_id = ${competitionId}
            ) AS Attempts
            WHERE result = (
              SELECT MAX(GREATEST(result1, COALESCE(result2, 0)))
              FROM challenge
              WHERE player_id = ${player.id}
              AND course_id = ${courseId}
              AND competition_id = ${competitionId}
            )
          )
        )`.as("firstTCourseCount"),
      firstTCourseTime: sql`
        (
          SELECT created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo' FROM (
            SELECT
              ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
              created_at,
              GREATEST(result1, COALESCE(result2, 0)) AS result
            FROM challenge
            WHERE
              player_id = ${player.id}
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
                player_id = ${player.id}
                AND course_id = ${courseId}
                AND competition_id = ${competitionId}
            ) AS Attempts
            WHERE result = (
              SELECT MAX(GREATEST(result1, COALESCE(result2, 0)))
              FROM challenge
              WHERE
                player_id = ${player.id}
                AND course_id = ${courseId}
                AND competition_id = ${competitionId}
            )
          )
        )
      `.as("firstTCourseTime"),
      tCourseCount:
        // 単純にresult1とresult2の個数を足している。
        sql`SUM(CASE WHEN ${challenge.courseId} = ${courseId} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END) ELSE 0 END)`.as(
          "tCourseCount"
        ),
      tCourseMaxResult:
        sql`MAX(CASE WHEN ${challenge.courseId} = ${courseId} THEN GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)) ELSE NULL END)`.as(
          "tCourseMaxResult"
        ),
      sensorMaxResult:
        sql`MAX(CASE WHEN ${challenge.courseId} = -2 THEN GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)) ELSE NULL END)`.as(
          "sensorMaxResult"
        ),
      ipponMaxResult:
        sql`MAX(CASE WHEN ${challenge.courseId} = -1 THEN GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0))ELSE NULL END)`.as(
          "ipponMaxResult"
        ),
      challengeCount: sql`SUM(CASE
            WHEN ${challenge.courseId} = ${courseId} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
            WHEN ${challenge.courseId} = -1 THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
            WHEN ${challenge.courseId} = -2 THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
            ELSE 0
          END)`.as("challengeCount"),
    })
    .from(player)
    .leftJoin(challenge, eq(player.id, challenge.playerId))
    .where(eq(challenge.competitionId, competitionId))
    .groupBy(player.id)
    .orderBy(player.id)
  return result as CourseSummary[]
}

// competition_id, course_id, player_idから個人成績result配列を取得
export const getCourseSummaryByPlayerId = async (competitionId: number, courseId: number, playerId: number) => {
  // 結果を配列で取得
  const result = await db
    .select({
      results1: challenge.result1,
      results2: challenge.result2,
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        eq(challenge.courseId, courseId)
      )
    )
    .orderBy(challenge.id)
    .groupBy(challenge.id)

  return result as { results1: number; results2: number | null }[]
}

// 個人成績を取得
export const getPlayerResult = async (competitionId: number, courseId: number, playerId: number) => {
  const result = await db
    .select({
      maxResult: sql`MAX(GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)))`.as("maxResult"), // result1とresult2の最大値を取得
      firstCount: sql`
        (SELECT SUM(attempts_up_to_max) FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
          GREATEST(result1, COALESCE(result2, 0)) AS result,
          CASE WHEN result1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN result2 IS NOT NULL THEN 1 ELSE 0 END AS attempts_up_to_max
          FROM ${challenge}
          WHERE ${challenge.competitionId} = ${competitionId}
          AND ${challenge.playerId} = ${playerId}
          AND ${challenge.courseId} = ${courseId}
          AND (result1 IS NOT NULL OR result2 IS NOT NULL)
        ) AS RankedAttempts
        WHERE attempt_number <= (
          SELECT MIN(attempt_number) 
          FROM (
            SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
            GREATEST(result1, COALESCE(result2, 0)) AS result
            FROM ${challenge}
            WHERE  ${challenge.competitionId} = ${competitionId}
            AND ${challenge.playerId} = ${playerId}
            AND ${challenge.courseId} = ${courseId}
          ) AS Attempts
          WHERE result = (
            SELECT MAX(GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)))
            FROM ${challenge}
            WHERE  ${challenge.competitionId} = ${competitionId}
            AND ${challenge.playerId} = ${playerId}
            AND ${challenge.courseId} = ${courseId}
          )
        )
      )`.as("firstCount"),

      tCourseCount:
        sql`SUM(CASE WHEN ${challenge.courseId} = ${courseId} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END) ELSE 0 END)`.as(
          "tCourseCount"
        ),
      tCourseMaxResult:
        sql`MAX(CASE WHEN ${challenge.courseId} = ${courseId} THEN GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)) ELSE NULL END)`.as(
          "tCourseMaxResult"
        ),
      ipponMaxResult:
        sql`MAX(CASE WHEN ${challenge.courseId} = -1 THEN GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0))ELSE NULL END)`.as(
          "ipponMaxResult"
        ),
      sensorMaxResult:
        sql`MAX(CASE WHEN ${challenge.courseId} = -2 THEN GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)) ELSE NULL END)`.as(
          "sensorMaxResult"
        ),
      challengeCount: sql`SUM(CASE
            WHEN ${challenge.courseId} = ${courseId} THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
            WHEN ${challenge.courseId} = -1 THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
            WHEN ${challenge.courseId} = -2 THEN (CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)
            ELSE 0
          END)`.as("challengeCount"),
    })
    .from(challenge)
    .where(and(eq(challenge.competitionId, competitionId), eq(challenge.playerId, playerId)))
    .groupBy(challenge.playerId) // グループ化
  return result as { maxResult: number }[]
}

// result1, result2の中で最大値を取得
export const getMaxResult = async (competitionId: number, courseId: number, playerId: number) => {
  const result = await db
    .select({
      maxResult: sql`MAX(GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)))`.as("maxResult"), // result1とresult2の最大値を取得
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        eq(challenge.courseId, courseId)
      )
    )
    .groupBy(challenge.playerId) // グループ化
  return result as { maxResult: number }[]
}

// 最初に最大のresultを得るまでの回数(goalしているとは限らない)
export const getFirstCount = async (competitionId: number, courseId: number, playerId: number) => {
  const result = await db
    .select({
      firstCount: sql`
        (SELECT SUM(attempts_up_to_max) FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
          GREATEST(result1, COALESCE(result2, 0)) AS result,
          CASE WHEN result1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN result2 IS NOT NULL THEN 1 ELSE 0 END AS attempts_up_to_max
          FROM ${challenge}
          WHERE ${challenge.competitionId} = ${competitionId}
          AND ${challenge.playerId} = ${playerId}
          AND ${challenge.courseId} = ${courseId}
          AND (result1 IS NOT NULL OR result2 IS NOT NULL)
        ) AS RankedAttempts
        WHERE attempt_number <= (
          SELECT MIN(attempt_number) 
          FROM (
            SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS attempt_number,
            GREATEST(result1, COALESCE(result2, 0)) AS result
            FROM ${challenge}
            WHERE  ${challenge.competitionId} = ${competitionId}
            AND ${challenge.playerId} = ${playerId}
            AND ${challenge.courseId} = ${courseId}
          ) AS Attempts
          WHERE result = (
            SELECT MAX(GREATEST(${challenge.result1}, COALESCE(${challenge.result2}, 0)))
            FROM ${challenge}
            WHERE  ${challenge.competitionId} = ${competitionId}
            AND ${challenge.playerId} = ${playerId}
            AND ${challenge.courseId} = ${courseId}
          )
        )
      )`.as("firstCount"),
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        eq(challenge.courseId, courseId)
      )
    )
  return result as { firstCount: number }[]
}

// プレイヤー毎のチャレンジ回数
export const getChallengeCount = async (competitionId: number, courseId: number, playerId: number) => {
  const result = await db
    .select({
      challengeCount: sql`SUM(CASE WHEN ${challenge.result2} IS NULL THEN 1 ELSE 2 END)`.as("challengeCount"),
    })
    .from(challenge)
    .where(
      and(
        eq(challenge.competitionId, competitionId),
        eq(challenge.playerId, playerId),
        or(eq(challenge.courseId, courseId), eq(challenge.courseId, -1), eq(challenge.courseId, -2))
      )
    )
  return result as { challengeCount: number }[]
}

// competitionのIDを指定して開催にする関数
export const openCompetitionById = async (id: number) => {
  const result = await db.update(competition).set({ step: 1 }).where(eq(competition.id, id))
}

// competitionのIDを指定して非開催にする関数
export const closeCompetitionById = async (id: number) => {
  const result = await db.update(competition).set({ step: 2 }).where(eq(competition.id, id))
}

// umpireCourseをそれぞれの大会・コース・採点者のnameを取得して返す関数
export const getAssignList: () => Promise<SelectAssignList[]> = async () => {
  const result = await db
    .select({
      id: sql<number>`${umpireCourse.competitionId} * 10000 + ${umpireCourse.umpireId}`,
      competition: competition.name,
      course: course.name,
      umpire: umpire.name,
    })
    .from(umpireCourse)
    .leftJoin(competition, eq(umpireCourse.competitionId, competition.id))
    .leftJoin(course, eq(umpireCourse.courseId, course.id))
    .leftJoin(umpire, eq(umpireCourse.umpireId, umpire.id))
  return result
}

// competitionIdとumpireIdを指定してumpireCourseからcourseIdを取得する関数
export const getCourseIdByCompetitionIdAndUmpireId = async (competitionId: number, umpireId: number) => {
  const result = await db
    .select({ courseId: umpireCourse.courseId })
    .from(umpireCourse)
    .where(and(eq(umpireCourse.competitionId, competitionId), eq(umpireCourse.umpireId, umpireId)))
    .limit(1)
  return result
}

// playerと参加大会を表にする関数
export const getPlayersWithCompetition = async () => {
  const result = await db
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
  return result
}

// 上記queryをplayer毎にgroup化する。(配列を許可)
export function groupByPlayer(
  flatRows: {
    id: number
    name: string
    furigana: string | null
    zekken: string | null
    competitionId: number | null
    competitionName: string | null
  }[]
): SelectPlayerWithCompetition[] {
  const playerMap = new Map<string, SelectPlayerWithCompetition>()

  for (const row of flatRows) {
    const key = row.id.toString()

    if (!playerMap.has(key)) {
      playerMap.set(key, {
        id: row.id,
        name: row.name,
        furigana: row.furigana,
        zekken: row.zekken,
        competitionId: row.competitionId,
        competitionName: [],
      })
    }

    if (row.competitionName) {
      playerMap.get(key)?.competitionName?.push(row.competitionName)
    }
  }

  return Array.from(playerMap.values())
}

// umpireと参加大会を表にする関数
export const getUmpireWithCompetition = async () => {
  const result = await db
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
  return result
}

// 上記queryをumpire毎にgroup化する。(配列を許可)
export function groupByUmpire(
  flatRows: {
    id: number
    name: string
    competitionId: number | null
    competitionName: string | null
  }[]
): SelectUmpireWithCompetition[] {
  const umpireMap = new Map<string, SelectUmpireWithCompetition>()

  for (const row of flatRows) {
    const key = row.id.toString()

    if (!umpireMap.has(key)) {
      umpireMap.set(key, {
        id: row.id,
        name: row.name,
        competitionId: row.competitionId,
        competitionName: [],
      })
    }

    if (row.competitionName) {
      umpireMap.get(key)?.competitionName?.push(row.competitionName)
    }
  }

  return Array.from(umpireMap.values())
}

// courseと参加大会を表にする関数
export const getCourseWithCompetition = async () => {
  const result = await db
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
  return result
}

// 上記queryをcourse毎にgroup化する。(配列を許可)
export function groupByCourse(
  flatRows: {
    id: number
    name: string
    createdAt: Date | null
    competitionId: number | null
    competitionName: string | null
  }[]
): SelectCourseWithCompetition[] {
  const courseMap = new Map<string, SelectCourseWithCompetition>()

  for (const row of flatRows) {
    const key = row.id.toString()

    if (!courseMap.has(key)) {
      courseMap.set(key, {
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        competitionId: row.competitionId,
        competitionName: [],
      })
    }

    if (row.competitionName) {
      courseMap.get(key)?.competitionName?.push(row.competitionName)
    }
  }
  return Array.from(courseMap.values())
}
