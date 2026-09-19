import { describe, expect, test } from "bun:test"
import { renderHook } from "@testing-library/react"
import {
  useCourseValidation,
  validateCourse,
} from "@/hooks/useCourseValidation"
import { initializeField } from "@/lib/course/field"
import type { FieldState, MissionState, PanelValue } from "@/lib/course/types"

function fieldFrom(rows: string[]): FieldState {
  const map: Record<string, PanelValue> = {
    S: "start",
    G: "goal",
    R: "route",
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

const validField = fieldFrom(["SRG.."])
const validMission: MissionState = ["r", "r", "mf", 2]

function run(
  overrides: Partial<{
    field: FieldState
    mission: MissionState
    name: string
    nameError: string
  }> = {},
) {
  return validateCourse({
    field: validField,
    mission: validMission,
    name: "course",
    nameError: "",
    ...overrides,
  })
}

describe("validateCourse", () => {
  test("a complete course can be saved", () => {
    const result = run()
    expect(result.canSave).toBe(true)
    expect(result.saveBlockMessage).toBeNull()
    expect(result.hasStart).toBe(true)
    expect(result.hasGoal).toBe(true)
    expect(result.isolatedPanels.size).toBe(0)
    expect(result.invalidMissionMap.size).toBe(0)
  })

  test("reports missing start and goal together", () => {
    const result = run({ field: fieldFrom(["RR..."]) })
    expect(result.canSave).toBe(false)
    expect(result.saveBlockMessage).toBe(
      "スタートとゴールパネルを配置してください",
    )
  })

  test("reports a missing start panel", () => {
    expect(run({ field: fieldFrom(["RRG.."]) }).saveBlockMessage).toBe(
      "スタートパネルを配置してください",
    )
  })

  test("reports a missing goal panel", () => {
    expect(run({ field: fieldFrom(["SRR.."]) }).saveBlockMessage).toBe(
      "ゴールパネルを配置してください",
    )
  })

  test("requires a non-blank name", () => {
    expect(run({ name: "   " }).saveBlockMessage).toBe(
      "コース名を入力してください",
    )
  })

  test("surfaces the name error message", () => {
    const result = run({ nameError: "重複しています" })
    expect(result.canSave).toBe(false)
    expect(result.saveBlockMessage).toBe("重複しています")
  })

  test("reports isolated panels", () => {
    const result = run({ field: fieldFrom(["SRG..", "....R"]) })
    expect(result.isolatedPanels.has("1-4")).toBe(true)
    expect(result.saveBlockMessage).toBe("接続されていないパネルがあります")
  })

  test("requires the start direction", () => {
    expect(run({ mission: [null, "r", "mf", 2] }).saveBlockMessage).toBe(
      "スタートの向きを選択してください",
    )
  })

  test("requires at least one mission", () => {
    expect(run({ mission: ["r", "r"] }).saveBlockMessage).toBe(
      "ミッションを追加してください",
    )
  })

  test("requires every mission to be configured", () => {
    expect(
      run({ mission: ["r", "r", "mf", 2, null, null] }).saveBlockMessage,
    ).toBe("未設定のミッションがあります")
  })

  test("reports invalid missions", () => {
    const result = run({ mission: ["r", "r", "mf", 1] })
    expect(result.invalidMissionMap.get(0)).toBe("not-at-goal")
    expect(result.saveBlockMessage).toBe("無効なミッションがあります")
  })

  test("skips mission validation until both start and goal exist", () => {
    const result = run({
      field: fieldFrom(["SR..."]),
      mission: ["r", "r", "mf", 5],
    })
    expect(result.invalidMissionMap.size).toBe(0)
  })
})

describe("useCourseValidation", () => {
  test("returns the same result as validateCourse", () => {
    const input = {
      field: validField,
      mission: validMission,
      name: "course",
      nameError: "",
    }
    const { result } = renderHook(() => useCourseValidation(input))
    expect(result.current.canSave).toBe(true)
    expect(result.current.saveBlockMessage).toBeNull()
  })
})
