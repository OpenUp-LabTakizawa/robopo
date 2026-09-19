import { afterEach, describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import {
  fxEventToTickerLine,
  isSpectatorTheme,
  parseStoredPlayerId,
  SELECTED_PLAYER_STORAGE_KEY,
  THEME_STORAGE_KEY,
  useClock,
  useSelectedPlayer,
  useSpectatorTheme,
  useTickerEvents,
} from "@/components/spectator/use-spectator-preferences"
import type { LiveFxEvent } from "@/lib/spectator/use-live-feed"

afterEach(() => {
  localStorage.clear()
  window.history.replaceState(null, "", "/spectator")
})

describe("isSpectatorTheme", () => {
  test("accepts known themes only", () => {
    expect(isSpectatorTheme("arcade")).toBe(true)
    expect(isSpectatorTheme("neon")).toBe(false)
    expect(isSpectatorTheme(null)).toBe(false)
  })
})

describe("parseStoredPlayerId", () => {
  test("parses positive numbers", () => {
    expect(parseStoredPlayerId("12")).toBe(12)
  })

  test("rejects empty, non-numeric and non-positive values", () => {
    expect(parseStoredPlayerId(null)).toBeNull()
    expect(parseStoredPlayerId("")).toBeNull()
    expect(parseStoredPlayerId("abc")).toBeNull()
    expect(parseStoredPlayerId("0")).toBeNull()
    expect(parseStoredPlayerId("-3")).toBeNull()
  })
})

describe("useSpectatorTheme", () => {
  test("defaults to esports and persists the choice", () => {
    const { result } = renderHook(() => useSpectatorTheme())
    expect(result.current[0]).toBe("esports")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("esports")

    act(() => result.current[1]("arcade"))
    expect(result.current[0]).toBe("arcade")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("arcade")
    expect(new URL(window.location.href).searchParams.get("theme")).toBe(
      "arcade",
    )
  })

  test("restores the stored theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "hero")
    const { result } = renderHook(() => useSpectatorTheme())
    expect(result.current[0]).toBe("hero")
  })

  test("the URL parameter wins over storage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "hero")
    window.history.replaceState(null, "", "/spectator?theme=stadium")
    const { result } = renderHook(() => useSpectatorTheme())
    expect(result.current[0]).toBe("stadium")
  })

  test("ignores unknown values", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "neon")
    window.history.replaceState(null, "", "/spectator?theme=bogus")
    const { result } = renderHook(() => useSpectatorTheme())
    expect(result.current[0]).toBe("esports")
  })
})

describe("useSelectedPlayer", () => {
  test("starts empty and persists selections", () => {
    const { result } = renderHook(() => useSelectedPlayer())
    expect(result.current[0]).toBeNull()

    act(() => result.current[1](7))
    expect(result.current[0]).toBe(7)
    expect(localStorage.getItem(SELECTED_PLAYER_STORAGE_KEY)).toBe("7")

    act(() => result.current[1](null))
    expect(result.current[0]).toBeNull()
    expect(localStorage.getItem(SELECTED_PLAYER_STORAGE_KEY)).toBeNull()
  })

  test("restores a stored selection", () => {
    localStorage.setItem(SELECTED_PLAYER_STORAGE_KEY, "42")
    const { result } = renderHook(() => useSelectedPlayer())
    expect(result.current[0]).toBe(42)
  })
})

describe("useClock", () => {
  test("reports the current time once mounted", () => {
    const before = Date.now()
    const { result, unmount } = renderHook(() => useClock())
    expect(result.current).not.toBeNull()
    expect(result.current as number).toBeGreaterThanOrEqual(before)
    // Stop the 1s interval so it does not keep the test process alive
    unmount()
  })
})

function scoreEvent(
  name: string,
  point: number,
  kind: "score" | "personal-best" | "course-best" = "score",
): LiveFxEvent {
  return {
    kind,
    lastRun: {
      challengeId: 1,
      player: { id: 1, name, furigana: null, bibNumber: null },
      course: {
        id: 1,
        name: "コースA",
        description: null,
        field: null,
        mission: null,
        point: null,
        courseOutRule: "keep",
        maxPoint: 10,
      },
      firstResult: 1,
      retryResult: null,
      detail: null,
      point,
      bestPoint: point,
      previousBestPoint: 0,
      attemptsBefore: 0,
      attemptsAfter: 1,
      isPersonalBest: false,
      isCourseBest: false,
      createdAt: "2026-09-19T00:00:00Z",
    },
  }
}

describe("fxEventToTickerLine", () => {
  test("formats each event kind", () => {
    const score = scoreEvent("さくら", 5)
    expect(fxEventToTickerLine(score)).toBe("▶ さくら 5pt @ コースA")
    expect(
      fxEventToTickerLine(scoreEvent("さくら", 5, "personal-best")),
    ).toContain("自己ベスト更新")
    expect(
      fxEventToTickerLine(scoreEvent("さくら", 5, "course-best")),
    ).toContain("コース新記録")
    expect(
      fxEventToTickerLine({
        kind: "takeover",
        newLeaderName: "たろう",
        previousLeaderName: "さくら",
      }),
    ).toBe("🚀 首位浮上 たろう (旧: さくら)")
    expect(
      fxEventToTickerLine({
        kind: "takeover",
        newLeaderName: "たろう",
        previousLeaderName: null,
      }),
    ).toBe("🚀 首位浮上 たろう")
  })
})

describe("useTickerEvents", () => {
  test("appends a line per event and caps the list at 12", () => {
    const clear = () => {}
    const { result, rerender } = renderHook(
      ({ fx }: { fx: LiveFxEvent | null }) => useTickerEvents(fx, clear),
      { initialProps: { fx: null as LiveFxEvent | null } },
    )
    expect(result.current).toEqual([])

    for (let i = 1; i <= 14; i++) {
      rerender({ fx: scoreEvent(`p${i}`, i) })
    }
    expect(result.current).toHaveLength(12)
    expect(result.current[0].text).toBe("▶ p3 3pt @ コースA")
    expect(result.current[11].text).toBe("▶ p14 14pt @ コースA")
    expect(new Set(result.current.map((e) => e.id)).size).toBe(12)
  })

  test("asks the feed to clear the event after it was shown", async () => {
    let cleared = 0
    const clear = () => {
      cleared += 1
    }
    // A stable event object, as it would be when held in feed state
    const event = scoreEvent("p", 1)
    const { unmount } = renderHook(() => useTickerEvents(event, clear))
    // Unmounting cancels the pending clear
    unmount()
    await new Promise((r) => setTimeout(r, 10))
    expect(cleared).toBe(0)
  })
})
