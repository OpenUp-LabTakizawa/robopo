import { eq } from "drizzle-orm"
import { deserializePoint } from "@/lib/course/point"
import { db } from "@/lib/db/db"
import { getCompetitionById } from "@/lib/db/queries/queries"
import {
  challenge,
  competitionCourse,
  competitionPlayer,
  course,
  player,
} from "@/lib/db/schema"
import {
  applyCourseOutRule,
  COURSE_OUT_FIRST,
  COURSE_OUT_RETRY,
  parseCourseOutRule,
} from "@/lib/scoring/course-out"
import { calcPoint, totalPossiblePoints } from "@/lib/scoring/scoring"
import type {
  SpectatorBoardRow,
  SpectatorCourseBest,
  SpectatorCourseInfo,
  SpectatorLastRun,
  SpectatorPlayerCourseSummary,
  SpectatorPlayerDetail,
  SpectatorPlayerInfo,
  SpectatorSnapshot,
} from "@/lib/spectator/types"

function shouldMask(competition: {
  maskEnabled: boolean
  maskMinutesBefore: number
  endDate: Date | null
}): boolean {
  if (!competition.maskEnabled || !competition.endDate) {
    return false
  }
  const now = Date.now()
  const maskStart =
    new Date(competition.endDate).getTime() -
    competition.maskMinutesBefore * 60 * 1000
  return now >= maskStart
}

function maskPlayer(
  p: SpectatorPlayerInfo,
  masked: boolean,
): SpectatorPlayerInfo {
  if (!masked) {
    return p
  }
  return { id: p.id, name: "???", furigana: null, bibNumber: null }
}

function attemptScore(
  pointState: ReturnType<typeof deserializePoint>,
  rule: ReturnType<typeof parseCourseOutRule>,
  result: number | null,
  detail: string | null,
  attempt: "first" | "retry",
): number {
  if (result === null) {
    return 0
  }
  let p = calcPoint(pointState, result)
  const isCourseOut =
    (attempt === "first" && detail === COURSE_OUT_FIRST) ||
    (attempt === "retry" && detail === COURSE_OUT_RETRY)
  if (isCourseOut) {
    p = applyCourseOutRule(p, rule)
  }
  return p
}

function bestOfChallenge(
  pointState: ReturnType<typeof deserializePoint>,
  rule: ReturnType<typeof parseCourseOutRule>,
  firstResult: number | null,
  retryResult: number | null,
  detail: string | null,
): number {
  const a = attemptScore(pointState, rule, firstResult, detail, "first")
  const b = attemptScore(pointState, rule, retryResult, detail, "retry")
  return Math.max(a, b)
}

// ---- Pure assembly logic (testable without a database) ---------------------

export type AssembleCompetitionInput = {
  id: number
  name: string
  startDate: Date | null
  endDate: Date | null
  maskEnabled: boolean
  maskMinutesBefore: number
}

export type AssembleCourseRow = {
  id: number
  name: string
  description: string | null
  field: string | null
  mission: string | null
  point: string | null
  courseOutRule: string
}

export type AssemblePlayerRow = {
  id: number
  name: string
  furigana: string | null
  bibNumber: string | null
}

export type AssembleChallengeRow = {
  id: number
  firstResult: number
  retryResult: number | null
  detail: string | null
  courseId: number
  playerId: number
  createdAt: Date | null
}

/**
 * Pure version of `buildSpectatorSnapshot` — given pre-fetched competition,
 * courses, players, and challenges, assemble the full SpectatorSnapshot
 * without touching the database. Used both by the live runtime and by unit
 * tests.
 */
