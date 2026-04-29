"use client"

import { useEffect, useMemo, useState } from "react"
import type { SpectatorPlayerDetail } from "@/lib/spectator/types"

export function PlayerSearchDialog({
  open,
  players,
  onClose,
  onSelect,
}: {
  open: boolean
  players: SpectatorPlayerDetail[]
  onClose: () => void
  onSelect: (playerId: number) => void
}) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!open) {
      return
    }
    setQuery("")
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const filtered = useMemo(() => {
    if (!open) {
      return []
    }
    const q = query.trim().toLowerCase()
    const sorted = [...players].sort((a, b) => {
      // Players with attempts first, then by total point desc, then by name.
      if (a.totalAttempts === 0 && b.totalAttempts !== 0) {
        return 1
      }
      if (b.totalAttempts === 0 && a.totalAttempts !== 0) {
        return -1
      }
      if (b.totalPoint !== a.totalPoint) {
        return b.totalPoint - a.totalPoint
      }
      return a.player.name.localeCompare(b.player.name, "ja")
    })
    if (!q) {
      return sorted
    }
    return sorted.filter((d) => {
      const name = d.player.name?.toLowerCase() ?? ""
      const furigana = d.player.furigana?.toLowerCase() ?? ""
      const bib = d.player.bibNumber?.toLowerCase() ?? ""
      return name.includes(q) || furigana.includes(q) || bib.includes(q)
    })
  }, [open, players, query])

  if (!open) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 90,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="選手検索"
    >
      <div
        style={{
          background: "#0f1525",
          color: "#e8edf5",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          width: "100%",
          maxWidth: 540,
          maxHeight: "calc(100dvh - 48px)",
          display: "flex",
          flexDirection: "column",
          fontFamily: '"Noto Sans JP", system-ui, sans-serif',
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "#7a8aa8",
                fontFamily: '"JetBrains Mono", monospace',
                marginBottom: 4,
              }}
            >
              選手を探す
            </div>
            <input
              // biome-ignore lint/a11y/noAutofocus: search input inside an opened dialog — auto-focus is the expected affordance
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前・ふりがな・ゼッケン番号で検索"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                color: "#e8edf5",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#7a8aa8",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ✕ 閉じる
          </button>
        </div>
        <div
          style={{
            overflowY: "auto",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "#7a8aa8",
                fontSize: 13,
              }}
            >
              該当する選手が見つかりませんでした
            </div>
          ) : (
            filtered.map((d) => (
              <button
                key={d.player.id}
                type="button"
                onClick={() => onSelect(d.player.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid transparent",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontFamily: "inherit",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,224,255,0.08)"
                  e.currentTarget.style.borderColor = "rgba(0,224,255,0.3)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                  e.currentTarget.style.borderColor = "transparent"
                }}
              >
                {d.player.bibNumber && (
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      background: "#00e0ff",
                      color: "#070a14",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    #{d.player.bibNumber}
                  </span>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.player.name}
                  </div>
                  {d.player.furigana && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#7a8aa8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.player.furigana}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                    color: "#7a8aa8",
                    flexShrink: 0,
                  }}
                >
                  <div>
                    {d.totalAttempts > 0
                      ? `${d.totalAttempts}回挑戦`
                      : "未挑戦"}
                  </div>
                  <div
                    style={{
                      color: d.totalPoint > 0 ? "#39ff88" : "#7a8aa8",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {d.totalPoint} pt
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
