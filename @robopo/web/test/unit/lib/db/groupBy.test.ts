import { describe, expect, test } from "bun:test"
import {
  groupByCourse,
  groupByPlayer,
  groupByUmpire,
} from "@/app/lib/db/queries/queries"

describe("groupByPlayer", () => {
  test("groups flat rows by player id and collects competition names", () => {
    const result = groupByPlayer([
      {
        id: 1,
        name: "A",
        furigana: "ア",
        zekken: "001",
        competitionId: 10,
        competitionName: "Comp1",
      },
      {
        id: 1,
        name: "A",
        furigana: "ア",
        zekken: "001",
        competitionId: 20,
        competitionName: "Comp2",
      },
      {
        id: 2,
        name: "B",
        furigana: null,
        zekken: null,
        competitionId: 10,
        competitionName: "Comp1",
      },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(1)
    expect(result[0].competitionName).toEqual(["Comp1", "Comp2"])
    expect(result[1].id).toBe(2)
    expect(result[1].competitionName).toEqual(["Comp1"])
  })

  test("handles player with no competition", () => {
    const result = groupByPlayer([
      {
        id: 1,
        name: "A",
        furigana: null,
        zekken: null,
        competitionId: null,
        competitionName: null,
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].competitionName).toEqual([])
  })

  test("returns empty array for empty input", () => {
    expect(groupByPlayer([])).toEqual([])
  })
})

describe("groupByUmpire", () => {
  test("groups flat rows by umpire id and collects competition names", () => {
    const result = groupByUmpire([
      { id: 1, name: "U1", competitionId: 10, competitionName: "Comp1" },
      { id: 1, name: "U1", competitionId: 20, competitionName: "Comp2" },
      { id: 2, name: "U2", competitionId: 10, competitionName: "Comp1" },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].competitionName).toEqual(["Comp1", "Comp2"])
    expect(result[1].competitionName).toEqual(["Comp1"])
  })

  test("handles umpire with no competition", () => {
    const result = groupByUmpire([
      { id: 1, name: "U1", competitionId: null, competitionName: null },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].competitionName).toEqual([])
  })

  test("returns empty array for empty input", () => {
    expect(groupByUmpire([])).toEqual([])
  })
})

describe("groupByCourse", () => {
  test("groups flat rows by course id and collects competition names", () => {
    const now = new Date()
    const result = groupByCourse([
      {
        id: 1,
        name: "C1",
        createdAt: now,
        competitionId: 10,
        competitionName: "Comp1",
      },
      {
        id: 1,
        name: "C1",
        createdAt: now,
        competitionId: 20,
        competitionName: "Comp2",
      },
      {
        id: 2,
        name: "C2",
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp1",
      },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].competitionName).toEqual(["Comp1", "Comp2"])
    expect(result[0].createdAt).toBe(now)
    expect(result[1].competitionName).toEqual(["Comp1"])
    expect(result[1].createdAt).toBeNull()
  })

  test("handles course with no competition", () => {
    const result = groupByCourse([
      {
        id: 1,
        name: "C1",
        createdAt: null,
        competitionId: null,
        competitionName: null,
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].competitionName).toEqual([])
  })

  test("returns empty array for empty input", () => {
    expect(groupByCourse([])).toEqual([])
  })

  test("preserves entity-specific fields across all groupBy variants", () => {
    const playerResult = groupByPlayer([
      {
        id: 1,
        name: "P",
        furigana: "フ",
        zekken: "Z",
        competitionId: null,
        competitionName: null,
      },
    ])
    expect(playerResult[0].furigana).toBe("フ")
    expect(playerResult[0].zekken).toBe("Z")

    const courseResult = groupByCourse([
      {
        id: 1,
        name: "C",
        createdAt: new Date("2025-01-01"),
        competitionId: null,
        competitionName: null,
      },
    ])
    expect(courseResult[0].createdAt).toEqual(new Date("2025-01-01"))
  })
})
