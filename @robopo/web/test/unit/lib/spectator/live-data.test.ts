import { describe, expect, test } from "bun:test"
import {
  type AssembleChallengeRow,
  type AssembleCompetitionInput,
  type AssembleCourseRow,
  type AssemblePlayerRow,
  assembleSnapshot,
} from "@/lib/spectator/live-data"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseCompetition: AssembleCompetitionInput = {
  id: 1,
  name: "テスト大会",
  startDate: new Date("2026-01-01T00:00:00Z"),
  endDate: new Date("2030-01-01T00:00:00Z"),
  maskEnabled: false,
  maskMinutesBefore: 30,
}

// Course with 2 missions worth 5pt each + start=0, goal=10 → max = 20pt
// Mission state: ["u","u", "mf","1", "mf","1"] → pairs.length = 2
const courseA: AssembleCourseRow = {
  id: 10,
  name: "コースA",
  description: null,
  field: "start,route,goal;null,null,null",
  mission: "u;u;mf;1;mf;1",
  point: "0;10;5;5",
  courseOutRule: "keep",
}
// Course with 3 missions worth 10pt each + start=0, goal=0 → max = 30pt
const courseB: AssembleCourseRow = {
  id: 20,
  name: "コースB",
  description: null,
  field: "start,goal;null,null",
  mission: "u;u;mf;1;mf;1;mf;1",
  point: "0;0;10;10;10",
  courseOutRule: "keep",
}

const playerA: AssemblePlayerRow = {
  id: 100,
  name: "選手A",
  furigana: "せんしゅえー",
  bibNumber: "001",
}
const playerB: AssemblePlayerRow = {
  id: 200,
  name: "選手B",
  furigana: "せんしゅびー",
  bibNumber: "002",
}

function ch(
  id: number,
  playerId: number,
  courseId: number,
  firstResult: number,
  retryResult: number | null = null,
  detail: string | null = null,
  createdAt: string = "2026-04-01T10:00:00Z",
): AssembleChallengeRow {
  return {
    id,
    firstResult,
    retryResult,
    detail,
    courseId,
    playerId,
    createdAt: new Date(createdAt),
  }
}

// ---------------------------------------------------------------------------

describe("assembleSnapshot — basic shape", () => {
  test("builds an empty-but-well-formed snapshot when there are no challenges", () => {
    const snap = assembleSnapshot(baseCompetition, [courseA], [playerA], [])
    expect(snap.competition.name).toBe("テスト大会")
    expect(snap.courses).toHaveLength(1)
    expect(snap.courses[0].id).toBe(10)
    expect(snap.courses[0].maxPoint).toBe(20)
    expect(snap.board).toEqual([])
    expect(snap.lastRun).toBeNull()
    // playerDetails always exists for all players, even with no attempts
    expect(snap.playerDetails[100]).toBeDefined()
    expect(snap.playerDetails[100].totalPoint).toBe(0)
    expect(snap.playerDetails[100].totalAttempts).toBe(0)
  })

  test("includes maxPoint computed from the course point string", () => {
    const snap = assembleSnapshot(baseCompetition, [courseA, courseB], [], [])
    expect(snap.courses.find((c) => c.id === 10)?.maxPoint).toBe(20)
    expect(snap.courses.find((c) => c.id === 20)?.maxPoint).toBe(30)
  })
})

