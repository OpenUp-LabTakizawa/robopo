import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db/db"
import {
  getChallengeCount,
  getCourseSummary,
  getFirstCount,
  getMaxResult,
  getPlayerByName,
  getPlayerResult,
  groupByJudge,
  groupByPlayer,
} from "@/lib/db/queries/queries"
import {
  challenge,
  competition,
  competitionCourse,
  competitionPlayer,
  course,
  player,
} from "@/lib/db/schema"

// Test data IDs (cleaned up in afterAll)
let testCompetitionId: number
let testCourseId: number
let testPlayerIds: number[] = []
let testChallengeIds: number[] = []

async function setupTestData() {
  // Clean up any leftover test data from previous runs
  const existing = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.name, "__test_query_course__"))
    .limit(1)
  if (existing.length > 0) {
    await db.delete(challenge).where(eq(challenge.courseId, existing[0].id))
    await db
      .delete(competitionCourse)
      .where(eq(competitionCourse.courseId, existing[0].id))
    await db.delete(course).where(eq(course.id, existing[0].id))
  }

  // Clean up leftover test players
  for (const pName of ["__test_player_A__", "__test_player_B__"]) {
    const existingPlayer = await db
      .select({ id: player.id })
      .from(player)
      .where(eq(player.name, pName))
      .limit(1)
    if (existingPlayer.length > 0) {
      await db.delete(player).where(eq(player.id, existingPlayer[0].id))
    }
  }

  // Clean up leftover test competition
  const existingComp = await db
    .select({ id: competition.id })
    .from(competition)
    .where(eq(competition.name, "__test_query_competition__"))
    .limit(1)
  if (existingComp.length > 0) {
    await db.delete(competition).where(eq(competition.id, existingComp[0].id))
  }

  // Create test course
  const [c] = await db
    .insert(course)
    .values({
      name: "__test_query_course__",
      fieldValid: true,
      missionValid: true,
    })
    .returning({ id: course.id })
  testCourseId = c.id

  // Create test competition
  const [comp] = await db
    .insert(competition)
    .values({ name: "__test_query_competition__" })
    .returning({ id: competition.id })
  testCompetitionId = comp.id

  // Create 2 test players
  const players = await db
    .insert(player)
    .values([{ name: "__test_player_A__" }, { name: "__test_player_B__" }])
    .returning({ id: player.id })
  testPlayerIds = players.map((p) => p.id)

  // Assign to competition
  await db.insert(competitionCourse).values({
    competitionId: testCompetitionId,
    courseId: testCourseId,
  })
  for (const pid of testPlayerIds) {
    await db.insert(competitionPlayer).values({
      competitionId: testCompetitionId,
      playerId: pid,
    })
  }

  // Create challenges for player A:
  // Challenge 1: firstResult=3, retryResult=null
  // Challenge 2: firstResult=5, retryResult=4  (max=5, first count should be 3: 1 from ch1 + 2 from ch2)
  // Challenge 3: firstResult=2, retryResult=null
  const challenges = await db
    .insert(challenge)
    .values([
      {
        firstResult: 3,
        retryResult: null,
        competitionId: testCompetitionId,
        courseId: testCourseId,
        playerId: testPlayerIds[0],
      },
      {
        firstResult: 5,
        retryResult: 4,
        competitionId: testCompetitionId,
        courseId: testCourseId,
        playerId: testPlayerIds[0],
      },
      {
        firstResult: 2,
        retryResult: null,
        competitionId: testCompetitionId,
        courseId: testCourseId,
        playerId: testPlayerIds[0],
      },
    ])
    .returning({ id: challenge.id })
  testChallengeIds = challenges.map((c) => c.id)
}

