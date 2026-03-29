import { beforeEach, describe, expect, mock, test } from "bun:test"
import {
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
} from "@/app/lib/db/schema"

type Operation = {
  type: "select" | "insert" | "delete"
  table: unknown
  whereArgs?: unknown[]
  values?: Record<string, unknown>
}

let operations: Operation[] = []
let mockSelectResult: unknown[] = []

// Chainable mock builder for db operations
function createChain(op: Operation) {
  const chain: Record<string, unknown> = {
    from: (table: unknown) => {
      op.table = table
      return chain
    },
    where: (...args: unknown[]) => {
      op.whereArgs = args
      operations.push(op)
      return Promise.resolve(mockSelectResult)
    },
    values: (vals: Record<string, unknown>) => {
      op.values = vals
      operations.push(op)
      return Promise.resolve()
    },
  }
  return chain
}

mock.module("@/app/lib/db/db", () => ({
  db: {
    select: () => createChain({ type: "select", table: null }),
    insert: (table: unknown) => createChain({ type: "insert", table }),
    delete: (table: unknown) => createChain({ type: "delete", table }),
  },
}))

const { assignById, unassignById } = await import("@/app/api/assign/assign")

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  operations = []
  mockSelectResult = []
})

describe("assignById", () => {
  test("returns 400 for empty body", async () => {
    const res = await assignById(makeRequest({}), "player")
    expect(res.status).toBe(400)
  })

  test("returns 400 when ids is not an array", async () => {
    const res = await assignById(
      makeRequest({ ids: "not-an-array", competitionId: 1 }),
      "player",
    )
    expect(res.status).toBe(400)
  })

  test("returns 400 when competitionId is missing", async () => {
    const res = await assignById(makeRequest({ ids: [1] }), "player")
    expect(res.status).toBe(400)
  })

  test("inserts into competitionPlayer for mode=player", async () => {
    mockSelectResult = []
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await assignById(req, "player")
    expect(res.status).toBe(200)

    const selectOp = operations.find((o) => o.type === "select")
    expect(selectOp?.table).toBe(competitionPlayer)
    expect(selectOp?.whereArgs).toBeDefined()

    const insertOp = operations.find((o) => o.type === "insert")
    expect(insertOp?.table).toBe(competitionPlayer)
    expect(insertOp?.values).toEqual({ competitionId: 1, playerId: 10 })
  })

  test("inserts into competitionCourse for mode=course", async () => {
    mockSelectResult = []
    const req = makeRequest({ ids: [20], competitionId: 2 })
    const res = await assignById(req, "course")
    expect(res.status).toBe(200)

    const insertOp = operations.find((o) => o.type === "insert")
    expect(insertOp?.table).toBe(competitionCourse)
    expect(insertOp?.values).toEqual({ competitionId: 2, courseId: 20 })
  })

  test("inserts into competitionUmpire for mode=umpire", async () => {
    mockSelectResult = []
    const req = makeRequest({ ids: [30], competitionId: 3 })
    const res = await assignById(req, "umpire")
    expect(res.status).toBe(200)

    const insertOp = operations.find((o) => o.type === "insert")
    expect(insertOp?.table).toBe(competitionUmpire)
    expect(insertOp?.values).toEqual({ competitionId: 3, umpireId: 30 })
  })

  test("handles multiple ids in a single request", async () => {
    mockSelectResult = []
    const req = makeRequest({ ids: [10, 11], competitionId: 1 })
    const res = await assignById(req, "player")
    expect(res.status).toBe(200)

    const selectOps = operations.filter((o) => o.type === "select")
    expect(selectOps).toHaveLength(2)

    const insertOps = operations.filter((o) => o.type === "insert")
    expect(insertOps).toHaveLength(2)
    for (const op of insertOps) {
      expect(op.table).toBe(competitionPlayer)
    }
    const playerIds = insertOps.map((op) => op.values?.playerId).sort()
    expect(playerIds).toEqual([10, 11])
  })

  test("skips insert when assignment already exists", async () => {
    mockSelectResult = [{ id: 1 }]
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await assignById(req, "player")
    expect(res.status).toBe(200)

    const insertOps = operations.filter((o) => o.type === "insert")
    expect(insertOps).toHaveLength(0)
  })

  test("returns 400 for invalid mode", async () => {
    const req = makeRequest({ ids: [1], competitionId: 1 })
    // @ts-expect-error testing invalid mode at runtime
    const res = await assignById(req, "invalid")
    expect(res.status).toBe(400)
  })
})

describe("unassignById", () => {
  test("returns 400 for empty body", async () => {
    const res = await unassignById(makeRequest({}), "player")
    expect(res.status).toBe(400)
  })

  test("returns 400 when ids is not an array", async () => {
    const res = await unassignById(
      makeRequest({ ids: "not-an-array", competitionId: 1 }),
      "player",
    )
    expect(res.status).toBe(400)
  })

  test("returns 400 when competitionId is missing", async () => {
    const res = await unassignById(makeRequest({ ids: [1] }), "player")
    expect(res.status).toBe(400)
  })

  test("deletes from competitionPlayer for mode=player", async () => {
    mockSelectResult = [{ id: 1 }]
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await unassignById(req, "player")
    expect(res.status).toBe(200)

    const deleteOp = operations.find((o) => o.type === "delete")
    expect(deleteOp?.table).toBe(competitionPlayer)
    expect(deleteOp?.whereArgs).toBeDefined()
  })

  test("deletes from competitionCourse for mode=course", async () => {
    mockSelectResult = [{ id: 1 }]
    const req = makeRequest({ ids: [20], competitionId: 2 })
    const res = await unassignById(req, "course")
    expect(res.status).toBe(200)

    const deleteOp = operations.find((o) => o.type === "delete")
    expect(deleteOp?.table).toBe(competitionCourse)
  })

  test("deletes from competitionUmpire for mode=umpire", async () => {
    mockSelectResult = [{ id: 1 }]
    const req = makeRequest({ ids: [30], competitionId: 3 })
    const res = await unassignById(req, "umpire")
    expect(res.status).toBe(200)

    const deleteOp = operations.find((o) => o.type === "delete")
    expect(deleteOp?.table).toBe(competitionUmpire)
  })

  test("handles multiple ids in a single request", async () => {
    mockSelectResult = [{ id: 1 }]
    const req = makeRequest({ ids: [10, 11], competitionId: 1 })
    const res = await unassignById(req, "player")
    expect(res.status).toBe(200)

    const selectOps = operations.filter((o) => o.type === "select")
    expect(selectOps).toHaveLength(2)

    const deleteOps = operations.filter((o) => o.type === "delete")
    expect(deleteOps).toHaveLength(2)
    for (const op of deleteOps) {
      expect(op.table).toBe(competitionPlayer)
    }
  })

  test("skips delete when assignment does not exist", async () => {
    mockSelectResult = []
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await unassignById(req, "player")
    expect(res.status).toBe(200)

    const deleteOps = operations.filter((o) => o.type === "delete")
    expect(deleteOps).toHaveLength(0)
  })

  test("returns 400 for invalid mode", async () => {
    const req = makeRequest({ ids: [1], competitionId: 1 })
    // @ts-expect-error testing invalid mode at runtime
    const res = await unassignById(req, "invalid")
    expect(res.status).toBe(400)
  })
})
