import { describe, expect, test } from "bun:test"
import { makeOrderLabel, makeSortLabel } from "@/components/summary/sortHelpers"

type Key = "name" | "time" | "score"

const options: { value: Key; label: string }[] = [
  { value: "name", label: "名前" },
  { value: "time", label: "時刻" },
]

describe("makeSortLabel", () => {
  const getLabel = makeSortLabel(options)

  test("returns the configured label", () => {
    expect(getLabel("name")).toBe("名前")
    expect(getLabel("time")).toBe("時刻")
  })

  test("falls back to the key itself when unknown", () => {
    expect(getLabel("score")).toBe("score")
  })
})

describe("makeOrderLabel", () => {
  const getOrder = makeOrderLabel<Key>(new Set(["name"]), new Set(["time"]))

  test("name keys use alphabetical labels", () => {
    expect(getOrder("name", "asc")).toBe("A→Z")
    expect(getOrder("name", "desc")).toBe("Z→A")
  })

  test("time keys use chronological labels", () => {
    expect(getOrder("time", "asc")).toBe("古い順")
    expect(getOrder("time", "desc")).toBe("新しい順")
  })

  test("other keys use numeric labels", () => {
    expect(getOrder("score", "asc")).toBe("小さい順")
    expect(getOrder("score", "desc")).toBe("大きい順")
  })
})
