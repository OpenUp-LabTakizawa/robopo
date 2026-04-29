"use client"

import { FxBanner } from "@/components/spectator/effects/banner"
import { FlashOverlay } from "@/components/spectator/effects/flash-overlay"
import { ParticleBurst } from "@/components/spectator/effects/particle-burst"
import { Ticker } from "@/components/spectator/effects/ticker"
import {
  CourseBestStrip,
  LeaderboardPanel,
  MainPanel,
  type Palette,
  TopBar,
} from "@/components/spectator/themes/shared"
import type { ThemeProps } from "@/components/spectator/themes/types"

const palette: Palette = {
  bg: "#070a14",
  panelBg: "#0f1525",
  panelBorder: "#1f2c47",
  textPrimary: "#e8edf5",
  textMuted: "#7a8aa8",
  accent: "#00e0ff",
  accent2: "#39ff88",
  warn: "#ffb347",
  success: "#39ff88",
  trackColor: "#080d1a",
  fontDisplay: '"Bebas Neue", "Noto Sans JP", sans-serif',
  fontMono: '"JetBrains Mono", monospace',
  fontBody: '"Noto Sans JP", system-ui, sans-serif',
}

export function EsportsTheme({
  snapshot,
  fxEvent,
  remainingMs,
  recentEvents,
  compact,
  selectedPlayerId,
  onSelectPlayer,
  onOpenSearch,
}: ThemeProps) {
  const burstColors = ["#00e0ff", "#39ff88", "#ffe14a", "#ffffff"]
  const bannerText =
    fxEvent?.kind === "course-best"
      ? "コース新記録！"
      : fxEvent?.kind === "personal-best"
        ? "自己ベスト更新！"
        : fxEvent?.kind === "takeover"
          ? "首位浮上！"
          : ""
  const bannerSubtext =
    fxEvent?.kind === "course-best" || fxEvent?.kind === "personal-best"
      ? fxEvent.lastRun.player.name
      : fxEvent?.kind === "takeover"
        ? `${fxEvent.newLeaderName} が首位へ`
        : undefined
  return (
    <div
      style={{
        background: palette.bg,
        color: palette.textPrimary,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: palette.fontBody,
        position: "relative",
      }}
    >
      <TopBar
        competitionName={snapshot.competition.name}
        remainingMs={remainingMs}
        palette={palette}
        liveLabel="LIVE"
        compact={compact}
      />
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: compact
            ? "minmax(0,1fr)"
            : "minmax(0,2fr) minmax(0,1fr)",
          gap: compact ? 10 : 16,
          padding: compact ? 10 : 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: compact ? 10 : 16,
          }}
        >
          <MainPanel
            snapshot={snapshot}
            selectedPlayerId={selectedPlayerId}
            palette={palette}
            labels={{ title: "▶ 注目の挑戦" }}
            compact={compact}
            onClearSelected={() => onSelectPlayer(null)}
            onOpenSearch={onOpenSearch}
          />
          {!compact && (
            <CourseBestStrip
              courses={snapshot.courses}
              bestPerCourse={snapshot.bestPerCourse}
              palette={palette}
            />
          )}
        </div>
        <LeaderboardPanel
          rows={snapshot.board}
          palette={palette}
          title="▶ ランキング TOP 5"
          compact={compact}
          onSelectPlayer={onSelectPlayer}
          selectedPlayerId={selectedPlayerId}
        />
        {compact && (
          <CourseBestStrip
            courses={snapshot.courses}
            bestPerCourse={snapshot.bestPerCourse}
            palette={palette}
            compact
          />
        )}
      </div>
      <Ticker
        items={recentEvents}
        bg="#000"
        color={palette.textPrimary}
        accentColor={palette.accent}
      />
      <ParticleBurst
        trigger={
          fxEvent?.kind === "course-best" || fxEvent?.kind === "personal-best"
            ? fxEvent.lastRun.challengeId
            : null
        }
        colors={burstColors}
        count={fxEvent?.kind === "course-best" ? 48 : 28}
        spread={fxEvent?.kind === "course-best" ? 460 : 320}
      />
      <FlashOverlay
        trigger={
          fxEvent?.kind === "course-best" ? fxEvent.lastRun.challengeId : null
        }
        variant="neon"
      />
      {bannerText && (
        <FxBanner
          trigger={
            fxEvent?.kind === "takeover"
              ? `${fxEvent.kind}-${fxEvent.newLeaderName}`
              : fxEvent?.lastRun?.challengeId
          }
          text={bannerText}
          subtext={bannerSubtext}
          variant="neon"
        />
      )}
    </div>
  )
}