export function assembleSnapshot(
  competitionData: AssembleCompetitionInput,
  courseRows: AssembleCourseRow[],
  playerRows: AssemblePlayerRow[],
  allChallenges: AssembleChallengeRow[],
): SpectatorSnapshot {
  const masked = shouldMask(competitionData)

  const courses: SpectatorCourseInfo[] = courseRows.map((c) => {
    const pointState = deserializePoint(c.point)
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      field: c.field,
      mission: c.mission,
      point: c.point,
      courseOutRule: c.courseOutRule,
      maxPoint: totalPossiblePoints(pointState),
    }
  })

  // Pre-parse course point/rule for fast scoring.
  const courseScoring = new Map(
    courseRows.map((c) => [
      c.id,
      {
        pointState: deserializePoint(c.point),
        rule: parseCourseOutRule(c.courseOutRule),
      },
    ]),
  )

  // Sort challenges chronologically (older first) — this lets us replay history
  // and detect "highlight moments" (personal/course best updates) as they
  // happened.
  const sortedChallenges = [...allChallenges].sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0
    if (at !== bt) {
      return at - bt
    }
    return a.id - b.id
  })

  // Aggregate: per (player, course) best, attempt count + best/last reachedIndex.
  type Agg = {
    bestPoint: number
    attempts: number
    bestReachedIndex: number
    lastReachedIndex: number | null
    lastChallengeAt: string | null
  }
  const cellAgg = new Map<string, Agg>()
  const playerAttemptTotal = new Map<number, number>()

  // While replaying chronologically, collect highlight challenges
  // (personal-best or course-best update moments).
  const courseRunningBest = new Map<number, number>()
  type Highlight = {
    challenge: AssembleChallengeRow
    point: number
    previousPersonalBest: number
    previousCourseBest: number
    attemptsAfter: number
    isPersonalBest: boolean
    isCourseBest: boolean
  }
  const highlights: Highlight[] = []

  for (const ch of sortedChallenges) {
    const sc = courseScoring.get(ch.courseId)
    if (!sc) {
      continue
    }
    const point = bestOfChallenge(
      sc.pointState,
      sc.rule,
      ch.firstResult,
      ch.retryResult,
      ch.detail,
    )
    const reachedIndex = Math.max(ch.firstResult, ch.retryResult ?? 0)
    const cellKey = `${ch.playerId}:${ch.courseId}`
    const prevCell = cellAgg.get(cellKey) ?? {
      bestPoint: 0,
      attempts: 0,
      bestReachedIndex: 0,
      lastReachedIndex: null,
      lastChallengeAt: null,
    }
    const previousPersonalBest = prevCell.bestPoint
    const previousCourseBest = courseRunningBest.get(ch.courseId) ?? 0

    const isPersonalBest = point > previousPersonalBest && point > 0
    const isCourseBest = point > previousCourseBest && point > 0

    const newCell: Agg = {
      bestPoint: Math.max(prevCell.bestPoint, point),
      attempts: prevCell.attempts + 1,
      bestReachedIndex:
        point > prevCell.bestPoint ? reachedIndex : prevCell.bestReachedIndex,
      lastReachedIndex: reachedIndex,
      lastChallengeAt: (ch.createdAt ?? new Date()).toISOString(),
    }
    cellAgg.set(cellKey, newCell)
    courseRunningBest.set(ch.courseId, Math.max(previousCourseBest, point))
    playerAttemptTotal.set(
      ch.playerId,
      (playerAttemptTotal.get(ch.playerId) ?? 0) + 1,
    )

    if (isPersonalBest || isCourseBest) {
      highlights.push({
        challenge: ch,
        point,
        previousPersonalBest,
        previousCourseBest,
        attemptsAfter: newCell.attempts,
        isPersonalBest,
        isCourseBest,
      })
    }
  }

  const playerInfos = new Map<number, SpectatorPlayerInfo>(
    playerRows.map((p) => [
      p.id,
      maskPlayer(
        {
          id: p.id,
          name: p.name,
          furigana: p.furigana,
          bibNumber: p.bibNumber,
        },
        masked,
      ),
    ]),
  )

  // Build board rows.
  const board: SpectatorBoardRow[] = playerRows
    .map((p) => {
      const perCourse: Record<number, number | null> = {}
      let total = 0
      let hasAny = false
      for (const c of courses) {
        const cell = cellAgg.get(`${p.id}:${c.id}`)
        if (cell) {
          perCourse[c.id] = cell.bestPoint
          total += cell.bestPoint
          hasAny = true
        } else {
          perCourse[c.id] = null
        }
      }
      const attempts = playerAttemptTotal.get(p.id) ?? 0
      const info = playerInfos.get(p.id)
      if (!info) {
        return null
      }
      // Show only players who have actually scored on the leaderboard.
      // Zero-point attempts still count toward playerDetails (via cellAgg) but
      // are intentionally excluded from the public ranking.
      return hasAny && total > 0
        ? { rank: 0, player: info, perCourse, total, attempts }
        : null
    })
    .filter((r): r is SpectatorBoardRow => r !== null)
    .sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total
      }
      return a.attempts - b.attempts
    })

  let currentRank = 1
  for (let i = 0; i < board.length; i++) {
    if (i > 0 && board[i].total < board[i - 1].total) {
      currentRank = i + 1
    }
    board[i].rank = currentRank
  }

  // Best per course.
  const bestPerCourse: Record<number, SpectatorCourseBest> = {}
  for (const c of courses) {
    let best: { playerId: number; point: number } | null = null
    for (const p of playerRows) {
      const cell = cellAgg.get(`${p.id}:${c.id}`)
      if (!cell || cell.bestPoint <= 0) {
        continue
      }
      if (!best || cell.bestPoint > best.point) {
        best = { playerId: p.id, point: cell.bestPoint }
      }
    }
    bestPerCourse[c.id] = {
      courseId: c.id,
      point: best?.point ?? 0,
      player: best ? (playerInfos.get(best.playerId) ?? null) : null,
    }
  }

  // The "highlight" lastRun = the most recent personal-best or course-best
  // challenge. Otherwise null (nothing flashy enough to feature).
  let lastRun: SpectatorLastRun | null = null
  if (highlights.length > 0) {
    const top = highlights[highlights.length - 1]
    const ch = top.challenge
    const sc = courseScoring.get(ch.courseId)
    const courseInfo = courses.find((c) => c.id === ch.courseId)
    const playerInfo = playerInfos.get(ch.playerId)
    if (sc && courseInfo && playerInfo) {
      lastRun = {
        challengeId: ch.id,
        player: playerInfo,
        course: courseInfo,
        firstResult: ch.firstResult,
        retryResult: ch.retryResult,
        detail: ch.detail,
        point: top.point,
        bestPoint: Math.max(top.point, top.previousPersonalBest),
        previousBestPoint: top.previousPersonalBest,
        attemptsBefore: Math.max(0, top.attemptsAfter - 1),
        attemptsAfter: top.attemptsAfter,
        isPersonalBest: top.isPersonalBest,
        isCourseBest: top.isCourseBest,
        createdAt: (ch.createdAt ?? new Date()).toISOString(),
      }
    }
  }

  // Per-player detail summaries, used by the player-focus panel.
  const rankByPlayerId = new Map<number, number>()
  for (const row of board) {
    rankByPlayerId.set(row.player.id, row.rank)
  }
  const playerDetails: Record<number, SpectatorPlayerDetail> = {}
  for (const p of playerRows) {
    const info = playerInfos.get(p.id)
    if (!info) {
      continue
    }
    const perCourse: Record<number, SpectatorPlayerCourseSummary> = {}
    let total = 0
    for (const c of courses) {
      const cell = cellAgg.get(`${p.id}:${c.id}`)
      const summary: SpectatorPlayerCourseSummary = {
        courseId: c.id,
        bestPoint: cell?.bestPoint ?? 0,
        attempts: cell?.attempts ?? 0,
        bestReachedIndex: cell?.bestReachedIndex ?? 0,
        lastReachedIndex: cell?.lastReachedIndex ?? null,
        lastChallengeAt: cell?.lastChallengeAt ?? null,
      }
      perCourse[c.id] = summary
      total += summary.bestPoint
    }
    playerDetails[p.id] = {
      player: info,
      totalPoint: total,
      totalAttempts: playerAttemptTotal.get(p.id) ?? 0,
      rank: rankByPlayerId.get(p.id) ?? null,
      perCourse,
    }
  }

  return {
    competition: {
      id: competitionData.id,
      name: competitionData.name,
      startDate: competitionData.startDate
        ? new Date(competitionData.startDate).toISOString()
        : null,
      endDate: competitionData.endDate
        ? new Date(competitionData.endDate).toISOString()
        : null,
    },
    masked,
    courses,
    board,
    bestPerCourse,
    lastRun,
    playerDetails,
    generatedAt: new Date().toISOString(),
  }
}

