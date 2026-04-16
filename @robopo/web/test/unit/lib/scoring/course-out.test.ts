import { describe, expect, test } from "bun:test"
import {
  applyCourseOutRule,
  parseCourseOutRule,
} from "@/lib/scoring/course-out"

describe("parseCourseOutRule", () => {
  test("parses 'keep' rule", () => {
    expect(parseCourseOutRule("keep")).toEqual({ type: "keep", penalty: 0 })
  })

  test("parses 'zero' rule", () => {
    expect(parseCourseOutRule("zero")).toEqual({ type: "zero", penalty: 0 })
  })

  test("parses 'penalty:N' rule", () => {
    expect(parseCourseOutRule("penalty:5")).toEqual({
      type: "penalty",
      penalty: 5,
    })
    expect(parseCourseOutRule("penalty:10")).toEqual({
      type: "penalty",
      penalty: 10,
    })
  })

  test("defaults to 'keep' for unknown rule", () => {
    expect(parseCourseOutRule("unknown")).toEqual({ type: "keep", penalty: 0 })
    expect(parseCourseOutRule("")).toEqual({ type: "keep", penalty: 0 })
  })

  test("handles invalid penalty value as 0", () => {
    expect(parseCourseOutRule("penalty:abc")).toEqual({
      type: "penalty",
      penalty: 0,
    })
  })
})

describe("applyCourseOutRule", () => {
  test("keep rule returns earned points unchanged", () => {
    expect(applyCourseOutRule(15, { type: "keep", penalty: 0 })).toBe(15)
  })

  test("zero rule returns 0", () => {
    expect(applyCourseOutRule(15, { type: "zero", penalty: 0 })).toBe(0)
  })

  test("penalty rule subtracts penalty from earned points", () => {
    expect(applyCourseOutRule(15, { type: "penalty", penalty: 5 })).toBe(10)
  })

  test("penalty rule does not go below 0", () => {
    expect(applyCourseOutRule(3, { type: "penalty", penalty: 10 })).toBe(0)
  })

  test("penalty rule with 0 earned points returns 0", () => {
    expect(applyCourseOutRule(0, { type: "penalty", penalty: 5 })).toBe(0)
  })
})
