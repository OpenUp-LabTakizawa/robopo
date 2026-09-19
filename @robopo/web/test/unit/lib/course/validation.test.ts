import { describe, expect, test } from "bun:test"
import { initializeField } from "@/lib/course/field"
import type { FieldState, MissionState, PanelValue } from "@/lib/course/types"
import { checkValidity, validateMissions } from "@/lib/course/validation"

function fieldFrom(rows: string[]): FieldState {
  const map: Record<string, PanelValue> = {
    S: "start",
    G: "goal",
    R: "route",
    B: "startGoal",
    ".": null,
  }
  const field = initializeField()
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      field[r][c] = map[row[c]]
    }
  })
  return field
}

// Straight 3-panel course: start (0,0) → route (0,1) → goal (0,2)
const straight = fieldFrom(["SRG.."])

describe("validateMissions", () => {
  test("valid straight course has no errors", () => {
    const mission: MissionState = ["r", "r", "mf", 2]
    expect(validateMissions(straight, mission).size).toBe(0)
  })

  test("returns empty map when start, goal or start direction is missing", () => {
    expect(
      validateMissions(fieldFrom(["RRG.."]), ["r", "r", "mf", 2]).size,
    ).toBe(0)
    expect(
      validateMissions(fieldFrom(["SRR.."]), ["r", "r", "mf", 2]).size,
    ).toBe(0)
    expect(validateMissions(straight, [null, "r", "mf", 2]).size).toBe(0)
  })

  test("returns empty map when there are no mission pairs", () => {
    expect(validateMissions(straight, ["r", "r"]).size).toBe(0)
  })

  test("flags a move that leaves the course as off-course", () => {
    const mission: MissionState = ["r", "r", "mf", 3]
    const result = validateMissions(straight, mission)
    expect(result.get(0)).toBe("off-course")
  })

  test("flags a move that steps through an empty cell as off-course", () => {
    // Robot faces down from start; (1,0) is empty
    const mission: MissionState = ["d", "r", "mf", 1]
    expect(validateMissions(straight, mission).get(0)).toBe("off-course")
  })

  test("flags the last mission when the robot does not end on goal", () => {
    const mission: MissionState = ["r", "r", "mf", 1]
    expect(validateMissions(straight, mission).get(0)).toBe("not-at-goal")
  })

  test("does not check the goal until every mission is configured", () => {
    const mission: MissionState = ["r", "r", "mf", 1, null, null]
    expect(validateMissions(straight, mission).size).toBe(0)
  })

  test("flags later missions whose starting cell is off the course", () => {
    // First move goes off course, so the second mission starts off-course too
    const mission: MissionState = ["r", "r", "mf", 3, "tr", 90]
    const result = validateMissions(straight, mission)
    expect(result.get(0)).toBe("off-course")
    expect(result.get(1)).toBe("off-course")
  })

  test("turn missions keep the robot in place", () => {
    // S(0,0) R(0,1) R(0,2)
    //             G(1,2)
    const field = fieldFrom(["SRR..", "..G.."])
    const mission: MissionState = ["r", "d", "mf", 2, "tr", 90, "mf", 1]
    expect(validateMissions(field, mission).size).toBe(0)
  })

  test("startGoal course must return to the start", () => {
    const field = fieldFrom(["BR..."])
    const ok: MissionState = ["r", "l", "mf", 1, "mb", 1]
    expect(validateMissions(field, ok).size).toBe(0)
    const notBack: MissionState = ["r", "l", "mf", 1]
    expect(validateMissions(field, notBack).get(0)).toBe("not-at-goal")
  })

  test("pause missions are allowed anywhere on the course", () => {
    const mission: MissionState = ["r", "r", "ps", "", "mf", 2]
    expect(validateMissions(straight, mission).size).toBe(0)
  })
})

describe("checkValidity", () => {
  test("true for a fully configured valid course", () => {
    expect(checkValidity(straight, ["r", "r", "mf", 2])).toBe(true)
  })

  test("false when there are no missions", () => {
    expect(checkValidity(straight, ["r", "r"])).toBe(false)
  })

  test("false when a mission is unconfigured", () => {
    expect(checkValidity(straight, ["r", "r", null, null])).toBe(false)
  })

  test("false when a mission is invalid", () => {
    expect(checkValidity(straight, ["r", "r", "mf", 1])).toBe(false)
  })
})
