import { afterEach, describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { useIsCompact } from "@/components/spectator/use-is-compact"

// happy-dom exposes viewport control on window.happyDOM
type HappyWindow = Window & {
  happyDOM: { setViewport(v: { width?: number; height?: number }): void }
}

function setWidth(width: number) {
  ;(window as unknown as HappyWindow).happyDOM.setViewport({ width })
}

afterEach(() => {
  setWidth(1024)
})

describe("useIsCompact", () => {
  test("is false on a wide viewport", () => {
    setWidth(1024)
    const { result } = renderHook(() => useIsCompact())
    expect(result.current).toBe(false)
  })

  test("is true on a narrow viewport", () => {
    setWidth(375)
    const { result } = renderHook(() => useIsCompact())
    expect(result.current).toBe(true)
  })

  test("updates when the viewport crosses the breakpoint", () => {
    setWidth(1024)
    const { result } = renderHook(() => useIsCompact())
    expect(result.current).toBe(false)
    act(() => setWidth(600))
    expect(result.current).toBe(true)
    act(() => setWidth(900))
    expect(result.current).toBe(false)
  })
})
