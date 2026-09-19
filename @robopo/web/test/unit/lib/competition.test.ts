import { afterEach, describe, expect, setSystemTime, test } from "bun:test"
import {
  getCompetitionStatus,
  isCompetitionActive,
  MASK_MINUTES_DEFAULT,
  MASK_MINUTES_MAX,
  MASK_MINUTES_MIN,
  normalizeMaskMinutesBefore,
} from "@/lib/competition"

const START = new Date("2026-09-19T10:00:00+09:00")
const END = new Date("2026-09-19T12:00:00+09:00")

afterEach(() => {
  // Reset the mocked clock
  setSystemTime()
})

describe("getCompetitionStatus", () => {
  test("returns 'unknown' when either date is missing", () => {
    expect(getCompetitionStatus({ startDate: null, endDate: END })).toBe(
      "unknown",
    )
    expect(getCompetitionStatus({ startDate: START, endDate: null })).toBe(
      "unknown",
    )
    expect(getCompetitionStatus({ startDate: null, endDate: null })).toBe(
      "unknown",
    )
  })

  test("returns 'before' when now is before the start", () => {
    setSystemTime(new Date("2026-09-19T09:59:00+09:00"))
    expect(getCompetitionStatus({ startDate: START, endDate: END })).toBe(
      "before",
    )
  })

  test("returns 'active' inside the range, inclusive of both ends", () => {
    setSystemTime(START)
    expect(getCompetitionStatus({ startDate: START, endDate: END })).toBe(
      "active",
    )
    setSystemTime(new Date("2026-09-19T11:00:00+09:00"))
    expect(getCompetitionStatus({ startDate: START, endDate: END })).toBe(
      "active",
    )
    setSystemTime(END)
    expect(getCompetitionStatus({ startDate: START, endDate: END })).toBe(
      "active",
    )
  })

  test("returns 'ended' when now is after the end", () => {
    setSystemTime(new Date("2026-09-19T12:00:01+09:00"))
    expect(getCompetitionStatus({ startDate: START, endDate: END })).toBe(
      "ended",
    )
  })
})

describe("isCompetitionActive", () => {
  test("is true only for the 'active' status", () => {
    setSystemTime(new Date("2026-09-19T11:00:00+09:00"))
    expect(isCompetitionActive({ startDate: START, endDate: END })).toBe(true)
    setSystemTime(new Date("2026-09-19T13:00:00+09:00"))
    expect(isCompetitionActive({ startDate: START, endDate: END })).toBe(false)
    expect(isCompetitionActive({ startDate: null, endDate: END })).toBe(false)
  })
})

describe("normalizeMaskMinutesBefore", () => {
  test("keeps in-range integers", () => {
    expect(normalizeMaskMinutesBefore(15)).toBe(15)
    expect(normalizeMaskMinutesBefore("45")).toBe(45)
  })

  test("floors fractional values", () => {
    expect(normalizeMaskMinutesBefore(12.9)).toBe(12)
  })

  test("clamps to [MIN, MAX]", () => {
    expect(normalizeMaskMinutesBefore(0)).toBe(MASK_MINUTES_MIN)
    expect(normalizeMaskMinutesBefore(-5)).toBe(MASK_MINUTES_MIN)
    expect(normalizeMaskMinutesBefore(5000)).toBe(MASK_MINUTES_MAX)
  })

  test("falls back to the default for non-numeric input", () => {
    expect(normalizeMaskMinutesBefore(undefined)).toBe(MASK_MINUTES_DEFAULT)
    expect(normalizeMaskMinutesBefore(null)).toBe(MASK_MINUTES_DEFAULT)
    expect(normalizeMaskMinutesBefore("")).toBe(MASK_MINUTES_DEFAULT)
    expect(normalizeMaskMinutesBefore("abc")).toBe(MASK_MINUTES_DEFAULT)
    expect(normalizeMaskMinutesBefore(Number.NaN)).toBe(MASK_MINUTES_DEFAULT)
    expect(normalizeMaskMinutesBefore(Number.POSITIVE_INFINITY)).toBe(
      MASK_MINUTES_DEFAULT,
    )
  })
})
