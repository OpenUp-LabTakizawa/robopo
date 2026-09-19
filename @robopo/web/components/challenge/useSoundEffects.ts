"use client"

import { useRef } from "react"

const SOUNDS = {
  next: { src: "/sound/02_next.mp3", volume: 0.4 },
  back: { src: "/sound/03_back.mp3", volume: 0.2 },
  goal: { src: "/sound/04_goal.mp3", volume: 1.0 },
} as const

export type SoundName = keyof typeof SOUNDS

// Pick an idle instance for `src`, or create one; instances are pooled so
// rapid taps can overlap instead of cutting each other off.
export function acquireAudio(
  pool: Map<string, HTMLAudioElement[]>,
  src: string,
  create: (src: string) => HTMLAudioElement = (s) => new Audio(s),
): HTMLAudioElement {
  let instances = pool.get(src)
  if (!instances) {
    instances = []
    pool.set(src, instances)
  }
  const idle = instances.find((a) => a.ended || a.paused)
  if (idle) {
    return idle
  }
  const audio = create(src)
  instances.push(audio)
  return audio
}

// Scoring sound effects; silent while `muted`.
export function useSoundEffects(muted: boolean): {
  play: (name: SoundName) => void
} {
  const poolRef = useRef<Map<string, HTMLAudioElement[]>>(new Map())

  const play = (name: SoundName) => {
    if (muted) {
      return
    }
    const { src, volume } = SOUNDS[name]
    const audio = acquireAudio(poolRef.current, src)
    audio.volume = volume
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  return { play }
}
