import { beforeEach, describe, expect, mock, test } from "bun:test"
import { competition, course, player, umpire } from "@/app/lib/db/schema"

let lastFromTable: unknown = null
let mockResult: unknown[] = []

const tableNameSymbol = Symbol.for("drizzle:Name")

// Mock db with chainable select/from/where/innerJoin
function createSelectChain() {
  const chain: Record<string, unknown> = {
    from: (table: unknown) => {
      lastFromTable = table
      return chain
    },
    where: () => {
      return Promise.resolve(mockResult)
    },
    innerJoin: () => chain,
    orderBy: () => Promise.resolve(mockResult),
  }
  return chain
}

mock.module("@/app/lib/db/db", () => ({
  db: {
    select: () => createSelectChain(),
  },
}))

const { getPlayerList, getUmpireList, getCompetitionList, getCourseList } =
  await import("@/app/components/server/db")

beforeEach(() => {
  lastFromTable = null
  mockResult = []
})

describe("server/db.ts data fetching functions", () => {
  test("getPlayerList queries player table", async () => {
    mockResult = [{ id: 1, name: "P1" }]
    const result = await getPlayerList()
    expect(lastFromTable).toBe(player)
    expect(result).toHaveLength(1)
  })

  test("getUmpireList queries umpire table", async () => {
    mockResult = [{ id: 1, name: "U1" }]
    const result = await getUmpireList()
    expect(lastFromTable).toBe(umpire)
    expect(result).toHaveLength(1)
  })

  test("getCompetitionList queries competition table and wraps result", async () => {
    mockResult = [{ id: 1, name: "C1", step: 0 }]
    const result = await getCompetitionList()
    expect(lastFromTable).toBe(competition)
    expect(result.competitions).toHaveLength(1)
  })

  test("getCourseList queries course table and wraps result", async () => {
    mockResult = [{ id: 1, name: "Course1" }]
    const result = await getCourseList()
    expect(lastFromTable).toBe(course)
    expect(result.courses).toHaveLength(1)
  })
})
