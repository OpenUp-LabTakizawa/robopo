"use client"

import { useEffect, useRef, useState } from "react"

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const previousTargetRef = useRef(target)

  useEffect(() => {
    if (target === previousTargetRef.current) {
      return
    }
    fromRef.current = previousTargetRef.current
    previousTargetRef.current = target
    let start: number | null = null
    let frame: number | null = null

    const tick = (now: number) => {
      if (start === null) {
        start = now
      }
      const elapsed = now - start
      const t = Math.min(1, elapsed / durationMs)
      const eased = easeOutCubic(t)
      const current = fromRef.current + (target - fromRef.current) * eased
      setValue(current)
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame)
      }
    }
  }, [target, durationMs])

  return value
}

export function fmtClock(remainingMs: number): string {
  const total = Math.max(0, Math.floor(remainingMs / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
