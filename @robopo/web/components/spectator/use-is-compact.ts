"use client"

import { useEffect, useState } from "react"

const BREAKPOINT_PX = 780

// Returns true on narrow viewports (phones/portrait tablets).
// SSR-safe: defaults to false until first render.
export function useIsCompact(): boolean {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const update = () => setCompact(window.innerWidth < BREAKPOINT_PX)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return compact
}
