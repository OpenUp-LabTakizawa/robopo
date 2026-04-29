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
  bg: "#0a0e2c",
  panelBg: "#10174d",
  panelBorder: "#ffe14a",
  textPrimary: "#fff",
  textMuted: "#9aa6e3",
  accent: "#ffe14a",
  accent2: "#34d651",
  warn: "#ff5e7a",
  success: "#34d651",
  trackColor: "#02021c",
  fontDisplay: '"Press Start 2P", "DotGothic16", monospace',
  fontMono: '"Press Start 2P", monospace',
  fontBody: '"DotGothic16", "Noto Sans JP", monospace',
}

export function ArcadeTheme({
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
        background: palette.bg,
        color: palette.textPrimary,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: palette.fontBody,
        position: "relative",
        imageRendering: "pixelated",
      }}
    >
      {/* Scanlines */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
      <TopBar
        competitionName={snapshot.competition.name}
        remainingMs={remainingMs}
        palette={palette}
        liveLabel="● LIVE"
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
              title: "► 注目のプレイヤー",
              courseBest: "ハイスコア更新！",
              personalBest: "自己ベスト更新！",
              score: "得点",
              attempts: "挑戦回数",
              bestRecord: "ステップ",
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
          title="★ ハイスコア ★"
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
        colors={["#ffe14a", "#34d651", "#ff5e7a", "#fff"]}
        count={fxEvent?.kind === "course-best" ? 56 : 30}
        spread={420}
      />
      <FlashOverlay
        trigger={
          fxEvent?.kind === "course-best" ? fxEvent.lastRun.challengeId : null
        }
        variant="white"
        duration={300}
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
              ? "ハイスコア更新！"
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
          variant="arcade"
        />
      )}
    </div>
  )
}