describe("assembleSnapshot — leaderboard", () => {
  test("ranks by total point desc, ties get the same rank but the more efficient (fewer attempts) one is listed first", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA, courseB],
      [playerA, playerB],
      [
        // playerA: 20 + 30 = 50, attempts=2
        ch(1, 100, 10, 2, null, null, "2026-04-01T10:00:00Z"),
        ch(2, 100, 20, 3, null, null, "2026-04-01T10:01:00Z"),
        // playerB: 20 + 30 = 50, attempts=3 (more attempts → listed second)
        ch(3, 200, 10, 1, null, null, "2026-04-01T10:02:00Z"),
        ch(4, 200, 10, 2, null, null, "2026-04-01T10:03:00Z"),
        ch(5, 200, 20, 3, null, null, "2026-04-01T10:04:00Z"),
      ],
    )
    expect(snap.board).toHaveLength(2)
    expect(snap.board[0].player.id).toBe(100)
    expect(snap.board[0].attempts).toBe(2)
    expect(snap.board[1].player.id).toBe(200)
    expect(snap.board[1].attempts).toBe(3)
    // Tied total → same rank
    expect(snap.board[0].total).toBe(50)
    expect(snap.board[1].total).toBe(50)
    expect(snap.board[0].rank).toBe(1)
    expect(snap.board[1].rank).toBe(1)
  })

  test("excludes players with zero records from the board", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA, playerB],
      [ch(1, 100, 10, 2)],
    )
    expect(snap.board).toHaveLength(1)
    expect(snap.board[0].player.id).toBe(100)
    // But playerDetails still includes player B with zero data
    expect(snap.playerDetails[200]).toBeDefined()
    expect(snap.playerDetails[200].totalPoint).toBe(0)
  })

  test("ties get the same rank, next rank skipped", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA, playerB],
      [
        // both score 20
        ch(1, 100, 10, 2),
        ch(2, 200, 10, 2),
      ],
    )
    expect(snap.board[0].rank).toBe(1)
    expect(snap.board[1].rank).toBe(1)
  })
})

describe("assembleSnapshot — bestPerCourse", () => {
  test("picks the highest scoring player per course", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA, playerB],
      [
        ch(1, 100, 10, 1), // 15pt (start 0 + mission 5 + goal 10)
        ch(2, 200, 10, 2), // 20pt (start 0 + mission 5+5 + goal 10)
      ],
    )
    expect(snap.bestPerCourse[10].point).toBe(20)
    expect(snap.bestPerCourse[10].player?.id).toBe(200)
  })

  test("returns 0/null when no player has scored on a course", () => {
    const snap = assembleSnapshot(baseCompetition, [courseA], [playerA], [])
    expect(snap.bestPerCourse[10].point).toBe(0)
    expect(snap.bestPerCourse[10].player).toBeNull()
  })
})

describe("assembleSnapshot — lastRun (highlight detection)", () => {
  test("returns null when no highlight challenges exist", () => {
    const snap = assembleSnapshot(baseCompetition, [courseA], [playerA], [])
    expect(snap.lastRun).toBeNull()
  })

  test("first scoring challenge is treated as both PB and CB", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA],
      [ch(1, 100, 10, 2)],
    )
    expect(snap.lastRun).not.toBeNull()
    expect(snap.lastRun?.isPersonalBest).toBe(true)
    expect(snap.lastRun?.isCourseBest).toBe(true)
    expect(snap.lastRun?.point).toBe(20)
  })

  test("non-improving subsequent challenge does NOT become lastRun", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA],
      [
        ch(1, 100, 10, 2, null, null, "2026-04-01T10:00:00Z"),
        // Same score → not a highlight
        ch(2, 100, 10, 2, null, null, "2026-04-01T10:01:00Z"),
      ],
    )
    // lastRun should still point at the FIRST run (the highlight)
    expect(snap.lastRun?.challengeId).toBe(1)
  })

  test("a later course-best by another player becomes the new lastRun", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA, playerB],
      [
        ch(1, 100, 10, 1, null, null, "2026-04-01T10:00:00Z"), // 15pt CB+PB
        ch(2, 200, 10, 2, null, null, "2026-04-01T10:01:00Z"), // 20pt CB+PB (overwrites)
      ],
    )
    expect(snap.lastRun?.challengeId).toBe(2)
    expect(snap.lastRun?.player.id).toBe(200)
    expect(snap.lastRun?.isCourseBest).toBe(true)
  })

  test("personal-best for non-leader is still a highlight", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA, playerB],
      [
        ch(1, 200, 10, 2, null, null, "2026-04-01T10:00:00Z"), // playerB: 20 PB+CB
        ch(2, 100, 10, 1, null, null, "2026-04-01T10:01:00Z"), // playerA: 15 PB only
      ],
    )
    expect(snap.lastRun?.challengeId).toBe(2)
    expect(snap.lastRun?.isPersonalBest).toBe(true)
    expect(snap.lastRun?.isCourseBest).toBe(false)
  })

  test("zero-point attempt is not a highlight", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA],
      [ch(1, 100, 10, 0)], // 0 missions completed → 0pt
    )
    expect(snap.lastRun).toBeNull()
  })
})

