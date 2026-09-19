"use client"

import Link from "next/link"
import type { SelectCompetition } from "@/lib/db/schema"
import {
  SPECTATOR_THEME_LABELS,
  SPECTATOR_THEMES,
  type SpectatorTheme,
} from "@/lib/spectator/types"

const selectStyle = {
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  padding: "2px 6px",
  borderRadius: 4,
  fontFamily: "inherit",
  fontSize: 12,
} as const

// Floating control panel — anchored to top-right on desktop, to bottom on
// mobile to avoid clashing with TopBar.
export function SpectatorControlPanel({
  compact,
  connected,
  competitions,
  competitionId,
  onCompetitionChange,
  theme,
  onThemeChange,
}: {
  compact: boolean
  connected: boolean
  competitions: SelectCompetition[]
  competitionId: number | null
  onCompetitionChange: (id: number) => void
  theme: SpectatorTheme
  onThemeChange: (theme: SpectatorTheme) => void
}) {
  return (
    <div
      style={{
        position: "fixed",
        ...(compact
          ? { bottom: 8, left: 8, right: 8 }
          : { top: 12, right: 12 }),
        background: "rgba(0,0,0,0.78)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 8,
        padding: 8,
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {competitions.length > 1 && (
          <select
            value={competitionId ?? 0}
            onChange={(e) => onCompetitionChange(Number(e.target.value))}
            style={{ ...selectStyle, maxWidth: compact ? 120 : "none" }}
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
          onChange={(e) => onThemeChange(e.target.value as SpectatorTheme)}
          style={selectStyle}
        >
          {SPECTATOR_THEMES.map((t) => (
            <option key={t} value={t} style={{ color: "#000" }}>
              {SPECTATOR_THEME_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
