"use client"

import { useSyncExternalStore } from "react"

const BREAKPOINT_PX = 780
const QUERY = `(max-width: ${BREAKPOINT_PX - 1}px)`

let mql: MediaQueryList | null = null

// Lazily created on the client; there is no window on the server.
function mediaQuery(): MediaQueryList {
  mql ??= window.matchMedia(QUERY)
  return mql
}

function subscribe(onChange: () => void): () => void {
  const mq = mediaQuery()
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

function getSnapshot(): boolean {
  return mediaQuery().matches
}

// Server snapshot: no viewport on the server, so hydrate as "not compact".
function getServerSnapshot(): boolean {
  return false
}

// Returns true on narrow viewports (phones/portrait tablets).
// Backed by matchMedia so it only re-renders when the breakpoint flips,
// not on every resize event.
export function useIsCompact(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