describe("assembleSnapshot — playerDetails", () => {
  test("aggregates per-course best, attempts, and totalPoint", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA, courseB],
      [playerA],
      [
        ch(1, 100, 10, 1), // 15pt
        ch(2, 100, 10, 2), // 20pt (better)
        ch(3, 100, 20, 2), // 20pt
      ],
    )
    const d = snap.playerDetails[100]
    expect(d.totalPoint).toBe(40)
    expect(d.totalAttempts).toBe(3)
    expect(d.perCourse[10].bestPoint).toBe(20)
    expect(d.perCourse[10].bestReachedIndex).toBe(2)
    expect(d.perCourse[10].attempts).toBe(2)
    expect(d.perCourse[20].bestPoint).toBe(20)
  })

  test("rank reflects the leaderboard rank", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA, playerB],
      [
        ch(1, 100, 10, 1), // playerA: 15
        ch(2, 200, 10, 2), // playerB: 20
      ],
    )
    expect(snap.playerDetails[200].rank).toBe(1)
    expect(snap.playerDetails[100].rank).toBe(2)
  })

  test("rank is null for players who never scored", () => {
    const snap = assembleSnapshot(
      baseCompetition,
      [courseA],
      [playerA, playerB],
      [ch(1, 100, 10, 2)],
    )
    expect(snap.playerDetails[200].rank).toBeNull()
  })
})

describe("assembleSnapshot — masking", () => {
  test("masks player names when maskEnabled and within mask window", () => {
    const now = Date.now()
    const masked = assembleSnapshot(
      {
        ...baseCompetition,
        maskEnabled: true,
        maskMinutesBefore: 30,
        endDate: new Date(now + 5 * 60 * 1000), // ends in 5 min, mask started already
      },
      [courseA],
      [playerA],
      [ch(1, 100, 10, 2)],
    )
    expect(masked.board[0].player.name).toBe("???")
    expect(masked.board[0].player.bibNumber).toBeNull()
    expect(masked.masked).toBe(true)
  })

  test("does not mask when outside the mask window", () => {
    const now = Date.now()
    const open = assembleSnapshot(
      {
        ...baseCompetition,
        maskEnabled: true,
        maskMinutesBefore: 30,
        endDate: new Date(now + 60 * 60 * 1000), // 60 min away → no mask yet
      },
      [courseA],
      [playerA],
      [ch(1, 100, 10, 2)],
    )
    expect(open.board[0].player.name).toBe("選手A")
    expect(open.masked).toBe(false)
  })
})

describe("assembleSnapshot — course-out rule", () => {
  test("course-out:first with rule 'zero' nets to 0 for that attempt", () => {
    const courseZero: AssembleCourseRow = {
      ...courseA,
      courseOutRule: "zero",
    }
    const snap = assembleSnapshot(
      baseCompetition,
      [courseZero],
      [playerA],
      [ch(1, 100, 10, 2, null, "courseOut:first")],
    )
    // firstResult=2 normally yields 20pt, but the course-out:first detail
    // forces the first attempt to 0 under "zero" rule. retryResult is null
    // so total is 0.
    expect(snap.lastRun).toBeNull()
    expect(snap.board).toEqual([])
  })
})