async function cleanupTestData() {
  if (testChallengeIds.length > 0) {
    for (const id of testChallengeIds) {
      await db.delete(challenge).where(eq(challenge.id, id))
    }
  }
  if (testPlayerIds.length > 0) {
    await db
      .delete(competitionPlayer)
      .where(eq(competitionPlayer.competitionId, testCompetitionId))
    for (const id of testPlayerIds) {
      await db.delete(player).where(eq(player.id, id))
    }
  }
  if (testCourseId) {
    await db
      .delete(competitionCourse)
      .where(eq(competitionCourse.competitionId, testCompetitionId))
    await db.delete(course).where(eq(course.id, testCourseId))
  }
  if (testCompetitionId) {
    await db.delete(competition).where(eq(competition.id, testCompetitionId))
  }
}

beforeAll(async () => {
  await setupTestData()
})

afterAll(async () => {
  await cleanupTestData()
})

describe("query helpers (integration)", () => {
  test("getMaxResult returns correct max across firstResult and retryResult", async () => {
    const result = await getMaxResult(
      testCompetitionId,
      testCourseId,
      testPlayerIds[0],
    )
    expect(result).toHaveLength(1)
    // Max is 5 (from challenge 2 result1)
    expect(Number(result[0].maxResult)).toBe(5)
  })

  test("getMaxResult returns empty for player with no challenges", async () => {
    const result = await getMaxResult(
      testCompetitionId,
      testCourseId,
      testPlayerIds[1],
    )
    expect(result).toHaveLength(0)
  })

  test("getFirstCount returns attempt count until max result", async () => {
    const result = await getFirstCount(
      testCompetitionId,
      testCourseId,
      testPlayerIds[0],
    )
    expect(result.length).toBeGreaterThanOrEqual(1)
    // Challenge 1: 1 attempt (result1 only), Challenge 2: 2 attempts (result1 + result2)
    // Max result (5) first appears in challenge 2, so firstCount = 1 + 2 = 3
    expect(Number(result[0].firstCount)).toBe(3)
  })

  test("getPlayerResult returns consistent maxResult and firstCount", async () => {
    const playerResult = await getPlayerResult(
      testCompetitionId,
      testCourseId,
      testPlayerIds[0],
    )
    const maxResult = await getMaxResult(
      testCompetitionId,
      testCourseId,
      testPlayerIds[0],
    )
    const firstCount = await getFirstCount(
      testCompetitionId,
      testCourseId,
      testPlayerIds[0],
    )

    expect(playerResult).toHaveLength(1)
    // maxResult should match getMaxResult
    expect(Number(playerResult[0].maxResult)).toBe(
      Number(maxResult[0].maxResult),
    )
    // firstCount should match getFirstCount
    expect(
      Number((playerResult[0] as Record<string, unknown>).firstCount),
    ).toBe(Number(firstCount[0].firstCount))
  })

  test("getCourseSummary returns data with firstMaxAttemptCount consistent with getFirstCount", async () => {
    const summary = await getCourseSummary(testCompetitionId, testCourseId)
    const playerSummary = summary.find((s) => s.playerId === testPlayerIds[0])
    expect(playerSummary).toBeDefined()

    const firstCount = await getFirstCount(
      testCompetitionId,
      testCourseId,
      testPlayerIds[0],
    )
    expect(Number(playerSummary?.firstMaxAttemptCount)).toBe(
      Number(firstCount[0].firstCount),
    )
  })

  test("getChallengeCount returns correct count", async () => {
    const result = await getChallengeCount(
      testCompetitionId,
      testCourseId,
      testPlayerIds[0],
    )
    expect(result).toHaveLength(1)
    // 3 challenges: ch1 has 1 attempt, ch2 has 2 attempts, ch3 has 1 attempt = 4
    expect(Number(result[0].challengeCount)).toBe(4)
  })
})

describe("getPlayerByName", () => {
  test("returns null when no player matches", async () => {
    const result = await getPlayerByName("__nonexistent_player__")
    expect(result).toBeNull()
  })

  test("returns the correct player when there is a match", async () => {
    const result = await getPlayerByName("__test_player_A__")
    expect(result).not.toBeNull()
    expect(result?.id).toBe(testPlayerIds[0])
  })

  test("honors excludeId when provided", async () => {
    const result = await getPlayerByName("__test_player_A__", testPlayerIds[0])
    expect(result).toBeNull()
  })

  test("returns match when excludeId is a different player", async () => {
    const result = await getPlayerByName("__test_player_A__", testPlayerIds[1])
    expect(result).not.toBeNull()
    expect(result?.id).toBe(testPlayerIds[0])
  })
})

