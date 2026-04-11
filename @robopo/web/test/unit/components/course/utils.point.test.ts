import { describe, expect, test } from "bun:test"
import { calcPoint } from "@/app/components/challenge/utils"
import {
  deserializePoint,
  type PointState,
  serializePoint,
} from "@/app/components/course/utils"
import { isCompletedCourse } from "@/app/components/summary/utils"

describe("serializePoint / deserializePoint", () => {
  test("round-trip scalar points", () => {
    const original: PointState = [0, 10, 5, 5]
    const serialized = serializePoint(original)
    const deserialized = deserializePoint(serialized)
    expect(deserialized).toEqual(original)
  })

  test("round-trip with null values", () => {
    const original: PointState = [0, null, 5, null]
    const serialized = serializePoint(original)
    const deserialized = deserializePoint(serialized)
    expect(deserialized).toEqual(original)
  })

  test("round-trip tier arrays", () => {
    const original: PointState = [0, 10, [20, 10, 5, 3, 0, -5], 5]
    const serialized = serializePoint(original)
    expect(serialized).toBe("0;10;(20,10,5,3,0,-5);5")
    const deserialized = deserializePoint(serialized)
    expect(deserialized).toEqual(original)
  })

  test("round-trip mixed scalar and tier", () => {
    const original: PointState = [0, 20, 1, [10, 5, 0], 2, [3, -5]]
    const serialized = serializePoint(original)
    const deserialized = deserializePoint(serialized)
    expect(deserialized).toEqual(original)
  })

  test("deserializePoint returns empty array for null/empty", () => {
    expect(deserializePoint(null)).toEqual([])
    expect(deserializePoint("")).toEqual([])
  })

  test("deserializePoint handles legacy scalar-only format", () => {
    const result = deserializePoint("0;10;5;5")
    expect(result).toEqual([0, 10, 5, 5])
  })
})

describe("calcPoint", () => {
  test("calculates scalar points correctly", () => {
    // pointState: [start=0, goal=10, mission1=5, mission2=5]
    const pointState: PointState = [0, 10, 5, 5]
    expect(calcPoint(pointState, 0)).toBe(0) // no missions completed
    expect(calcPoint(pointState, 1)).toBe(5) // 1 mission
    expect(calcPoint(pointState, 2)).toBe(20) // 2 missions + goal bonus
  })

  test("returns 0 for null index", () => {
    expect(calcPoint([0, 10, 5], null)).toBe(0)
  })

  test("uses first tier value for tier entries", () => {
    // pointState: [start=0, goal=10, mission1=[20,10,5], mission2=5]
    const pointState: PointState = [0, 10, [20, 10, 5], 5]
    // calcPoint defaults to first tier value (20)
    expect(calcPoint(pointState, 1)).toBe(20)
    expect(calcPoint(pointState, 2)).toBe(35) // 20 + 5 + 10(goal)
  })

  test("handles negative point values", () => {
    const pointState: PointState = [0, 0, 5, -5]
    expect(calcPoint(pointState, 2)).toBe(0) // 5 + (-5)
  })
})

describe("isCompletedCourse", () => {
  test("returns true when all points earned", () => {
    const pointData: PointState = [0, 10, 5, 5]
    // result=2 means 2 missions completed (last mission index)
    expect(isCompletedCourse(pointData, 2)).toBe(true)
  })

  test("returns false when not all missions completed", () => {
    const pointData: PointState = [0, 10, 5, 5]
    expect(isCompletedCourse(pointData, 1)).toBe(false)
  })

  test("handles tier points (uses first tier for total)", () => {
    const pointData: PointState = [0, 10, [20, 10, 5], 5]
    // Total = 0 + 10 + 20 + 5 = 35
    // calcPoint(pointData, 2) = 0 + 20 + 5 + 10(goal) = 35
    expect(isCompletedCourse(pointData, 2)).toBe(true)
  })
})
