import { describe, expect, test } from "bun:test"
import {
  deserializeMission,
  getMissionParameterUnit,
  getNextPosition,
  getRobotPosition,
  missionStatePair,
  serializeMission,
} from "@/lib/course/mission"

describe("getMissionParameterUnit", () => {
  test("returns 'パネル' for forward/backward missions", () => {
    expect(getMissionParameterUnit("mf")).toBe("パネル")
    expect(getMissionParameterUnit("mb")).toBe("パネル")
  })

  test("returns '度' for turn missions", () => {
    expect(getMissionParameterUnit("tr")).toBe("度")
    expect(getMissionParameterUnit("tl")).toBe("度")
  })

  test("returns empty string for pause", () => {
    expect(getMissionParameterUnit("ps")).toBe("")
  })

  test("returns '-' for direction values", () => {
    expect(getMissionParameterUnit("u")).toBe("-")
    expect(getMissionParameterUnit("r")).toBe("-")
  })
})

describe("serializeMission / deserializeMission", () => {
  test("round-trips mission state", () => {
    const state = ["u", "d", "mf", 1, "tr", 90]
    const serialized = serializeMission(state)
    const deserialized = deserializeMission(serialized)
    expect(deserialized).toEqual(["u", "d", "mf", "1", "tr", "90"])
  })

  test("handles null values", () => {
    const state = [null, "u", null]
    const serialized = serializeMission(state)
    expect(serialized).toBe("null;u;null")
    const deserialized = deserializeMission(serialized)
    expect(deserialized).toEqual([null, "u", null])
  })

  test("handles empty mission state", () => {
    const serialized = serializeMission([])
    expect(serialized).toBe("")
  })
})

describe("missionStatePair", () => {
  test("returns pairs from index 2 onwards", () => {
    // [startDir, goalDir, mission1, param1, mission2, param2]
    const state = ["u", "d", "mf", 1, "tr", 90]
    const pairs = missionStatePair(state)
    expect(pairs).toEqual([
      ["mf", 1],
      ["tr", 90],
    ])
  })

  test("returns empty array for short state (<=2)", () => {
    expect(missionStatePair(["u", "d"])).toEqual([])
    expect(missionStatePair(["u"])).toEqual([])
    expect(missionStatePair([])).toEqual([])
  })

  test("handles odd-length state (last pair has null)", () => {
    const state = ["u", "d", "mf", 1, "tr"]
    const pairs = missionStatePair(state)
    expect(pairs).toEqual([
      ["mf", 1],
      ["tr", null],
    ])
  })
})

describe("getNextPosition", () => {
  test("moves forward (up direction)", () => {
    const [row, col, dir] = getNextPosition(2, 2, "u", "mf", 1)
    expect(row).toBe(1)
    expect(col).toBe(2)
    expect(dir).toBe("u")
  })

  test("moves forward (right direction)", () => {
    const [row, col, dir] = getNextPosition(2, 2, "r", "mf", 2)
    expect(row).toBe(2)
    expect(col).toBe(4)
    expect(dir).toBe("r")
  })

  test("moves backward (up direction = moves down)", () => {
    const [row, col, dir] = getNextPosition(2, 2, "u", "mb", 1)
    expect(row).toBe(3)
    expect(col).toBe(2)
    expect(dir).toBe("u")
  })

  test("turns right 90 degrees from up", () => {
    const [row, col, dir] = getNextPosition(2, 2, "u", "tr", 90)
    expect(row).toBe(2)
    expect(col).toBe(2)
    expect(dir).toBe("r")
  })

  test("turns left 90 degrees from up", () => {
    const [row, col, dir] = getNextPosition(2, 2, "u", "tl", 90)
    expect(row).toBe(2)
    expect(col).toBe(2)
    expect(dir).toBe("l")
  })

  test("pause does not change position", () => {
    const [row, col, dir] = getNextPosition(2, 2, "u", "ps", 0)
    expect(row).toBe(2)
    expect(col).toBe(2)
    expect(dir).toBe("u")
  })
})

describe("getRobotPosition", () => {
  test("calculates position after multiple missions", () => {
    // Start at (2,0), facing up; mission: forward 1 panel
    const missionState = ["u", "u", "mf", 1, "mf", 1]
    const [row, col, dir] = getRobotPosition(2, 0, missionState, 2)
    expect(row).toBe(0)
    expect(col).toBe(0)
    expect(dir).toBe("u")
  })

  test("returns start position with 0 missions", () => {
    const missionState = ["u", "u", "mf", 1]
    const [row, col, dir] = getRobotPosition(3, 3, missionState, 0)
    expect(row).toBe(3)
    expect(col).toBe(3)
    expect(dir).toBe("u")
  })
})
