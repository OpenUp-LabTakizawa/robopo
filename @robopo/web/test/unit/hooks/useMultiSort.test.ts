import { describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { useMultiSort } from "@/hooks/useMultiSort"

type Item = { name: string; score: number }
type Key = "name" | "score"

const testData: Item[] = [
  { name: "Charlie", score: 10 },
  { name: "Alice", score: 30 },
  { name: "Bob", score: 20 },
]

const allKeys: { value: Key; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "score", label: "Score" },
]

function compareByKey(a: Item, b: Item, key: Key): number {
  if (key === "name") {
    return a.name.localeCompare(b.name)
  }
  return a.score - b.score
}

describe("useMultiSort", () => {
  test("sorts by default condition", () => {
    const { result } = renderHook(() =>
      useMultiSort({
        data: testData,
        defaultSort: [{ key: "score", order: "desc" }],
        compareByKey,
        allKeys,
      }),
    )
    expect(result.current.sorted[0].name).toBe("Alice") // score 30
    expect(result.current.sorted[2].name).toBe("Charlie") // score 10
  })

  test("addSort adds a new sort condition", () => {
    const { result } = renderHook(() =>
      useMultiSort({
        data: testData,
        defaultSort: [],
        compareByKey,
        allKeys,
      }),
    )
    act(() => result.current.addSort("name"))
    expect(result.current.conditions).toEqual([{ key: "name", order: "desc" }])
  })

  test("addSort does not duplicate existing key", () => {
    const { result } = renderHook(() =>
      useMultiSort({
        data: testData,
        defaultSort: [{ key: "name", order: "asc" }],
        compareByKey,
        allKeys,
      }),
    )
    act(() => result.current.addSort("name"))
    expect(result.current.conditions).toHaveLength(1)
  })

  test("removeSort removes a condition by index", () => {
    const { result } = renderHook(() =>
      useMultiSort({
        data: testData,
        defaultSort: [
          { key: "score", order: "desc" },
          { key: "name", order: "asc" },
        ],
        compareByKey,
        allKeys,
      }),
    )
    act(() => result.current.removeSort(0))
    expect(result.current.conditions).toEqual([{ key: "name", order: "asc" }])
  })

  test("toggleOrder switches asc/desc", () => {
    const { result } = renderHook(() =>
      useMultiSort({
        data: testData,
        defaultSort: [{ key: "score", order: "desc" }],
        compareByKey,
        allKeys,
      }),
    )
    act(() => result.current.toggleOrder(0))
    expect(result.current.conditions[0].order).toBe("asc")
    act(() => result.current.toggleOrder(0))
    expect(result.current.conditions[0].order).toBe("desc")
  })

  test("resetSort restores default conditions", () => {
    const defaultSort = [{ key: "score" as Key, order: "desc" as const }]
    const { result } = renderHook(() =>
      useMultiSort({
        data: testData,
        defaultSort,
        compareByKey,
        allKeys,
      }),
    )
    act(() => result.current.addSort("name"))
    expect(result.current.conditions).toHaveLength(2)
    act(() => result.current.resetSort())
    expect(result.current.conditions).toEqual(defaultSort)
  })

  test("availableKeys excludes already-sorted keys", () => {
    const { result } = renderHook(() =>
      useMultiSort({
        data: testData,
        defaultSort: [{ key: "score", order: "desc" }],
        compareByKey,
        allKeys,
      }),
    )
    expect(result.current.availableKeys).toEqual([
      { value: "name", label: "Name" },
    ])
  })
})
