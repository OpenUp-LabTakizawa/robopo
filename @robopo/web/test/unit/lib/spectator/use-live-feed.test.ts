import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import type {
  SpectatorBoardRow,
  SpectatorLastRun,
  SpectatorSnapshot,
} from "@/lib/spectator/types"
import { useLiveFeed } from "@/lib/spectator/use-live-feed"

// Minimal EventSource stand-in: records instances so tests can push events.
class FakeEventSource {
  static instances: FakeEventSource[] = []
  url: string
  closed = false
  onopen: (() => void) | null = null
  onerror: (() => void) | null = null
  onmessage: ((ev: { data: string }) => void) | null = null

  constructor(url: string) {
    this.url = url
    FakeEventSource.instances.push(this)
  }

  close() {
    this.closed = true
  }

  emitOpen() {
    this.onopen?.()
  }

  emitError() {
    this.onerror?.()
  }

  emit(data: unknown) {
    this.onmessage?.({
      data: typeof data === "string" ? data : JSON.stringify(data),
    })
  }
}

const originalEventSource = globalThis.EventSource

beforeEach(() => {
  FakeEventSource.instances = []
  globalThis.EventSource = FakeEventSource as unknown as typeof EventSource
})

afterEach(() => {
  globalThis.EventSource = originalEventSource
})

function player(id: number, name = `p${id}`) {
  return { id, name, furigana: null, bibNumber: null }
}

function boardRow(id: number, total: number): SpectatorBoardRow {
  return { rank: 1, player: player(id), perCourse: {}, total, attempts: 1 }
}

function lastRun(
  challengeId: number,
  flags: Partial<
    Pick<SpectatorLastRun, "isPersonalBest" | "isCourseBest">
  > = {},
): SpectatorLastRun {
  return {
    challengeId,
    player: player(1),
    course: {
      id: 1,
      name: "c",
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
    point: 5,
    bestPoint: 5,
    previousBestPoint: 0,
    attemptsBefore: 0,
    attemptsAfter: 1,
    isPersonalBest: false,
    isCourseBest: false,
    createdAt: "2026-09-19T00:00:00Z",
    ...flags,
  }
}

function snapshot(
  overrides: Partial<SpectatorSnapshot> = {},
): SpectatorSnapshot {
  return {
    competition: { id: 1, name: "comp", startDate: null, endDate: null },
    masked: false,
    courses: [],
    board: [],
    bestPerCourse: {},
    lastRun: null,
    playerDetails: {},
    generatedAt: "2026-09-19T00:00:00Z",
    ...overrides,
  }
}

function latest(): FakeEventSource {
  return FakeEventSource.instances[FakeEventSource.instances.length - 1]
}

describe("useLiveFeed", () => {
  test("does not connect without a competition", () => {
    const { result } = renderHook(() => useLiveFeed(null))
    expect(FakeEventSource.instances).toHaveLength(0)
    expect(result.current.snapshot).toBeNull()
    expect(result.current.connected).toBe(false)
  })

  test("connects to the competition stream and tracks connection state", () => {
    const { result } = renderHook(() => useLiveFeed(7))
    expect(latest().url).toBe("/api/spectator/7/stream")

    act(() => latest().emitOpen())
    expect(result.current.connected).toBe(true)

    act(() => latest().emitError())
    expect(result.current.connected).toBe(false)
  })

  test("stores snapshots and ignores other or malformed messages", () => {
    const { result } = renderHook(() => useLiveFeed(1))
    act(() => latest().emit("not json"))
    act(() => latest().emit({ kind: "ping", at: "now" }))
    expect(result.current.snapshot).toBeNull()

    const snap = snapshot()
    act(() => latest().emit({ kind: "snapshot", snapshot: snap }))
    expect(result.current.snapshot).toEqual(snap)
  })

  test("the first snapshot never raises fx when there is no seed", () => {
    const { result } = renderHook(() => useLiveFeed(1))
    act(() =>
      latest().emit({
        kind: "snapshot",
        snapshot: snapshot({ lastRun: lastRun(1), board: [boardRow(1, 10)] }),
      }),
    )
    expect(result.current.fxEvent).toBeNull()
  })

  test("a new lastRun raises score / personal-best / course-best fx", () => {
    const { result } = renderHook(() => useLiveFeed(1, snapshot()))

    act(() =>
      latest().emit({
        kind: "snapshot",
        snapshot: snapshot({ lastRun: lastRun(1) }),
      }),
    )
    expect(result.current.fxEvent?.kind).toBe("score")

    act(() =>
      latest().emit({
        kind: "snapshot",
        snapshot: snapshot({ lastRun: lastRun(2, { isPersonalBest: true }) }),
      }),
    )
    expect(result.current.fxEvent?.kind).toBe("personal-best")

    act(() =>
      latest().emit({
        kind: "snapshot",
        snapshot: snapshot({
          lastRun: lastRun(3, { isPersonalBest: true, isCourseBest: true }),
        }),
      }),
    )
    expect(result.current.fxEvent?.kind).toBe("course-best")

    // Same challengeId again → no new fx
    act(() => result.current.clearFxEvent())
    act(() =>
      latest().emit({
        kind: "snapshot",
        snapshot: snapshot({ lastRun: lastRun(3, { isCourseBest: true }) }),
      }),
    )
    expect(result.current.fxEvent).toBeNull()
  })

  test("a leader change raises a delayed takeover fx", async () => {
    const seed = snapshot({ board: [boardRow(1, 10)] })
    const { result } = renderHook(() => useLiveFeed(1, seed))

    act(() =>
      latest().emit({
        kind: "snapshot",
        snapshot: snapshot({ board: [boardRow(2, 20), boardRow(1, 10)] }),
      }),
    )
    expect(result.current.fxEvent).toBeNull()

    await act(async () => {
      await new Promise((r) => setTimeout(r, 850))
    })
    expect(result.current.fxEvent).toEqual({
      kind: "takeover",
      newLeaderName: "p2",
      previousLeaderName: "p1",
    })
  })

  test("a first leader with zero points is not a takeover", async () => {
    const { result } = renderHook(() => useLiveFeed(1, snapshot()))
    act(() =>
      latest().emit({
        kind: "snapshot",
        snapshot: snapshot({ board: [boardRow(1, 0)] }),
      }),
    )
    await act(async () => {
      await new Promise((r) => setTimeout(r, 850))
    })
    expect(result.current.fxEvent).toBeNull()
  })

  test("closes the stream and drops pending takeover on unmount", async () => {
    const seed = snapshot({ board: [boardRow(1, 10)] })
    const { result, unmount } = renderHook(() => useLiveFeed(1, seed))
    const es = latest()
    act(() =>
      es.emit({
        kind: "snapshot",
        snapshot: snapshot({ board: [boardRow(2, 20)] }),
      }),
    )
    unmount()
    expect(es.closed).toBe(true)
    await new Promise((r) => setTimeout(r, 850))
    // No state update after unmount; the last observed value stays null
    expect(result.current.fxEvent).toBeNull()
  })

  test("reconnects when the competition changes", () => {
    const { rerender } = renderHook(
      ({ id }: { id: number | null }) => useLiveFeed(id),
      { initialProps: { id: 1 } },
    )
    const first = latest()
    rerender({ id: 2 })
    expect(first.closed).toBe(true)
    expect(latest().url).toBe("/api/spectator/2/stream")
  })
})
