import { describe, expect, test } from "bun:test"
import { initializeField } from "@/lib/course/field"
import { computeRobotPreview } from "@/lib/course/robot-position"
import type { FieldState, MissionState } from "@/lib/course/types"

function withStart(row: number, col: number): FieldState {
  const field = initializeField()
  field[row][col] = "start"
  return field
}

const field = withStart(2, 2)
// start facing up, goal facing right: forward 1, turn right 90, forward 1
const mission: MissionState = ["u", "r", "mf", 1, "tr", 90, "mf", 1]

describe("computeRobotPreview", () => {
  test("returns null without a start panel or missions", () => {
    expect(computeRobotPreview(initializeField(), mission, 0)).toBeNull()
    expect(computeRobotPreview(field, [], 0)).toBeNull()
  })

  test("returns null when nothing is selected", () => {
    expect(computeRobotPreview(field, mission, null)).toBeNull()
  })

  test("-2 previews the robot on the start panel facing the start direction", () => {
    expect(computeRobotPreview(field, mission, -2)).toEqual({
      row: 2,
      col: 2,
      direction: "u",
    })
  })

  test("-2 returns null when the start direction is unset", () => {
    expect(computeRobotPreview(field, [null, null, "mf", 1], -2)).toBeNull()
  })

  test("selected move mission includes the after position", () => {
    expect(computeRobotPreview(field, mission, 0)).toEqual({
      row: 2,
      col: 2,
      direction: "u",
      afterRow: 1,
      afterCol: 2,
      afterAngle: 0,
    })
  })

  test("selected turn mission rotates the after angle", () => {
    const preview = computeRobotPreview(field, mission, 1)
    expect(preview).toEqual({
      row: 1,
      col: 2,
      direction: "u",
      afterRow: 1,
      afterCol: 2,
      afterAngle: 90,
    })
  })

  test("left turn subtracts from the angle", () => {
    const left: MissionState = ["r", "u", "tl", 90]
    expect(computeRobotPreview(field, left, 0)?.afterAngle).toBe(0)
  })

  test("later missions start from the accumulated position", () => {
    expect(computeRobotPreview(field, mission, 2)).toEqual({
      row: 1,
      col: 2,
      direction: "r",
      afterRow: 1,
      afterCol: 3,
      afterAngle: 90,
    })
  })

  test("unconfigured mission returns only the current position", () => {
    const partial: MissionState = ["u", "r", "mf", 1, null, null]
    expect(computeRobotPreview(field, partial, 1)).toEqual({
      row: 1,
      col: 2,
      direction: "u",
    })
  })

  test("returns null for an index past the last mission", () => {
    expect(computeRobotPreview(field, mission, 3)).toBeNull()
  })

  test("-3 previews the final position after all missions", () => {
    expect(computeRobotPreview(field, mission, -3)).toEqual({
      row: 1,
      col: 3,
      direction: "r",
    })
  })

  test("-3 returns null when there are no mission pairs", () => {
    expect(computeRobotPreview(field, ["u", "r"], -3)).toBeNull()
  })
})
