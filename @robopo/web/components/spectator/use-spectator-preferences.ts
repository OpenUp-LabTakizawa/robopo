"use client"

import { useEffect, useRef, useState } from "react"
import { SPECTATOR_THEMES, type SpectatorTheme } from "@/lib/spectator/types"
import type { LiveFxEvent } from "@/lib/spectator/use-live-feed"

export const THEME_STORAGE_KEY = "robopo:spectator-theme"
export const SELECTED_PLAYER_STORAGE_KEY = "robopo:spectator-selected-player"
const TICKER_MAX_LINES = 12
const TICKER_FX_MS = 2400

export function isSpectatorTheme(value: unknown): value is SpectatorTheme {
  return SPECTATOR_THEMES.includes(value as SpectatorTheme)
}

function readStoredTheme(): SpectatorTheme | null {
  const v = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isSpectatorTheme(v) ? v : null
}

function readUrlTheme(): SpectatorTheme | null {
  const v = new URL(window.location.href).searchParams.get("theme")
  return isSpectatorTheme(v) ? v : null
}

// Parse a persisted player id; anything that is not a positive number is
// treated as "nothing selected".
export function parseStoredPlayerId(raw: string | null): number | null {
  if (!raw) {
    return null
  }
  const num = Number(raw)
  return Number.isFinite(num) && num > 0 ? num : null
}

// Theme choice, hydrated from ?theme= then localStorage after mount and
// written back to both whenever it changes.
export function useSpectatorTheme(): [
  SpectatorTheme,
  (theme: SpectatorTheme) => void,
] {
  const [theme, setTheme] = useState<SpectatorTheme>(SPECTATOR_THEMES[0])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setTheme(readUrlTheme() ?? readStoredTheme() ?? SPECTATOR_THEMES[0])
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    const url = new URL(window.location.href)
    url.searchParams.set("theme", theme)
    window.history.replaceState(null, "", url.toString())
  }, [theme, hydrated])

  return [theme, setTheme]
}

// Last selected player, persisted in localStorage.
export function useSelectedPlayer(): [
  number | null,
  (id: number | null) => void,
] {
  const [selectedPlayerId, setSelectedPlayerIdState] = useState<number | null>(
    null,
  )

  useEffect(() => {
    setSelectedPlayerIdState(
      parseStoredPlayerId(
        window.localStorage.getItem(SELECTED_PLAYER_STORAGE_KEY),
      ),
    )
  }, [])

  const setSelectedPlayerId = (id: number | null) => {
    setSelectedPlayerIdState(id)
    if (id === null) {
      window.localStorage.removeItem(SELECTED_PLAYER_STORAGE_KEY)
    } else {
      window.localStorage.setItem(SELECTED_PLAYER_STORAGE_KEY, String(id))
    }
  }

  return [selectedPlayerId, setSelectedPlayerId]
}

// Wall clock in ms, ticking every second. null until mounted: the SSR clock
// string would otherwise mismatch the client's first paint when the second
// ticks over.
export function useClock(): number | null {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function fxEventToTickerLine(fxEvent: LiveFxEvent): string {
  switch (fxEvent.kind) {
    case "course-best":
      return `🏆 コース新記録 ${fxEvent.lastRun.player.name} ${fxEvent.lastRun.point}pt (${fxEvent.lastRun.course.name})`
    case "personal-best":
      return `⭐ 自己ベスト更新 ${fxEvent.lastRun.player.name} ${fxEvent.lastRun.point}pt (${fxEvent.lastRun.course.name})`
    case "takeover":
      return `🚀 首位浮上 ${fxEvent.newLeaderName}${fxEvent.previousLeaderName ? ` (旧: ${fxEvent.previousLeaderName})` : ""}`
    case "score":
      return `▶ ${fxEvent.lastRun.player.name} ${fxEvent.lastRun.point}pt @ ${fxEvent.lastRun.course.name}`
  }
}

export type TickerEvent = { id: string; text: string }

// Rolling list of ticker lines; each fx event is appended once and then
// cleared from the feed after it has had time to animate.
export function useTickerEvents(
  fxEvent: LiveFxEvent | null,
  clearFxEvent: () => void,
): TickerEvent[] {
  const [recentEvents, setRecentEvents] = useState<TickerEvent[]>([])
  const seqRef = useRef(0)

  useEffect(() => {
    if (!fxEvent) {
      return
    }
    seqRef.current += 1
    const line = { id: `${seqRef.current}`, text: fxEventToTickerLine(fxEvent) }
    setRecentEvents((prev) => [...prev, line].slice(-TICKER_MAX_LINES))
    const t = setTimeout(clearFxEvent, TICKER_FX_MS)
    return () => clearTimeout(t)
  }, [fxEvent, clearFxEvent])

  return recentEvents
}
