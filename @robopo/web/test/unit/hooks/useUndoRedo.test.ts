import { describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { useUndoRedo } from "@/hooks/useUndoRedo"

function setupHook() {
  let value = 0
  const result = renderHook(() =>
    useUndoRedo<number>({
      getSnapshot: () => value,
      applySnapshot: (snap) => {
        value = snap
      },
    }),
  )
  const setValue = (v: number) => {
    value = v
  }
  return { result, getValue: () => value, setValue }
}

describe("useUndoRedo", () => {
  test("initial state has no undo/redo", () => {
    const { result } = setupHook()
    expect(result.result.current.canUndo).toBe(false)
    expect(result.result.current.canRedo).toBe(false)
  })

  test("push enables undo", () => {
    const { result, setValue } = setupHook()
    setValue(1)
    act(() => result.result.current.push())
    expect(result.result.current.canUndo).toBe(true)
    expect(result.result.current.canRedo).toBe(false)
  })

  test("undo restores previous state", () => {
    const { result, getValue, setValue } = setupHook()
    setValue(10)
    act(() => result.result.current.push())
    setValue(20)
    act(() => result.result.current.undo())
    expect(getValue()).toBe(10)
  })

  test("redo restores undone state", () => {
    const { result, getValue, setValue } = setupHook()
    setValue(10)
    act(() => result.result.current.push())
    setValue(20)
    act(() => result.result.current.undo())
    act(() => result.result.current.redo())
    expect(getValue()).toBe(20)
  })

  test("push clears redo stack", () => {
    const { result, setValue } = setupHook()
    setValue(10)
    act(() => result.result.current.push())
    setValue(20)
    act(() => result.result.current.undo())
    expect(result.result.current.canRedo).toBe(true)
    setValue(30)
    act(() => result.result.current.push())
    expect(result.result.current.canRedo).toBe(false)
  })

  test("undo with empty history does nothing", () => {
    const { result, getValue, setValue } = setupHook()
    setValue(5)
    act(() => result.result.current.undo())
    expect(getValue()).toBe(5)
  })

  test("redo with empty redo stack does nothing", () => {
    const { result, getValue, setValue } = setupHook()
    setValue(5)
    act(() => result.result.current.redo())
    expect(getValue()).toBe(5)
  })
})
