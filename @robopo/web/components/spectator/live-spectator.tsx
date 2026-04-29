"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PlayerSearchDialog } from "@/components/spectator/player-search-dialog"
import { ArcadeTheme } from "@/components/spectator/themes/arcade"
import { CyberpunkTheme } from "@/components/spectator/themes/cyberpunk"
import { EsportsTheme } from "@/components/spectator/themes/esports"
import { HeroTheme } from "@/components/spectator/themes/hero"
import { StadiumTheme } from "@/components/spectator/themes/stadium"
import { useIsCompact } from "@/components/spectator/use-is-compact"
import type { SelectCompetition } from "@/lib/db/schema"
import {
  SPECTATOR_THEME_LABELS,
  SPECTATOR_THEMES,
  type SpectatorSnapshot,
  type SpectatorTheme,
} from "@/lib/spectator/types"
import { type LiveFxEvent, useLiveFeed } from "@/lib/spectator/use-live-feed"

const THEME_STORAGE_KEY = "robopo:spectator-theme"
const SELECTED_PLAYER_STORAGE_KEY = "robopo:spectator-selected-player"

function readStoredTheme(): SpectatorTheme | null {
  if (typeof window === "undefined") {
    return null
  }
  const v = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (
    v === "esports" ||
    v === "cyberpunk" ||
    v === "hero" ||
    v === "arcade" ||
    v === "stadium"
  ) {
    return v
  }
  return null
}

function readUrlTheme(): SpectatorTheme | null {
  if (typeof window === "undefined") {
    return null
  }
  const url = new URL(window.location.href)
  const v = url.searchParams.get("theme")
  if (
    v === "esports" ||
    v === "cyberpunk" ||
    v === "hero" ||
    v === "arcade" ||
    v === "stadium"
  ) {
    return v
  }
  return null
}

function THEME_COMPONENT(theme: SpectatorTheme): typeof EsportsTheme {
  switch (theme) {
    case "esports":
      return EsportsTheme
    case "cyberpunk":
      return CyberpunkTheme
    case "hero":
      return HeroTheme
    case "arcade":
      return ArcadeTheme
    case "stadium":
      return StadiumTheme
  }
}

