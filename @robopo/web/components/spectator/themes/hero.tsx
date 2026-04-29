"use client"

import { FxBanner } from "@/components/spectator/effects/banner"
import { FlashOverlay } from "@/components/spectator/effects/flash-overlay"
import { ParticleBurst } from "@/components/spectator/effects/particle-burst"
import { Ticker } from "@/components/spectator/effects/ticker"
import { fmtClock } from "@/components/spectator/effects/use-count-up"
import {
  CourseBestStrip,
  LeaderboardPanel,
  MainPanel,
  type Palette,
} from "@/components/spectator/themes/shared"
import type { ThemeProps } from "@/components/spectator/themes/types"

const palette: Palette = {
  bg: "#0a0608",
  panelBg: "#fff8e1",
  panelBorder: "#000",
  textPrimary: "#1a0e00",
  textMuted: "#6b3a00",
  accent: "#ff2230",
  accent2: "#ffe14a",
  warn: "#ff2230",
  success: "#168f1f",
  trackColor: "#1a0608",
  fontDisplay: '"RocknRoll One", "Noto Sans JP", sans-serif',
  fontMono: '"Noto Sans JP", monospace',
  fontBody: '"Noto Sans JP", system-ui, sans-serif',
}

export function HeroTheme({
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
          "linear-gradient(180deg, #ffe14a 0%, #ff2230 25%, #0a0608 100%)",
        color: palette.textPrimary,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: palette.fontBody,
        position: "relative",
      }}
    >
      <div
        style={{
          padding: compact ? 10 : 16,
          background: "linear-gradient(90deg, #ff2230, #ffe14a, #ff2230)",
          borderBottom: "4px solid #000",
          color: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: compact ? 8 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: compact ? 8 : 16,
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              background: "#000",
              color: "#ffe14a",
              padding: compact ? "3px 8px" : "6px 14px",
              fontFamily: palette.fontDisplay,
              fontWeight: 900,
              letterSpacing: compact ? 2 : 4,
              fontSize: compact ? 13 : 18,
              flexShrink: 0,
            }}
          >
            ★ LIVE ★
          </span>
          <span
            style={{
              fontFamily: palette.fontDisplay,
              fontSize: compact ? 22 : 36,
              fontWeight: 900,
              textShadow: "3px 3px 0 #000",
              letterSpacing: compact ? 1 : 3,
              flexShrink: 0,
            }}
          >
            ロボサバ
          </span>
          {!compact && (
            <span
              style={{
                fontSize: 14,
                color: "#1a0e00",
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {snapshot.competition.name}
            </span>
          )}
        </div>
        {remainingMs !== null && remainingMs > 0 && (
          <div
            style={{
              background: "#000",
              color: "#ffe14a",
              padding: compact ? "4px 8px" : "8px 16px",
              fontFamily: palette.fontDisplay,
              fontSize: compact ? 16 : 24,
              fontWeight: 900,
              border: "3px solid #ffe14a",
              flexShrink: 0,
            }}
          >
            残り {fmtClock(remainingMs)}
          </div>
        )}
      </div>
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
              title: "★ 結果速報！",
              courseBest: "コース新記録！",
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
          title="★ ランキング ★"
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
        color="#ffe14a"
        accentColor="#ff2230"
      />
      <ParticleBurst
        trigger={
          fxEvent?.kind === "course-best" || fxEvent?.kind === "personal-best"
            ? fxEvent.lastRun.challengeId
            : null
        }
        colors={["#ff2230", "#ffe14a", "#fff"]}
        count={fxEvent?.kind === "course-best" ? 64 : 36}
        spread={520}
      />
      <FlashOverlay
        trigger={
          fxEvent?.kind === "course-best" ? fxEvent.lastRun.challengeId : null
        }
        variant="gold"
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
              ? "新記録！"
              : fxEvent.kind === "personal-best"
                ? "自己ベスト！"
                : fxEvent.kind === "takeover"
                  ? "首位浮上！"
                  : "ナイスラン！"
          }
          subtext={
            fxEvent.kind === "takeover"
              ? fxEvent.newLeaderName
              : fxEvent.lastRun.player.name
          }
          variant="kanji"
        />
      )}
    </div>
  )
}
