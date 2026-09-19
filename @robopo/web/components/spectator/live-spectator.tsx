"use client"

import { useState } from "react"
import { PlayerSearchDialog } from "@/components/spectator/player-search-dialog"
import { SpectatorControlPanel } from "@/components/spectator/spectator-control-panel"
import { ArcadeTheme } from "@/components/spectator/themes/arcade"
import { CyberpunkTheme } from "@/components/spectator/themes/cyberpunk"
import { EsportsTheme } from "@/components/spectator/themes/esports"
import { HeroTheme } from "@/components/spectator/themes/hero"
import { StadiumTheme } from "@/components/spectator/themes/stadium"
import { useIsCompact } from "@/components/spectator/use-is-compact"
import {
  useClock,
  useSelectedPlayer,
  useSpectatorTheme,
  useTickerEvents,
} from "@/components/spectator/use-spectator-preferences"
import type { SelectCompetition } from "@/lib/db/schema"
import type { SpectatorSnapshot, SpectatorTheme } from "@/lib/spectator/types"
import { useLiveFeed } from "@/lib/spectator/use-live-feed"

const THEME_COMPONENTS: Record<SpectatorTheme, typeof EsportsTheme> = {
  esports: EsportsTheme,
  cyberpunk: CyberpunkTheme,
  hero: HeroTheme,
  arcade: ArcadeTheme,
  stadium: StadiumTheme,
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
  const [theme, setTheme] = useSpectatorTheme()
  const [competitionId, setCompetitionId] = useState<number | null>(
    defaultCompetitionId,
  )
  const now = useClock()
  const [selectedPlayerId, setSelectedPlayerId] = useSelectedPlayer()
  const [searchOpen, setSearchOpen] = useState(false)

  // Pass the SSR initial snapshot as the seed *only* when the user is viewing
  // the same competition that the server pre-rendered. After they switch
  // competitions, we want a clean live fetch.
  const seed = competitionId === defaultCompetitionId ? initialSnapshot : null
  const { snapshot, fxEvent, clearFxEvent, connected } = useLiveFeed(
    competitionId,
    seed,
  )
  const recentEvents = useTickerEvents(fxEvent, clearFxEvent)

  const ThemeComponent = THEME_COMPONENTS[theme]
  const compact = useIsCompact()

  const remainingMs =
    snapshot?.competition.endDate && now !== null
      ? new Date(snapshot.competition.endDate).getTime() - now
      : null

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
      <SpectatorControlPanel
        compact={compact}
        connected={connected}
        competitions={competitions}
        competitionId={competitionId}
        onCompetitionChange={setCompetitionId}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  )
}