function fxEventToTickerLine(fxEvent: LiveFxEvent): string {
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

export function LiveSpectator({
  competitions,
  defaultCompetitionId,
  initialSnapshot = null,
}: {
  competitions: SelectCompetition[]
  defaultCompetitionId: number | null
  initialSnapshot?: SpectatorSnapshot | null
}) {
  const [theme, setTheme] = useState<SpectatorTheme>("esports")
  const [hydrated, setHydrated] = useState(false)
  const [competitionId, setCompetitionId] = useState<number | null>(
    defaultCompetitionId,
  )
  const [now, setNow] = useState(() => Date.now())
  const [recentEvents, setRecentEvents] = useState<
    { id: string; text: string }[]
  >([])
  const tickerSeqRef = useRef(0)
  const [selectedPlayerId, setSelectedPlayerIdState] = useState<number | null>(
    null,
  )
  const [searchOpen, setSearchOpen] = useState(false)

  // Hydrate theme from URL/localStorage on mount.
  useEffect(() => {
    const initial = readUrlTheme() ?? readStoredTheme() ?? SPECTATOR_THEMES[0]
    setTheme(initial)
    setHydrated(true)
    // Hydrate last-selected player.
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(SELECTED_PLAYER_STORAGE_KEY)
      if (raw) {
        const num = Number(raw)
        if (Number.isFinite(num) && num > 0) {
          setSelectedPlayerIdState(num)
        }
      }
    }
  }, [])

  const setSelectedPlayerId = useCallback((id: number | null) => {
    setSelectedPlayerIdState(id)
    if (typeof window === "undefined") {
      return
    }
    if (id === null) {
      window.localStorage.removeItem(SELECTED_PLAYER_STORAGE_KEY)
    } else {
      window.localStorage.setItem(SELECTED_PLAYER_STORAGE_KEY, String(id))
    }
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    const url = new URL(window.location.href)
    url.searchParams.set("theme", theme)
    window.history.replaceState(null, "", url.toString())
  }, [theme, hydrated])

  // Tick clock for remaining time.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Pass the SSR initial snapshot as the seed *only* when the user is viewing
  // the same competition that the server pre-rendered. After they switch
  // competitions, we want a clean live fetch.
  const seed = competitionId === defaultCompetitionId ? initialSnapshot : null
  const { snapshot, fxEvent, clearFxEvent, connected } = useLiveFeed(
    competitionId,
    seed,
  )

  // Append recent events for ticker on every fxEvent.
  useEffect(() => {
    if (!fxEvent) {
      return
    }
    tickerSeqRef.current += 1
    const id = `${tickerSeqRef.current}`
    const text = fxEventToTickerLine(fxEvent)
    setRecentEvents((prev) => {
      const next = [...prev, { id, text }]
      return next.slice(-12)
    })
    const t = setTimeout(clearFxEvent, 2400)
    return () => clearTimeout(t)
  }, [fxEvent, clearFxEvent])

  const ThemeComponent = useMemo(() => THEME_COMPONENT(theme), [theme])
  const compact = useIsCompact()

  const remainingMs = useMemo(() => {
    if (!snapshot?.competition.endDate) {
      return null
    }
    return new Date(snapshot.competition.endDate).getTime() - now
  }, [snapshot?.competition.endDate, now])

  if (competitions.length === 0) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontWeight: 700, opacity: 0.6, fontSize: 22 }}>
          現在開催中の大会はありません
        </h2>
        <p style={{ opacity: 0.4 }}>
          大会が開催されると、ここに観戦画面が表示されます
        </p>
      </div>
    )
  }

  if (!snapshot) {
    // Skeleton is rendered by app/spectator/loading.tsx via Suspense.
    // Once the page navigates here, hold an empty dark canvas until the SSE
    // snapshot lands — no spinner / "loading" copy.
    return <div style={{ minHeight: "100dvh", background: "#0a0a14" }} />
  }

  return (
    <div style={{ position: "relative" }}>
      <ThemeComponent
        snapshot={snapshot}
        fxEvent={fxEvent}
        remainingMs={remainingMs}
        recentEvents={recentEvents}
        compact={compact}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={setSelectedPlayerId}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <PlayerSearchDialog
        open={searchOpen}
        players={Object.values(snapshot.playerDetails)}
        onClose={() => setSearchOpen(false)}
        onSelect={(id) => {
          setSelectedPlayerId(id)
          setSearchOpen(false)
        }}
      />
      {/* Floating control panel — anchored to top-right on desktop, to bottom on mobile to avoid clashing with TopBar. */}
      <div
        style={{
          position: "fixed",
          ...(compact
            ? {
                bottom: 8,
                left: 8,
                right: 8,
              }
            : {
                top: 12,
                right: 12,
              }),
          background: "rgba(0,0,0,0.78)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8,
          padding: compact ? 8 : 8,
          display: "flex",
          flexDirection: "row",
          gap: compact ? 8 : 10,
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 80,
          color: "#fff",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Link
            href="/"
            title="トップへ戻る"
            style={{
              fontFamily: '"Bebas Neue", "Noto Sans JP", sans-serif',
              fontWeight: 900,
              fontSize: compact ? 14 : 16,
              letterSpacing: compact ? 2 : 3,
              color: "#fff",
              paddingRight: compact ? 6 : 8,
              borderRight: "1px solid rgba(255,255,255,0.2)",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            ROBOPO
          </Link>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#39ff88" : "#ff5e7a",
              boxShadow: connected ? "0 0 8px #39ff88" : "0 0 8px #ff5e7a",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {competitions.length > 1 && (
            <select
              value={competitionId ?? 0}
              onChange={(e) => setCompetitionId(Number(e.target.value))}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "inherit",
                fontSize: 12,
                maxWidth: compact ? 120 : "none",
              }}
            >
              {competitions.map((c) => (
                <option key={c.id} value={c.id} style={{ color: "#000" }}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as SpectatorTheme)}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "inherit",
              fontSize: 12,
            }}
          >
            {SPECTATOR_THEMES.map((t) => (
              <option key={t} value={t} style={{ color: "#000" }}>
                {SPECTATOR_THEME_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
