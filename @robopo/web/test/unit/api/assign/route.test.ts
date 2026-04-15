import { afterAll, beforeEach, describe, expect, spyOn, test } from "bun:test"
import { db } from "@/lib/db/db"
import {
  competitionCourse,
  competitionJudge,
  competitionPlayer,
} from "@/lib/db/schema"

let lastFromTable: unknown = null

const selectSpy = spyOn(db, "select").mockImplementation(
  () =>
    ({
      from: (table: unknown) => {
        lastFromTable = table
        return Promise.resolve([])
      },
    }) as ReturnType<typeof db.select>,
)

afterAll(() => {
  selectSpy.mockRestore()
})

beforeEach(() => {
  lastFromTable = null
})

const courseRoute = await import("@/app/api/assign/course/route")
const playerRoute = await import("@/app/api/assign/player/route")
const judgeRoute = await import("@/app/api/assign/judge/route")

describe("assign route GET handlers", () => {
  test("assign/course GET queries competition_course table", async () => {
    const res = await courseRoute.GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(lastFromTable).toBe(competitionCourse)
    expect(body).toHaveProperty("assigns")
    expect(Array.isArray(body.assigns)).toBe(true)
  })

  test("assign/player GET queries competition_player table", async () => {
    const res = await playerRoute.GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(lastFromTable).toBe(competitionPlayer)
    expect(body).toHaveProperty("assigns")
    expect(Array.isArray(body.assigns)).toBe(true)
  })

  test("assign/judge GET queries competition_judge table", async () => {
    const res = await judgeRoute.GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(lastFromTable).toBe(competitionJudge)
    expect(body).toHaveProperty("assigns")
    expect(Array.isArray(body.assigns)).toBe(true)
  })
})
