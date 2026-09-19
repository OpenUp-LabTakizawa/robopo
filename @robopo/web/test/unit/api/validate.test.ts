import { describe, expect, test } from "bun:test"
import { sanitizeCompetitionIds } from "@/app/api/validate"

describe("sanitizeCompetitionIds", () => {
  test("returns null for non-arrays", () => {
    expect(sanitizeCompetitionIds(undefined)).toBeNull()
    expect(sanitizeCompetitionIds(null)).toBeNull()
    expect(sanitizeCompetitionIds(1)).toBeNull()
    expect(sanitizeCompetitionIds("1,2")).toBeNull()
    expect(sanitizeCompetitionIds({ length: 1 })).toBeNull()
  })

  test("keeps finite numbers only", () => {
    expect(
      sanitizeCompetitionIds([
        1,
        "2",
        null,
        Number.NaN,
        Number.POSITIVE_INFINITY,
        3,
      ]),
    ).toEqual([1, 3])
  })

  test("deduplicates while preserving first-seen order", () => {
    expect(sanitizeCompetitionIds([3, 1, 3, 2, 1])).toEqual([3, 1, 2])
  })

  test("empty array stays empty", () => {
    expect(sanitizeCompetitionIds([])).toEqual([])
  })
})
