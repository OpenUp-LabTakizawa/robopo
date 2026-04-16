import { afterEach, describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { useSelectionStorage } from "@/hooks/useSelectionStorage"

const STORAGE_KEY = "robopo-selections"

afterEach(() => {
  localStorage.clear()
})

describe("useSelectionStorage", () => {
  test("returns empty stored values initially", () => {
    const { result } = renderHook(() => useSelectionStorage())
    expect(result.current.stored).toEqual({})
  })

  test("isLoaded becomes true after mount", () => {
    const { result } = renderHook(() => useSelectionStorage())
    expect(result.current.isLoaded).toBe(true)
  })

  test("save persists values to localStorage", () => {
    const { result } = renderHook(() => useSelectionStorage())
    act(() => result.current.save({ competitionId: 1 }))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    expect(stored.competitionId).toBe(1)
  })

  test("save merges with existing values", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ competitionId: 1 }))
    const { result } = renderHook(() => useSelectionStorage())
    act(() => result.current.save({ courseId: 2 }))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    expect(stored.competitionId).toBe(1)
    expect(stored.courseId).toBe(2)
  })

  test("save removes keys set to undefined", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ competitionId: 1, courseId: 2 }),
    )
    const { result } = renderHook(() => useSelectionStorage())
    act(() => result.current.save({ courseId: undefined }))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    expect(stored.competitionId).toBe(1)
    expect(stored.courseId).toBeUndefined()
  })

  test("reads existing values from localStorage on mount", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ competitionId: 5, judgeId: 3 }),
    )
    const { result } = renderHook(() => useSelectionStorage())
    expect(result.current.stored.competitionId).toBe(5)
    expect(result.current.stored.judgeId).toBe(3)
  })
})