describe("groupByPlayer", () => {
  test("groups rows by player and populates competitionIds", () => {
    const rows = [
      {
        id: 1,
        name: "Alice",
        furigana: null,
        bibNumber: null,
        note: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
      {
        id: 1,
        name: "Alice",
        furigana: null,
        bibNumber: null,
        note: null,
        createdAt: null,
        competitionId: 20,
        competitionName: "Comp B",
      },
      {
        id: 2,
        name: "Bob",
        furigana: null,
        bibNumber: null,
        note: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
    ]
    const result = groupByPlayer(rows)
    expect(result).toHaveLength(2)
    const alice = result.find((p) => p.id === 1)
    expect(alice).toBeDefined()
    expect(alice?.competitionIds).toEqual([10, 20])
    expect(alice?.competitionName).toEqual(["Comp A", "Comp B"])
    const bob = result.find((p) => p.id === 2)
    expect(bob).toBeDefined()
    expect(bob?.competitionIds).toEqual([10])
  })

  test("de-duplicates competitionIds", () => {
    const rows = [
      {
        id: 1,
        name: "Alice",
        furigana: null,
        bibNumber: null,
        note: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
      {
        id: 1,
        name: "Alice",
        furigana: null,
        bibNumber: null,
        note: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
    ]
    const result = groupByPlayer(rows)
    expect(result).toHaveLength(1)
    expect(result[0].competitionIds).toEqual([10])
    expect(result[0].competitionName).toEqual(["Comp A"])
  })

  test("handles null competition data", () => {
    const rows = [
      {
        id: 1,
        name: "Alice",
        furigana: null,
        bibNumber: null,
        note: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
      {
        id: 1,
        name: "Alice",
        furigana: null,
        bibNumber: null,
        note: null,
        createdAt: null,
        competitionId: null,
        competitionName: null,
      },
    ]
    const result = groupByPlayer(rows)
    expect(result).toHaveLength(1)
    expect(result[0].competitionIds).toEqual([10])
    expect(result[0].competitionName).toEqual(["Comp A"])
  })
})

describe("groupByJudge", () => {
  test("groups rows by judge and populates competitionIds", () => {
    const rows = [
      {
        id: 1,
        username: "judgeA",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
      {
        id: 1,
        username: "judgeA",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 20,
        competitionName: "Comp B",
      },
      {
        id: 2,
        username: "judgeB",
        userId: "u2",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
    ]
    const result = groupByJudge(rows)
    expect(result).toHaveLength(2)
    const judgeA = result.find((j) => j.id === 1)
    expect(judgeA).toBeDefined()
    expect(judgeA?.username).toBe("judgeA")
    expect(judgeA?.userId).toBe("u1")
    expect(judgeA?.lastLoginAt).toBeNull()
    expect(judgeA?.competitionIds).toEqual([10, 20])
    expect(judgeA?.competitionName).toEqual(["Comp A", "Comp B"])
    const judgeB = result.find((j) => j.id === 2)
    expect(judgeB?.username).toBe("judgeB")
    expect(judgeB?.userId).toBe("u2")
  })

  test("de-duplicates competitionIds", () => {
    const rows = [
      {
        id: 1,
        username: "judgeA",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
      {
        id: 1,
        username: "judgeA",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp A",
      },
    ]
    const result = groupByJudge(rows)
    expect(result).toHaveLength(1)
    expect(result[0].competitionIds).toEqual([10])
  })

  test("handles null competition data", () => {
    const rows = [
      {
        id: 1,
        username: "judgeA",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: null,
        competitionName: null,
      },
    ]
    const result = groupByJudge(rows)
    expect(result).toHaveLength(1)
    expect(result[0].competitionIds).toEqual([])
    expect(result[0].competitionName).toEqual([])
  })
})
