import { describe, expect, test } from "bun:test"
import {
  calcPoint,
  getMissionProgress,
  pointEntryValue,
  totalPossiblePoints,
} from "@/lib/scoring/scoring"

describe("pointEntryValue", () => {
  test("returns number for scalar entry", () => {
    expect(pointEntryValue(5)).toBe(5)
  })

  test("returns first element for tier array", () => {
    expect(pointEntryValue([20, 10, 5])).toBe(20)
  })

  test("returns 0 for null", () => {
    expect(pointEntryValue(null)).toBe(0)
  })

  test("returns 0 for empty tier array", () => {
    expect(pointEntryValue([])).toBe(0)
  })
})

describe("totalPossiblePoints", () => {
  test("sums all entries", () => {
    // [start=0, goal=10, mission1=5, mission2=5]
    expect(totalPossiblePoints([0, 10, 5, 5])).toBe(20)
  })

  test("handles tier arrays (uses first tier value)", () => {
    expect(totalPossiblePoints([0, 10, [20, 10, 5]])).toBe(30)
  })

  test("handles null entries as 0", () => {
    expect(totalPossiblePoints([null, 10, null])).toBe(10)
  })

  test("returns 0 for empty array", () => {
    expect(totalPossiblePoints([])).toBe(0)
  })
})

describe("calcPoint", () => {
  // pointState: [start=0, goal=10, mission1=5, mission2=5]
  const pointState = [0, 10, 5, 5]

  test("returns 0 for null index", () => {
    expect(calcPoint(pointState, null)).toBe(0)
  })

  test("returns start value for index 0 (no missions completed)", () => {
    expect(calcPoint(pointState, 0)).toBe(0)
  })

  test("returns start + mission1 for index 1", () => {
    expect(calcPoint(pointState, 1)).toBe(5)
  })

  test("adds goal bonus when last mission completed", () => {
    // index 2 = both missions done, goal bonus added
    expect(calcPoint(pointState, 2)).toBe(20) // 0 + 5 + 5 + 10(goal)
  })
})

describe("getMissionProgress", () => {
  test("returns correct progress mid-course", () => {
    const result = getMissionProgress(5, 3, false)
    expect(result.completed).toBe(3)
    expect(result.total).toBe(5)
    expect(result.percent).toBe(60)
  })

  test("returns 100% when goal reached", () => {
    const result = getMissionProgress(5, 5, true)
    expect(result.completed).toBe(5)
    expect(result.percent).toBe(100)
  })

  test("handles 0 missions", () => {
    const result = getMissionProgress(0, 0, false)
    expect(result.percent).toBe(0)
  })
})
