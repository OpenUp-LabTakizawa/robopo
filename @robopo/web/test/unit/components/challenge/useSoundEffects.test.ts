import { describe, expect, mock, test } from "bun:test"
import { renderHook } from "@testing-library/react"
import {
  acquireAudio,
  useSoundEffects,
} from "@/components/challenge/useSoundEffects"

type FakeAudio = {
  src: string
  ended: boolean
  paused: boolean
  volume: number
  currentTime: number
  play: () => Promise<void>
}

function fakeAudio(src: string, state: Partial<FakeAudio> = {}): FakeAudio {
  return {
    src,
    ended: false,
    paused: false,
    volume: 1,
    currentTime: 5,
    play: () => Promise.resolve(),
    ...state,
  }
}

describe("acquireAudio", () => {
  test("creates a new instance for an unknown source", () => {
    const pool = new Map<string, HTMLAudioElement[]>()
    const created: string[] = []
    const audio = acquireAudio(pool, "/a.mp3", (src) => {
      created.push(src)
      return fakeAudio(src) as unknown as HTMLAudioElement
    })
    expect(created).toEqual(["/a.mp3"])
    expect(pool.get("/a.mp3")).toEqual([audio])
  })

  test("reuses an idle instance instead of creating another", () => {
    const idle = fakeAudio("/a.mp3", { ended: true })
    const pool = new Map<string, HTMLAudioElement[]>([
      ["/a.mp3", [idle as unknown as HTMLAudioElement]],
    ])
    const create = mock((src: string) => fakeAudio(src))
    const audio = acquireAudio(
      pool,
      "/a.mp3",
      create as unknown as (src: string) => HTMLAudioElement,
    )
    expect(audio).toBe(idle as unknown as HTMLAudioElement)
    expect(create).not.toHaveBeenCalled()
  })

  test("creates another instance while all pooled ones are playing", () => {
    const busy = fakeAudio("/a.mp3")
    const pool = new Map<string, HTMLAudioElement[]>([
      ["/a.mp3", [busy as unknown as HTMLAudioElement]],
    ])
    const audio = acquireAudio(
      pool,
      "/a.mp3",
      (src) => fakeAudio(src) as unknown as HTMLAudioElement,
    )
    expect(audio).not.toBe(busy as unknown as HTMLAudioElement)
    expect(pool.get("/a.mp3")).toHaveLength(2)
  })
})

describe("useSoundEffects", () => {
  test("plays the named sound at its volume from the start", () => {
    const played: { src: string; volume: number; currentTime: number }[] = []
    const OriginalAudio = globalThis.Audio
    globalThis.Audio = class {
      src: string
      ended = false
      paused = false
      volume = 1
      currentTime = 3
      constructor(src: string) {
        this.src = src
      }
      play() {
        played.push({
          src: this.src,
          volume: this.volume,
          currentTime: this.currentTime,
        })
        return Promise.resolve()
      }
    } as unknown as typeof Audio
    try {
      const { result } = renderHook(() => useSoundEffects(false))
      result.current.play("goal")
      expect(played).toEqual([
        { src: "/sound/04_goal.mp3", volume: 1, currentTime: 0 },
      ])
    } finally {
      globalThis.Audio = OriginalAudio
    }
  })

  test("is silent while muted", () => {
    const OriginalAudio = globalThis.Audio
    const create = mock(() => {
      throw new Error("should not construct Audio while muted")
    })
    globalThis.Audio = create as unknown as typeof Audio
    try {
      const { result } = renderHook(() => useSoundEffects(true))
      result.current.play("next")
      expect(create).not.toHaveBeenCalled()
    } finally {
      globalThis.Audio = OriginalAudio
    }
  })
})
