import { describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import {
  fmtClock,
  useCountUp,
} from "@/components/spectator/effects/use-count-up"

describe("fmtClock", () => {
  test("formats minutes and seconds", () => {
    expect(fmtClock(0)).toBe("00:00")
    expect(fmtClock(65_000)).toBe("01:05")
    expect(fmtClock(59 * 60_000 + 59_000)).toBe("59:59")
  })

  test("adds hours once over an hour", () => {
    expect(fmtClock(3_600_000)).toBe("01:00:00")
    expect(fmtClock(3_600_000 * 12 + 61_000)).toBe("12:01:01")
  })

  test("floors partial seconds", () => {
    expect(fmtClock(1_999)).toBe("00:01")
  })

  test("clamps negative remaining time to zero", () => {
    expect(fmtClock(-5_000)).toBe("00:00")
  })
})

describe("useCountUp", () => {
  test("starts at the target without animating", () => {
    const { result } = renderHook(() => useCountUp(42))
    expect(result.current).toBe(42)
  })

  test("animates towards a new target and settles on it", async () => {
    const { result, rerender } = renderHook(
      ({ target }: { target: number }) => useCountUp(target, 30),
      { initialProps: { target: 0 } },
    )
    rerender({ target: 100 })
    // Wait for the animation to run to completion
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150))
    })
    expect(result.current).toBe(100)
  })
})
