import { describe, expect, test } from "bun:test"
import {
  deserializeField,
  findGoal,
  findIsolatedPanels,
  findStart,
  getFieldBounds,
  initializeField,
  isGoal,
  isInBounds,
  isStart,
  putPanel,
  serializeField,
} from "@/lib/course/field"
import {
  type FieldState,
  MAX_FIELD_HEIGHT,
  MAX_FIELD_WIDTH,
  type PanelValue,
} from "@/lib/course/types"

// Build a field from a compact string grid: S=start G=goal R=route B=startGoal .=empty
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

describe("initializeField", () => {
  test("creates a MAX_FIELD_HEIGHT x MAX_FIELD_WIDTH grid of null", () => {
    const field = initializeField()
    expect(field).toHaveLength(MAX_FIELD_HEIGHT)
    for (const row of field) {
      expect(row).toHaveLength(MAX_FIELD_WIDTH)
      expect(row.every((p) => p === null)).toBe(true)
    }
  })

  test("rows are independent arrays", () => {
    const field = initializeField()
    field[0][0] = "start"
    expect(field[1][0]).toBeNull()
  })
})

describe("getFieldBounds", () => {
  test("returns the bounding box of non-null cells", () => {
    const field = fieldFrom([".....", ".SR..", "..RG.", "....."])
    expect(getFieldBounds(field)).toEqual({
      minR: 1,
      maxR: 2,
      minC: 1,
      maxC: 3,
    })
  })

  test("returns zeros for an empty field", () => {
    expect(getFieldBounds(initializeField())).toEqual({
      minR: 0,
      maxR: 0,
      minC: 0,
      maxC: 0,
    })
  })
})

describe("isStart / isGoal / findStart / findGoal", () => {
  test("detect separate start and goal panels", () => {
    const field = fieldFrom(["S....", "R....", "G...."])
    expect(isStart(field)).toBe(true)
    expect(isGoal(field)).toBe(true)
    expect(findStart(field)).toEqual([0, 0])
    expect(findGoal(field)).toEqual([2, 0])
  })

  test("startGoal counts as both start and goal", () => {
    const field = fieldFrom(["..B.."])
    expect(isStart(field)).toBe(true)
    expect(isGoal(field)).toBe(true)
    expect(findStart(field)).toEqual([0, 2])
    expect(findGoal(field)).toEqual([0, 2])
  })

  test("return false/null when absent", () => {
    const field = fieldFrom(["RR..."])
    expect(isStart(field)).toBe(false)
    expect(isGoal(field)).toBe(false)
    expect(findStart(field)).toBeNull()
    expect(findGoal(field)).toBeNull()
  })
})

describe("putPanel", () => {
  test("places a start panel anywhere on an empty field", () => {
    const next = putPanel(initializeField(), 2, 3, "start")
    expect(next?.[2][3]).toBe("start")
  })

  test("does not mutate the input field", () => {
    const field = initializeField()
    putPanel(field, 0, 0, "start")
    expect(field[0][0]).toBeNull()
  })

  test("rejects a second start panel", () => {
    const field = fieldFrom(["S...."])
    expect(putPanel(field, 4, 4, "start")).toBeNull()
  })

  test("route must be adjacent to an existing panel", () => {
    const field = fieldFrom(["S...."])
    expect(putPanel(field, 0, 1, "route")?.[0][1]).toBe("route")
    expect(putPanel(field, 1, 0, "route")?.[1][0]).toBe("route")
    expect(putPanel(field, 2, 2, "route")).toBeNull()
    // Diagonal is not adjacent
    expect(putPanel(field, 1, 1, "route")).toBeNull()
  })

  test("goal must be adjacent and unique", () => {
    const field = fieldFrom(["SR..."])
    expect(putPanel(field, 0, 2, "goal")?.[0][2]).toBe("goal")
    const withGoal = fieldFrom(["SRG.."])
    expect(putPanel(withGoal, 1, 0, "goal")).toBeNull()
  })

  test("placing goal on start creates startGoal", () => {
    const field = fieldFrom(["S...."])
    expect(putPanel(field, 0, 0, "goal")?.[0][0]).toBe("startGoal")
  })

  test("clicking an occupied cell removes the panel", () => {
    const field = fieldFrom(["SR..."])
    expect(putPanel(field, 0, 1, "route")?.[0][1]).toBeNull()
    expect(putPanel(field, 0, 0, "start")?.[0][0]).toBeNull()
  })

  test("adjacency check ignores out-of-bounds neighbours", () => {
    const field = fieldFrom(["....S"])
    expect(putPanel(field, 0, 3, "route")?.[0][3]).toBe("route")
  })
})

describe("serializeField / deserializeField", () => {
  test("round-trips a field", () => {
    const field = fieldFrom(["SR...", ".RG..", "B...."])
    const text = serializeField(field)
    expect(text.startsWith("start,route,null,null,null;")).toBe(true)
    expect(deserializeField(text)).toEqual(field)
  })

  test("pads smaller legacy layouts to the max size", () => {
    const field = deserializeField("start,route;null,goal")
    expect(field).toHaveLength(MAX_FIELD_HEIGHT)
    expect(field[0]).toHaveLength(MAX_FIELD_WIDTH)
    expect(field[0][0]).toBe("start")
    expect(field[0][1]).toBe("route")
    expect(field[1][1]).toBe("goal")
    expect(field[0][2]).toBeNull()
    expect(field[4][4]).toBeNull()
  })

  test("ignores cells beyond the max size", () => {
    const rows = Array(MAX_FIELD_HEIGHT + 2)
      .fill(
        Array(MAX_FIELD_WIDTH + 2)
          .fill("route")
          .join(","),
      )
      .join(";")
    const field = deserializeField(rows)
    expect(field).toHaveLength(MAX_FIELD_HEIGHT)
    expect(field[0]).toHaveLength(MAX_FIELD_WIDTH)
  })
})

describe("isInBounds", () => {
  const field = initializeField()

  test("inside", () => {
    expect(isInBounds(field, 0, 0)).toBe(true)
    expect(isInBounds(field, MAX_FIELD_HEIGHT - 1, MAX_FIELD_WIDTH - 1)).toBe(
      true,
    )
  })

  test("outside", () => {
    expect(isInBounds(field, -1, 0)).toBe(false)
    expect(isInBounds(field, 0, -1)).toBe(false)
    expect(isInBounds(field, MAX_FIELD_HEIGHT, 0)).toBe(false)
    expect(isInBounds(field, 0, MAX_FIELD_WIDTH)).toBe(false)
  })

  test("empty field has no in-bounds cells", () => {
    expect(isInBounds([], 0, 0)).toBe(false)
  })
})

describe("findIsolatedPanels", () => {
  test("returns empty set when every panel is reachable from start", () => {
    const field = fieldFrom(["SR...", ".R...", ".RG.."])
    expect(findIsolatedPanels(field).size).toBe(0)
  })

  test("returns panels not connected to start", () => {
    const field = fieldFrom(["SR...", ".....", "..RG."])
    expect([...findIsolatedPanels(field)].sort()).toEqual(["2-2", "2-3"])
  })

  test("everything is isolated when there is no start", () => {
    const field = fieldFrom(["RR...", "..G.."])
    expect([...findIsolatedPanels(field)].sort()).toEqual(["0-0", "0-1", "1-2"])
  })

  test("empty field yields empty set", () => {
    expect(findIsolatedPanels(initializeField()).size).toBe(0)
  })

  test("does not connect through diagonals", () => {
    const field = fieldFrom(["S....", ".R..."])
    expect([...findIsolatedPanels(field)]).toEqual(["1-1"])
  })
})
