import { beforeEach, describe, expect, mock, test } from "bun:test"
import {
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
} from "@/app/lib/db/schema"

// Track which table object each select().from() call targets
let lastFromTable: unknown = null

beforeEach(() => {
  lastFromTable = null
})

mock.module("@/app/lib/db/db", () => ({
  db: {
    select: () => ({
      from: (table: unknown) => {
        lastFromTable = table
        return Promise.resolve([])
      },
    }),
  },
}))

const courseRoute = await import("@/app/api/assign/course/route")
const playerRoute = await import("@/app/api/assign/player/route")
const umpireRoute = await import("@/app/api/assign/umpire/route")

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

  test("assign/umpire GET queries competition_umpire table", async () => {
    const res = await umpireRoute.GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(lastFromTable).toBe(competitionUmpire)
    expect(body).toHaveProperty("assigns")
    expect(Array.isArray(body.assigns)).toBe(true)
  })
})
