import { afterAll, beforeEach, describe, expect, spyOn, test } from "bun:test"
import { db } from "@/app/lib/db/db"
import { competition, course, judge, player } from "@/app/lib/db/schema"
import {
  getCompetitionList,
  getCourseList,
  getJudgeList,
  getPlayerList,
} from "@/app/server/db"

let lastFromTable: unknown = null
let mockResult: unknown[] = []

const selectSpy = spyOn(db, "select").mockImplementation(
  () =>
    ({
      from: (table: unknown) => {
        lastFromTable = table
        const promise = Promise.resolve(mockResult)
        return Object.assign(promise, {
          where: () => Promise.resolve(mockResult),
          innerJoin: () => promise,
          orderBy: () => Promise.resolve(mockResult),
        })
      },
    }) as ReturnType<typeof db.select>,
)

afterAll(() => {
  selectSpy.mockRestore()
})

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

  test("getJudgeList queries judge table", async () => {
    mockResult = [{ id: 1, name: "U1" }]
    const result = await getJudgeList()
    expect(lastFromTable).toBe(judge)
    expect(result).toHaveLength(1)
  })

  test("getCompetitionList queries competition table and wraps result", async () => {
    mockResult = [
      { id: 1, name: "C1", description: null, startDate: null, endDate: null },
    ]
    const result = await getCompetitionList()
    expect(lastFromTable).toBe(competition)
    expect(result.competitions).toHaveLength(1)
  })

  test("getCompetitionList returns stable wrapper shape for empty results", async () => {
    mockResult = []
    const result = await getCompetitionList()
    expect(result).toEqual({ competitions: [] })
  })

  test("getCourseList queries course table and wraps result", async () => {
    mockResult = [{ id: 1, name: "Course1" }]
    const result = await getCourseList()
    expect(lastFromTable).toBe(course)
    expect(result.courses).toHaveLength(1)
  })

  test("getCourseList returns stable wrapper shape for empty results", async () => {
    mockResult = []
    const result = await getCourseList()
    expect(result).toEqual({ courses: [] })
  })
})
