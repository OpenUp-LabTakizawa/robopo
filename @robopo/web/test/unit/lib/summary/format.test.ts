import { describe, expect, test } from "bun:test"
import { formatTimestamp, isCompletedCourse } from "@/lib/summary/format"

describe("formatTimestamp", () => {
  test("formats valid ISO timestamp", () => {
    const result = formatTimestamp("2024-07-20T14:30:00")
    expect(result).toMatch(/2024-07-20 \d{2}:30:00/)
  })

  test("returns '-' for null", () => {
    expect(formatTimestamp(null)).toBe("-")
  })

  test("returns '-' for empty string", () => {
    expect(formatTimestamp("")).toBe("-")
  })

  test("returns '-' for invalid date string", () => {
    expect(formatTimestamp("not-a-date")).toBe("-")
  })
})

describe("isCompletedCourse", () => {
  // pointState: [start=0, goal=10, mission1=5, mission2=5] = total 20
  const pointState = [0, 10, 5, 5]

  test("returns true when course is completed", () => {
    // result=2 means both missions done → 0+5+5+10=20 = totalPossible
    expect(isCompletedCourse(pointState, 2)).toBe(true)
  })

  test("returns false when course is not completed", () => {
    expect(isCompletedCourse(pointState, 1)).toBe(false)
    expect(isCompletedCourse(pointState, 0)).toBe(false)
  })

  test("returns false for null result", () => {
    expect(isCompletedCourse(pointState, null)).toBe(false)
  })
})
