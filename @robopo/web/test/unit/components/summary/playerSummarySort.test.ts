import { describe, expect, test } from "bun:test"
import {
  buildPlayerRowCells,
  comparePlayerSummary,
  matchesPlayerQuery,
} from "@/components/summary/playerSummarySort"
import type { CourseSummary } from "@/lib/summary/types"

// [start=0, goal=10, mission1=5, mission2=5]: completed when maxResult=2
const pointData = [0, 10, 5, 5]

function row(overrides: Partial<CourseSummary> = {}): CourseSummary {
  return {
    playerId: 1,
    playerName: "さくら",
    playerFurigana: "さくら",
    playerBibNumber: "3",
    firstAttemptTime: null,
    firstMaxAttemptCount: null,
    firstMaxAttemptTime: null,
    elapsedToComplete: null,
    elapsedToCompleteSeconds: null,
    lastAttemptTime: null,
    firstAttemptScore: null,
    averageScore: null,
    courseOutCount: null,
    retryCount: null,
    attemptCount: null,
    maxResult: null,
    totalPoint: null,
    sumPoint: null,
    pointRank: null,
    challengeCount: 0,
    challengeRank: null,
    ...overrides,
  }
}

describe("comparePlayerSummary", () => {
  test("furigana sorts with Japanese collation", () => {
    const a = row({ playerFurigana: "あ" })
    const b = row({ playerFurigana: "い" })
    expect(
      comparePlayerSummary(a, b, "playerFurigana", pointData),
    ).toBeLessThan(0)
  })

  test("bib numbers compare numerically when both are numeric", () => {
    const a = row({ playerBibNumber: "10" })
    const b = row({ playerBibNumber: "9" })
    expect(
      comparePlayerSummary(a, b, "playerBibNumber", pointData),
    ).toBeGreaterThan(0)
  })

  test("bib numbers fall back to natural string order", () => {
    const a = row({ playerBibNumber: "A-2" })
    const b = row({ playerBibNumber: "A-10" })
    expect(
      comparePlayerSummary(a, b, "playerBibNumber", pointData),
    ).toBeLessThan(0)
  })

  test("missing times sort last in ascending order", () => {
    const a = row({ firstAttemptTime: "2026-09-19T10:00:00" })
    const b = row({ firstAttemptTime: null })
    expect(
      comparePlayerSummary(a, b, "firstAttemptTime", pointData),
    ).toBeLessThan(0)
  })

  test("completion time only counts for completed players", () => {
    const done = row({
      maxResult: 2,
      firstMaxAttemptTime: "2026-09-19T10:00:00",
    })
    const notDone = row({
      maxResult: 1,
      firstMaxAttemptTime: "2026-09-19T09:00:00",
    })
    expect(
      comparePlayerSummary(done, notDone, "firstMaxAttemptTime", pointData),
    ).toBeLessThan(0)
  })

  test("completion count only counts for completed players", () => {
    const done = row({ maxResult: 2, firstMaxAttemptCount: 3 })
    const notDone = row({ maxResult: 1, firstMaxAttemptCount: 1 })
    expect(
      comparePlayerSummary(done, notDone, "firstMaxAttemptCount", pointData),
    ).toBeLessThan(0)
  })

  test("elapsed seconds treat null as slowest", () => {
    const a = row({ elapsedToCompleteSeconds: 30 })
    const b = row({ elapsedToCompleteSeconds: null })
    expect(
      comparePlayerSummary(a, b, "elapsedToComplete", pointData),
    ).toBeLessThan(0)
  })

  test("numeric columns compare directly with null as 0", () => {
    const a = row({ totalPoint: 20 })
    const b = row({ totalPoint: null })
    expect(comparePlayerSummary(a, b, "totalPoint", pointData)).toBe(20)
  })
})

describe("matchesPlayerQuery", () => {
  const r = row({
    playerName: "Sakura",
    playerFurigana: "さくら",
    playerBibNumber: "A-1",
  })

  test("matches everything for a blank query", () => {
    expect(matchesPlayerQuery(r, "   ")).toBe(true)
  })

  test("matches name, furigana and bib case-insensitively", () => {
    expect(matchesPlayerQuery(r, "saku")).toBe(true)
    expect(matchesPlayerQuery(r, "くら")).toBe(true)
    expect(matchesPlayerQuery(r, "a-1")).toBe(true)
    expect(matchesPlayerQuery(r, "zzz")).toBe(false)
  })
})

describe("buildPlayerRowCells", () => {
  test("uses '-' for missing values", () => {
    const cells = buildPlayerRowCells(row({ playerName: null }), pointData)
    expect(cells.name).toBe("-")
    expect(cells.firstScore).toBe("-")
    expect(cells.maxScore).toBe("-")
    expect(cells.averageScore).toBe("-")
    expect(cells.completionTime).toBeNull()
    expect(cells.elapsedToComplete).toBe("-")
    expect(cells.completionCount).toBe("-")
    expect(cells.courseOutCount).toBe(0)
    expect(cells.retryCount).toBe(0)
  })

  test("converts results to points", () => {
    const cells = buildPlayerRowCells(
      row({ firstAttemptScore: 1, maxResult: 2 }),
      pointData,
    )
    expect(cells.firstScore).toBe("5")
    expect(cells.maxScore).toBe("20")
  })

  test("a result of 0 still renders as a score", () => {
    expect(buildPlayerRowCells(row({ maxResult: 0 }), pointData).maxScore).toBe(
      "0",
    )
  })

  test("completion columns only show once the course was completed", () => {
    const base = {
      firstMaxAttemptTime: "2026-09-19T10:00:00",
      elapsedToComplete: "1分00秒",
      firstMaxAttemptCount: 2,
    }
    const done = buildPlayerRowCells(row({ ...base, maxResult: 2 }), pointData)
    expect(done.completionTime).toBe("2026-09-19T10:00:00")
    expect(done.elapsedToComplete).toBe("1分00秒")
    expect(done.completionCount).toBe("2")

    const notDone = buildPlayerRowCells(
      row({ ...base, maxResult: 1 }),
      pointData,
    )
    expect(notDone.completionTime).toBeNull()
    expect(notDone.elapsedToComplete).toBe("-")
    expect(notDone.completionCount).toBe("-")
  })
})
