import { describe, expect, test } from "bun:test"
import type { PointState } from "@/lib/course/types"
import { COURSE_OUT_FIRST, COURSE_OUT_RETRY } from "@/lib/scoring/course-out"
import {
  applyPenalty,
  attemptPoints,
  type ChallengeResult,
  maxPointFromResults,
  sumPointsFromResults,
} from "@/lib/summary/calculations"

// [start=0, goal=10, mission1=5, mission2=5]
// result 0 → 0, result 1 → 5, result 2 → 5+5+10 = 20
const pointState: PointState = [0, 10, 5, 5]

function row(
  firstResult: number,
  retryResult: number | null = null,
  detail: string | null = null,
): ChallengeResult {
  return { firstResult, retryResult, detail }
}

describe("applyPenalty", () => {
  test("no detail leaves the score untouched", () => {
    expect(applyPenalty(20, "zero", null, "first")).toBe(20)
  })

  test("only the matching attempt is penalised", () => {
    expect(applyPenalty(20, "zero", COURSE_OUT_FIRST, "first")).toBe(0)
    expect(applyPenalty(20, "zero", COURSE_OUT_FIRST, "retry")).toBe(20)
    expect(applyPenalty(20, "zero", COURSE_OUT_RETRY, "retry")).toBe(0)
    expect(applyPenalty(20, "zero", COURSE_OUT_RETRY, "first")).toBe(20)
  })

  test("applies keep / zero / penalty rules", () => {
    expect(applyPenalty(20, "keep", COURSE_OUT_FIRST, "first")).toBe(20)
    expect(applyPenalty(20, "zero", COURSE_OUT_FIRST, "first")).toBe(0)
    expect(applyPenalty(20, "penalty:5", COURSE_OUT_FIRST, "first")).toBe(15)
    expect(applyPenalty(3, "penalty:5", COURSE_OUT_FIRST, "first")).toBe(0)
  })

  test("unrelated detail text is not a course-out", () => {
    expect(applyPenalty(20, "zero", "some note", "first")).toBe(20)
  })
})

describe("attemptPoints", () => {
  test("retry is null when the row has no retry", () => {
    expect(attemptPoints(row(2), pointState, "keep")).toEqual({
      first: 20,
      retry: null,
    })
  })

  test("scores both attempts", () => {
    expect(attemptPoints(row(1, 2), pointState, "keep")).toEqual({
      first: 5,
      retry: 20,
    })
  })

  test("penalises the course-out attempt only", () => {
    expect(
      attemptPoints(row(2, 1, COURSE_OUT_FIRST), pointState, "zero"),
    ).toEqual({ first: 0, retry: 5 })
    expect(
      attemptPoints(row(2, 1, COURSE_OUT_RETRY), pointState, "zero"),
    ).toEqual({ first: 20, retry: 0 })
  })
})

describe("sumPointsFromResults", () => {
  test("is 0 for no results", () => {
    expect(sumPointsFromResults([], pointState, "keep")).toBe(0)
  })

  test("adds first and retry attempts across rows", () => {
    const results = [row(1), row(2, 1), row(0, 2)]
    // 5 + (20 + 5) + (0 + 20)
    expect(sumPointsFromResults(results, pointState, "keep")).toBe(50)
  })

  test("applies the course-out rule per attempt", () => {
    const results = [row(2, 2, COURSE_OUT_FIRST), row(2, 2, COURSE_OUT_RETRY)]
    // (20-5 + 20) + (20 + 20-5)
    expect(sumPointsFromResults(results, pointState, "penalty:5")).toBe(70)
  })
})

describe("maxPointFromResults", () => {
  test("is 0 for no results", () => {
    expect(maxPointFromResults([], pointState, "keep")).toBe(0)
  })

  test("returns the best single attempt", () => {
    const results = [row(1), row(1, 2), row(0)]
    expect(maxPointFromResults(results, pointState, "keep")).toBe(20)
  })

  test("a penalised attempt can no longer be the best", () => {
    const results = [row(2, null, COURSE_OUT_FIRST), row(1)]
    expect(maxPointFromResults(results, pointState, "zero")).toBe(5)
  })

  test("never returns a negative score", () => {
    const negative: PointState = [-10, 0, 0]
    expect(maxPointFromResults([row(1)], negative, "keep")).toBe(0)
  })
})
