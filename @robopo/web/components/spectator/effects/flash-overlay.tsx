"use client"

import { useEffect, useState } from "react"

const VARIANT_BG: Record<string, string> = {
  white: "rgba(255,255,255,0.95)",
  gold: "rgba(255,215,80,0.85)",
  neon: "rgba(0,224,255,0.7)",
  red: "rgba(255,40,80,0.85)",
}

export function FlashOverlay({
  trigger,
  variant = "white",
  duration = 600,
}: {
  trigger: unknown
  variant?: keyof typeof VARIANT_BG
  duration?: number
}) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (trigger === null || trigger === undefined) {
      return
    }
    setActive(true)
    const t = setTimeout(() => setActive(false), duration)
    return () => clearTimeout(t)
  }, [trigger, duration])

  if (!active) {
    return null
  }
  return (
    <div
      className="pointer-events-none absolute inset-0 z-40"
      style={{
        background: VARIANT_BG[variant],
        animation: `spectator-flash-fade ${duration}ms ease-out forwards`,
      }}
    />
  )
}
