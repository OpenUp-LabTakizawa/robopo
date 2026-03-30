import { afterAll, describe, expect, mock, test } from "bun:test"

// Mock only delete query functions, preserving all other exports
const originalModule = await import("@/app/lib/db/queries/queries")

const mockDeletePlayer = mock(() => Promise.resolve([{ deletedId: 1 }]))
const mockDeleteUmpire = mock(() => Promise.resolve([{ deletedId: 1 }]))
const mockDeleteCourse = mock(() => Promise.resolve([{ deletedId: 1 }]))
const mockDeleteCompetition = mock(() => Promise.resolve([{ deletedId: 1 }]))

mock.module("@/app/lib/db/queries/queries", () => ({
  ...originalModule,
  deletePlayerById: mockDeletePlayer,
  deleteUmpireById: mockDeleteUmpire,
  deleteCourseById: mockDeleteCourse,
  deleteCompetitionById: mockDeleteCompetition,
}))

const { deleteById } = await import("@/app/api/delete")

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

afterAll(() => {
  mockDeletePlayer.mockRestore()
  mockDeleteUmpire.mockRestore()
  mockDeleteCourse.mockRestore()
  mockDeleteCompetition.mockRestore()
})

describe("deleteById", () => {
  test("deletes player by single id", async () => {
    const res = await deleteById(jsonRequest({ id: 1 }), "player")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockDeletePlayer).toHaveBeenCalledWith(1)
  })

  test("deletes umpire by single id", async () => {
    const res = await deleteById(jsonRequest({ id: 2 }), "umpire")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockDeleteUmpire).toHaveBeenCalledWith(2)
  })

  test("deletes course by single id", async () => {
    const res = await deleteById(jsonRequest({ id: 3 }), "course")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockDeleteCourse).toHaveBeenCalledWith(3)
  })

  test("deletes competition by single id", async () => {
    const res = await deleteById(jsonRequest({ id: 4 }), "competition")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockDeleteCompetition).toHaveBeenCalledWith(4)
  })

  test("deletes multiple ids with array", async () => {
    const res = await deleteById(jsonRequest({ id: [10, 20] }), "player")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockDeletePlayer).toHaveBeenCalledWith(10)
    expect(mockDeletePlayer).toHaveBeenCalledWith(20)
  })

  test("includes afterDelete result in response", async () => {
    const afterDelete = async () => ({
      newList: { competitions: [{ id: 1, name: "test" }] },
    })
    const res = await deleteById(
      jsonRequest({ id: 5 }),
      "competition",
      afterDelete,
    )
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.newList).toEqual({ competitions: [{ id: 1, name: "test" }] })
  })

  test("does not include extra fields without afterDelete", async () => {
    const res = await deleteById(jsonRequest({ id: 6 }), "player")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.newList).toBeUndefined()
  })

  test("returns 500 for invalid mode", async () => {
    const res = await deleteById(jsonRequest({ id: 1 }), "invalid")
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
  })

  test("returns 500 when delete throws", async () => {
    mockDeletePlayer.mockImplementationOnce(() =>
      Promise.reject(new Error("DB error")),
    )
    const res = await deleteById(jsonRequest({ id: 99 }), "player")
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
  })
})