// ---- Live (DB-backed) entry point ------------------------------------------

export async function buildSpectatorSnapshot(
  competitionId: number,
): Promise<SpectatorSnapshot | null> {
  const competitionData = await getCompetitionById(competitionId)
  if (!competitionData) {
    return null
  }

  const [courseRows, playerRows, allChallenges] = await Promise.all([
    db
      .select({
        id: course.id,
        name: course.name,
        description: course.description,
        field: course.field,
        mission: course.mission,
        point: course.point,
        courseOutRule: course.courseOutRule,
      })
      .from(course)
      .innerJoin(competitionCourse, eq(course.id, competitionCourse.courseId))
      .where(eq(competitionCourse.competitionId, competitionId)),
    db
      .select({
        id: player.id,
        name: player.name,
        furigana: player.furigana,
        bibNumber: player.bibNumber,
      })
      .from(player)
      .innerJoin(competitionPlayer, eq(player.id, competitionPlayer.playerId))
      .where(eq(competitionPlayer.competitionId, competitionId)),
    db
      .select({
        id: challenge.id,
        firstResult: challenge.firstResult,
        retryResult: challenge.retryResult,
        detail: challenge.detail,
        courseId: challenge.courseId,
        playerId: challenge.playerId,
        createdAt: challenge.createdAt,
      })
      .from(challenge)
      .where(eq(challenge.competitionId, competitionId)),
  ])

  return assembleSnapshot(
    {
      id: competitionData.id,
      name: competitionData.name,
      startDate: competitionData.startDate ?? null,
      endDate: competitionData.endDate ?? null,
      maskEnabled: competitionData.maskEnabled,
      maskMinutesBefore: competitionData.maskMinutesBefore,
    },
    courseRows,
    playerRows,
    allChallenges,
  )
}

// Helper to clamp a numeric mission index to the maximum mission count of a course.
export function clampMissionIndex(missionLength: number, idx: number): number {
  if (idx < 0) {
    return 0
  }
  if (missionLength <= 2) {
    return 0
  }
  const maxIdx = Math.floor((missionLength - 2) / 2)
  return Math.min(idx, maxIdx)
}
