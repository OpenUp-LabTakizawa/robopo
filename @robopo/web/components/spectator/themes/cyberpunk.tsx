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
  bg: "#08010f",
  panelBg: "rgba(20,5,30,0.85)",
  panelBorder: "#ff2bd6",
  textPrimary: "#fdf3ff",
  textMuted: "#a37ec2",
  accent: "#ff2bd6",
  accent2: "#00fff0",
  warn: "#ffd24a",
  success: "#00fff0",
  trackColor: "#10031c",
  fontDisplay: '"Orbitron", "Noto Sans JP", sans-serif',
  fontMono: '"JetBrains Mono", monospace',
  fontBody: '"Noto Sans JP", system-ui, sans-serif',
}

export function CyberpunkTheme({
  snapshot,
  fxEvent,
  remainingMs,
  recentEvents,
  compact,
  selectedPlayerId,
  onSelectPlayer,
  onOpenSearch,
}: ThemeProps) {
  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 20% 0%, #2a0d44 0%, #08010f 65%)",
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
            labels={{
              title: "▶ 注目の挑戦",
              courseBest: "コース新記録！",
              personalBest: "自己ベスト更新！",
            }}
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
          title="▶ ランキング"
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
        color={palette.accent}
        accentColor={palette.accent2}
      />
      <ParticleBurst
        trigger={
          fxEvent?.kind === "course-best" || fxEvent?.kind === "personal-best"
            ? fxEvent.lastRun.challengeId
            : null
        }
        colors={["#ff2bd6", "#00fff0", "#ffd24a", "#fff"]}
        count={fxEvent?.kind === "course-best" ? 56 : 32}
        spread={420}
      />
      <FlashOverlay
        trigger={
          fxEvent?.kind === "course-best" ? fxEvent.lastRun.challengeId : null
        }
        variant="neon"
      />
      {fxEvent && (
        <FxBanner
          trigger={
            fxEvent.kind === "takeover"
              ? `tk-${fxEvent.newLeaderName}`
              : fxEvent.lastRun.challengeId
          }
          text={
            fxEvent.kind === "course-best"
              ? "コース新記録！"
              : fxEvent.kind === "personal-best"
                ? "自己ベスト更新！"
                : fxEvent.kind === "takeover"
                  ? "首位浮上！"
                  : "ナイスラン！"
          }
          subtext={
            fxEvent.kind === "takeover"
              ? fxEvent.newLeaderName
              : fxEvent.lastRun.player.name
          }
          variant="glitch"
        />
      )}
    </div>
  )
}
