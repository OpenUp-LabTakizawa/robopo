import { describe, expect, test } from "bun:test"
import {
  groupByCourse,
  groupByJudge,
  groupByPlayer,
} from "@/app/lib/db/queries/queries"

describe("groupByPlayer", () => {
  test("groups flat rows by player id and collects competition names", () => {
    const result = groupByPlayer([
      {
        id: 1,
        name: "A",
        furigana: "ア",
        bibNumber: "001",
        competitionId: 10,
        competitionName: "Comp1",
      },
      {
        id: 1,
        name: "A",
        furigana: "ア",
        bibNumber: "001",
        competitionId: 20,
        competitionName: "Comp2",
      },
      {
        id: 2,
        name: "B",
        furigana: null,
        bibNumber: null,
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
        bibNumber: null,
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

describe("groupByJudge", () => {
  test("groups flat rows by judge id and collects competition names", () => {
    const result = groupByJudge([
      {
        id: 1,
        username: "U1",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp1",
      },
      {
        id: 1,
        username: "U1",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 20,
        competitionName: "Comp2",
      },
      {
        id: 2,
        username: "U2",
        userId: "u2",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp1",
      },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].username).toBe("U1")
    expect(result[0].userId).toBe("u1")
    expect(result[0].lastLoginAt).toBeNull()
    expect(result[0].competitionName).toEqual(["Comp1", "Comp2"])
    expect(result[1].username).toBe("U2")
    expect(result[1].userId).toBe("u2")
    expect(result[1].competitionName).toEqual(["Comp1"])
  })

  test("handles judge with no competition", () => {
    const result = groupByJudge([
      {
        id: 1,
        username: "U1",
        userId: "u1",
        note: null,
        lastLoginAt: null,
        createdAt: null,
        competitionId: null,
        competitionName: null,
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].username).toBe("U1")
    expect(result[0].userId).toBe("u1")
    expect(result[0].competitionName).toEqual([])
  })

  test("normalizes null username to empty string", () => {
    const result = groupByJudge([
      {
        id: 1,
        username: null,
        userId: "u1",
        note: null,
        lastLoginAt: new Date("2024-01-01T00:00:00.000Z"),
        createdAt: null,
        competitionId: 10,
        competitionName: "Comp1",
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].username).toBe("")
    expect(result[0].lastLoginAt).toEqual(new Date("2024-01-01T00:00:00.000Z"))
  })

  test("returns empty array for empty input", () => {
    expect(groupByJudge([])).toEqual([])
  })
})

describe("groupByCourse", () => {
  test("groups flat rows by course id and collects competition names", () => {
    const now = new Date()
    const result = groupByCourse([
      {
        id: 1,
        name: "C1",
        description: null,
        createdAt: now,
        competitionId: 10,
        competitionName: "Comp1",
      },
      {
        id: 1,
        name: "C1",
        description: null,
        createdAt: now,
        competitionId: 20,
        competitionName: "Comp2",
      },
      {
        id: 2,
        name: "C2",
        description: null,
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
        description: null,
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
        bibNumber: "Z",
        competitionId: null,
        competitionName: null,
      },
    ])
    expect(playerResult[0].furigana).toBe("フ")
    expect(playerResult[0].bibNumber).toBe("Z")

    const courseResult = groupByCourse([
      {
        id: 1,
        name: "C",
        description: null,
        createdAt: new Date("2025-01-01"),
        competitionId: null,
        competitionName: null,
      },
    ])
    expect(courseResult[0].createdAt).toEqual(new Date("2025-01-01"))
  })
})
