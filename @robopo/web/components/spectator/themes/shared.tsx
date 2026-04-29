"use client"

import type React from "react"
import { CoursePreview } from "@/components/spectator/course-preview"
import {
  fmtClock,
  useCountUp,
} from "@/components/spectator/effects/use-count-up"
import type {
  SpectatorBoardRow,
  SpectatorCourseBest,
  SpectatorCourseInfo,
  SpectatorLastRun,
  SpectatorPlayerDetail,
} from "@/lib/spectator/types"

export type Palette = {
  bg: string
  panelBg: string
  panelBorder: string
  textPrimary: string
  textMuted: string
  accent: string
  accent2: string
  warn: string
  success: string
  fontDisplay: string
  fontMono: string
  fontBody: string
  trackColor: string
}

export function StatBlock({
  label,
  value,
  color,
  suffix,
  fontFamily,
  compact = false,
}: {
  label: string
  value: string | number
  color: string
  suffix?: string
  fontFamily?: string
  compact?: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontSize: compact ? 10 : 11,
          letterSpacing: 2,
          opacity: 0.7,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: compact ? 22 : 28,
          fontWeight: 800,
          color,
          fontFamily,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {suffix && (
          <span style={{ fontSize: 12, marginLeft: 4, opacity: 0.7 }}>
            {suffix}
          </span>
        )}
      </span>
    </div>
  )
}

// Last Run / Latest Result panel — shared layout, palette-driven look.
export function LastRunPanel({
  lastRun,
  palette,
  labels,
  compact = false,
}: {
  lastRun: SpectatorLastRun | null
  palette: Palette
  labels: {
    title: string
    courseBest?: string
    personalBest?: string
    score?: string
    course?: string
    attempts?: string
    bestRecord?: string
  }
  compact?: boolean
}) {
  const point = useCountUp(lastRun?.point ?? 0, 700)
  if (!lastRun) {
    return (
      <div
        style={{
          background: palette.panelBg,
          border: `2px solid ${palette.panelBorder}`,
          color: palette.textMuted,
          padding: compact ? 20 : 32,
          borderRadius: 14,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: palette.fontMono,
            fontSize: 12,
            letterSpacing: 4,
            color: palette.accent,
          }}
        >
          ▶ 注目の挑戦
        </div>
        <div
          style={{
            fontFamily: palette.fontDisplay,
            fontSize: compact ? 20 : 26,
            letterSpacing: 2,
          }}
        >
          ハイライトはまだありません
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          自己ベスト・コース新記録の更新をここでお知らせします
        </div>
      </div>
    )
  }

  const cleared = lastRun.point > 0
  const reachedIndex = Math.max(lastRun.firstResult, lastRun.retryResult ?? 0)
  // Total mission steps for the course = (mission length - 2) / 2 (2 entries are
  // start/goal direction, then pairs of [type, parameter]).
  const totalSteps = (() => {
    if (!lastRun.course.mission) {
      return 0
    }
    const parts = lastRun.course.mission.split(";")
    const pairCount = Math.max(0, parts.length - 2)
    return Math.floor(pairCount / 2)
  })()
  const isCleared = totalSteps > 0 && reachedIndex >= totalSteps

  return (
    <div
      style={{
        background: palette.panelBg,
        border: `2px solid ${palette.panelBorder}`,
        color: palette.textPrimary,
        padding: compact ? 14 : 24,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: compact ? 12 : 18,
        boxShadow: `0 8px 32px ${palette.accent}33`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: compact ? "column" : "row",
          justifyContent: "space-between",
          gap: compact ? 8 : 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: palette.fontMono,
              fontSize: 12,
              letterSpacing: 4,
              color: palette.accent,
            }}
          >
            {labels.title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginTop: 4,
            }}
          >
            {lastRun.player.bibNumber && (
              <span
                style={{
                  fontFamily: palette.fontMono,
                  background: palette.accent,
                  color: palette.bg,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                #{lastRun.player.bibNumber}
              </span>
            )}
            <span
              style={{
                fontFamily: palette.fontDisplay,
                fontSize: compact ? 24 : 36,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {lastRun.player.name}
            </span>
          </div>
          {lastRun.player.furigana && (
            <div
              style={{
                fontSize: 12,
                color: palette.textMuted,
                marginTop: 4,
              }}
            >
              {lastRun.player.furigana}
            </div>
          )}
        </div>
        <div style={{ textAlign: compact ? "left" : "right" }}>
          {/*
            Reserve a fixed-height slot for the badge so the surrounding
            layout does not shift when the badge appears or disappears
            (avoids CLS on first/last paints).
          */}
          <div
            style={{
              minHeight: 32,
              marginBottom: 4,
              display: "flex",
              justifyContent: compact ? "flex-start" : "flex-end",
              alignItems: "flex-start",
            }}
          >
            {lastRun.isCourseBest && (
              <span
                style={{
                  background: palette.warn,
                  color: "#000",
                  padding: "6px 12px",
                  fontFamily: palette.fontDisplay,
                  fontWeight: 900,
                  letterSpacing: 4,
                  animation: "spectator-pulse-soft 1.4s ease-in-out infinite",
                }}
              >
                {labels.courseBest ?? "コース新記録！"}
              </span>
            )}
            {!lastRun.isCourseBest && lastRun.isPersonalBest && (
              <span
                style={{
                  background: palette.accent2,
                  color: "#000",
                  padding: "6px 12px",
                  fontFamily: palette.fontDisplay,
                  fontWeight: 900,
                  letterSpacing: 4,
                }}
              >
                {labels.personalBest ?? "自己ベスト更新！"}
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: palette.fontMono,
              fontSize: 12,
              color: palette.textMuted,
            }}
          >
            {labels.course ?? "コース"}
          </div>
          <div
            style={{
              fontFamily: palette.fontDisplay,
              fontSize: compact ? 18 : 22,
              fontWeight: 800,
            }}
          >
            {lastRun.course.name}
          </div>
        </div>
      </div>

      <CoursePreview
        fieldRaw={lastRun.course.field}
        missionRaw={lastRun.course.mission}
        reachedIndex={reachedIndex}
        height={compact ? 200 : 280}
        accent={palette.accent}
        trackColor={palette.trackColor}
        successColor={palette.success}
        failColor={palette.warn}
        showOverlayLabel={false}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: compact ? 10 : 16,
          paddingTop: 8,
          borderTop: `1px solid ${palette.panelBorder}`,
          alignItems: "end",
        }}
      >
        <StatBlock
          label={labels.score ?? "得点"}
          value={Math.round(point)}
          suffix={`/ ${lastRun.course.maxPoint}`}
          color={cleared ? palette.success : palette.warn}
          fontFamily={palette.fontDisplay}
          compact={compact}
        />
        <StatBlock
          label="自己ベスト"
          value={lastRun.bestPoint}
          color={palette.accent2}
          fontFamily={palette.fontDisplay}
          compact={compact}
        />
        <StatBlock
          label={labels.attempts ?? "挑戦回数"}
          value={lastRun.attemptsAfter}
          color={palette.textPrimary}
          fontFamily={palette.fontDisplay}
          compact={compact}
        />
        <StatBlock
          label={labels.bestRecord ?? "ステップ"}
          value={
            totalSteps > 0
              ? `${reachedIndex} / ${totalSteps}`
              : `${reachedIndex}`
          }
          suffix={isCleared ? "✓ クリア" : undefined}
          color={isCleared ? palette.success : palette.textPrimary}
          fontFamily={palette.fontDisplay}
          compact={compact}
        />
      </div>
    </div>
  )
}

export function LeaderboardPanel({
  rows,
  palette,
  title,
  highlightTop = 1,
  compact = false,
  onSelectPlayer,
  selectedPlayerId,
}: {
  rows: SpectatorBoardRow[]
  palette: Palette
  title: string
  highlightTop?: number
  compact?: boolean
  onSelectPlayer?: (playerId: number) => void
  selectedPlayerId?: number | null
}) {
  const top = rows.slice(0, 5)
  return (
    <div
      style={{
        background: palette.panelBg,
        border: `2px solid ${palette.panelBorder}`,
        color: palette.textPrimary,
        padding: compact ? 14 : 20,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
      }}
    >
      <div
        style={{
          fontFamily: palette.fontMono,
          fontSize: 12,
          letterSpacing: 4,
          color: palette.accent,
        }}
      >
        {title}
      </div>
      {top.length === 0 ? (
        <div
          style={{
            color: palette.textMuted,
            textAlign: "center",
            padding: 24,
            fontSize: 14,
          }}
        >
          記録待ち
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {top.map((row, i) => {
            const isTop = i < highlightTop
            const isSelected = selectedPlayerId === row.player.id
            const handleClick = onSelectPlayer
              ? () => onSelectPlayer(row.player.id)
              : undefined
            return (
              <div
                key={row.player.id}
                {...(handleClick
                  ? {
                      role: "button",
                      tabIndex: 0,
                      onClick: handleClick,
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleClick()
                        }
                      },
                    }
                  : {})}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr auto auto",
                  gap: 12,
                  alignItems: "center",
                  background: isSelected
                    ? `linear-gradient(90deg, ${palette.accent2}33, transparent)`
                    : isTop
                      ? `linear-gradient(90deg, ${palette.accent}33, transparent)`
                      : "transparent",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: isSelected
                    ? `2px solid ${palette.accent2}`
                    : isTop
                      ? `1px solid ${palette.accent}`
                      : `1px solid ${palette.panelBorder}`,
                  cursor: handleClick ? "pointer" : "default",
                }}
              >
                <div
                  style={{
                    fontFamily: palette.fontDisplay,
                    fontSize: 22,
                    fontWeight: 900,
                    color: isTop ? palette.accent : palette.textMuted,
                    textAlign: "center",
                  }}
                >
                  {row.rank}
                </div>
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: palette.textPrimary,
                    }}
                  >
                    {row.player.name}
                  </span>
                  {row.player.bibNumber && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontFamily: palette.fontMono,
                        fontSize: 11,
                        color: palette.textMuted,
                      }}
                    >
                      #{row.player.bibNumber}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: palette.fontMono,
                    fontSize: 12,
                    color: palette.textMuted,
                  }}
                >
                  {row.attempts}回
                </div>
                <div
                  style={{
                    fontFamily: palette.fontDisplay,
                    fontSize: 24,
                    fontWeight: 900,
                    color: isTop ? palette.success : palette.textPrimary,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {row.total}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function CourseBestStrip({
  courses,
  bestPerCourse,
  palette,
  compact = false,
}: {
  courses: SpectatorCourseInfo[]
  bestPerCourse: Record<number, SpectatorCourseBest>
  palette: Palette
  compact?: boolean
}) {
  if (courses.length === 0) {
    return null
  }
  const columns = compact
    ? Math.min(courses.length, 2)
    : Math.min(courses.length, 4)
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: compact ? 8 : 12,
      }}
    >
      {courses.map((c) => {
        const best = bestPerCourse[c.id]
        return (
          <div
            key={c.id}
            style={{
              background: palette.panelBg,
              border: `2px solid ${palette.panelBorder}`,
              borderRadius: 12,
              padding: compact ? 8 : 12,
              color: palette.textPrimary,
            }}
          >
            <div
              style={{
                fontFamily: palette.fontMono,
                fontSize: compact ? 10 : 11,
                color: palette.accent,
                letterSpacing: compact ? 2 : 3,
              }}
            >
              コース最高記録
            </div>
            <div
              style={{
                fontFamily: palette.fontDisplay,
                fontWeight: 800,
                fontSize: compact ? 14 : 18,
                marginTop: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: 6,
              }}
            >
              <span style={{ color: palette.textMuted, fontSize: 13 }}>
                {best?.player?.name ?? "—"}
              </span>
              <span
                style={{
                  fontFamily: palette.fontDisplay,
                  fontWeight: 900,
                  fontSize: 22,
                  color: palette.success,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {best?.point ?? 0}
                <span
                  style={{
                    fontSize: 11,
                    color: palette.textMuted,
                    marginLeft: 4,
                  }}
                >
                  / {c.maxPoint}
                </span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TopBar({
  competitionName,
  remainingMs,
  palette,
  liveLabel = "LIVE",
  compact = false,
}: {
  competitionName: string
  remainingMs: number | null
  palette: Palette
  liveLabel?: string
  compact?: boolean
}) {
  const showClock = remainingMs !== null && remainingMs > 0
  const clockText = showClock ? fmtClock(remainingMs) : null
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: compact ? "8px 12px" : "12px 24px",
        background: "rgba(0,0,0,0.55)",
        borderBottom: `2px solid ${palette.accent}`,
        color: palette.textPrimary,
        gap: compact ? 8 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 8 : 18,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{
            background: palette.warn,
            color: "#000",
            padding: compact ? "2px 6px" : "4px 10px",
            fontFamily: palette.fontDisplay,
            fontWeight: 900,
            letterSpacing: compact ? 1 : 3,
            fontSize: compact ? 12 : 16,
            animation: "spectator-pulse-soft 1.4s ease-in-out infinite",
            flexShrink: 0,
          }}
        >
          ● {liveLabel}
        </span>
        <span
          style={{
            fontFamily: palette.fontDisplay,
            fontSize: compact ? 18 : 28,
            fontWeight: 900,
            letterSpacing: compact ? 2 : 6,
            color: palette.accent,
            flexShrink: 0,
          }}
        >
          ROBOSAVA
        </span>
        {!compact && (
          <span
            style={{
              color: palette.textMuted,
              fontSize: 14,
              fontFamily: palette.fontMono,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {competitionName}
          </span>
        )}
      </div>
      {showClock ? (
        <div
          style={{
            fontFamily: palette.fontMono,
            fontSize: compact ? 18 : 28,
            fontWeight: 700,
            color: palette.warn,
            textShadow: `0 0 12px ${palette.warn}`,
            flexShrink: 0,
          }}
        >
          {clockText}
        </div>
      ) : (
        <div
          style={{
            fontFamily: palette.fontMono,
            fontSize: compact ? 11 : 14,
            color: palette.textMuted,
            flexShrink: 0,
          }}
        >
          時刻未設定
        </div>
      )}
    </div>
  )
}

/**
 * Renders either the player-focus panel (when a player is selected) or
 * the highlight (last-run) panel. Themes call this via their main slot.
 */
export function MainPanel({
  snapshot,
  selectedPlayerId,
  palette,
  labels,
  compact = false,
  onClearSelected,
  onOpenSearch,
}: {
  snapshot: import("@/lib/spectator/types").SpectatorSnapshot
  selectedPlayerId: number | null
  palette: Palette
  labels: {
    title: string
    courseBest?: string
    personalBest?: string
    score?: string
    course?: string
    attempts?: string
    bestRecord?: string
  }
  compact?: boolean
  onClearSelected: () => void
  onOpenSearch: () => void
}) {
  const detail =
    selectedPlayerId !== null ? snapshot.playerDetails[selectedPlayerId] : null
  if (detail) {
    return (
      <PlayerDetailPanel
        detail={detail}
        courses={snapshot.courses}
        palette={palette}
        compact={compact}
        onClose={onClearSelected}
        onOpenSearch={onOpenSearch}
      />
    )
  }
  return (
    <LastRunPanel
      lastRun={snapshot.lastRun}
      palette={palette}
      labels={labels}
      compact={compact}
    />
  )
}

/**
 * Player-focus panel: shows the entire competition record for a single
 * selected player (their per-course bests, attempts, and a course preview
 * for their best-scoring course).
 */
export function PlayerDetailPanel({
  detail,
  courses,
  palette,
  compact = false,
  onClose,
  onOpenSearch,
}: {
  detail: SpectatorPlayerDetail
  courses: SpectatorCourseInfo[]
  palette: Palette
  compact?: boolean
  onClose: () => void
  onOpenSearch?: () => void
}) {
  // Pick the player's best-scoring course as the featured preview.
  const featured = (() => {
    let best: {
      courseId: number
      bestPoint: number
      reachedIndex: number
    } | null = null
    for (const c of courses) {
      const s = detail.perCourse[c.id]
      if (!s) {
        continue
      }
      if (!best || s.bestPoint > best.bestPoint) {
        best = {
          courseId: c.id,
          bestPoint: s.bestPoint,
          reachedIndex: s.bestReachedIndex,
        }
      }
    }
    if (!best) {
      return null
    }
    const course = courses.find((c) => c.id === best.courseId)
    if (!course) {
      return null
    }
    return { course, ...best }
  })()

  return (
    <div
      style={{
        background: palette.panelBg,
        border: `2px solid ${palette.panelBorder}`,
        color: palette.textPrimary,
        padding: compact ? 14 : 24,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: compact ? 12 : 18,
        boxShadow: `0 8px 32px ${palette.accent}33`,
      }}
    >
      {/* Header: title + close button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: palette.fontMono,
            fontSize: 12,
            letterSpacing: 4,
            color: palette.accent,
          }}
        >
          ▶ 選手フォーカス
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              style={{
                background: "transparent",
                color: palette.textMuted,
                border: `1px solid ${palette.panelBorder}`,
                padding: "4px 10px",
                borderRadius: 6,
                fontFamily: palette.fontMono,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              他の選手を探す
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: palette.textMuted,
              border: `1px solid ${palette.panelBorder}`,
              padding: "4px 10px",
              borderRadius: 6,
              fontFamily: palette.fontMono,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ✕ 閉じる
          </button>
        </div>
      </div>

      {/* Player header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {detail.player.bibNumber && (
          <span
            style={{
              fontFamily: palette.fontMono,
              background: palette.accent,
              color: palette.bg,
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            #{detail.player.bibNumber}
          </span>
        )}
        <span
          style={{
            fontFamily: palette.fontDisplay,
            fontSize: compact ? 24 : 36,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {detail.player.name}
        </span>
        {detail.rank !== null && detail.totalPoint > 0 && (
          <span
            style={{
              fontFamily: palette.fontDisplay,
              fontSize: 16,
              fontWeight: 800,
              color: palette.success,
            }}
          >
            総合 {detail.rank}位
          </span>
        )}
      </div>
      {detail.player.furigana && (
        <div
          style={{
            fontSize: 12,
            color: palette.textMuted,
            marginTop: -8,
          }}
        >
          {detail.player.furigana}
        </div>
      )}

      {/* Featured course preview */}
      {featured && featured.bestPoint > 0 ? (
        <div>
          <div
            style={{
              fontFamily: palette.fontMono,
              fontSize: 11,
              color: palette.textMuted,
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            ベストコース: {featured.course.name}
          </div>
          <CoursePreview
            fieldRaw={featured.course.field}
            missionRaw={featured.course.mission}
            reachedIndex={featured.reachedIndex}
            height={compact ? 200 : 260}
            accent={palette.accent}
            trackColor={palette.trackColor}
            successColor={palette.success}
            failColor={palette.warn}
            showOverlayLabel={false}
          />
        </div>
      ) : (
        <div
          style={{
            padding: compact ? 16 : 24,
            textAlign: "center",
            color: palette.textMuted,
            background: palette.trackColor,
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          まだ挑戦記録がありません
        </div>
      )}

      {/* Per-course summary table */}
      <div
        style={{
          display: "grid",
          gap: compact ? 8 : 10,
          gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
        }}
      >
        {courses.map((c) => {
          const s = detail.perCourse[c.id]
          const bestPoint = s?.bestPoint ?? 0
          const attempts = s?.attempts ?? 0
          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: compact ? "6px 10px" : "8px 12px",
                border: `1px solid ${palette.panelBorder}`,
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: palette.fontDisplay,
                    fontWeight: 800,
                    fontSize: compact ? 14 : 16,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontFamily: palette.fontMono,
                    fontSize: 11,
                    color: palette.textMuted,
                  }}
                >
                  {attempts} 回挑戦
                </div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: palette.fontDisplay,
                    fontSize: compact ? 18 : 22,
                    fontWeight: 900,
                    color: bestPoint > 0 ? palette.success : palette.textMuted,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {bestPoint}
                  <span
                    style={{
                      fontSize: 11,
                      color: palette.textMuted,
                      marginLeft: 4,
                    }}
                  >
                    / {c.maxPoint}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Totals row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTop: `1px solid ${palette.panelBorder}`,
        }}
      >
        <div
          style={{
            fontFamily: palette.fontMono,
            fontSize: 12,
            color: palette.textMuted,
            letterSpacing: 2,
          }}
        >
          合計 / {detail.totalAttempts} 回挑戦
        </div>
        <div
          style={{
            fontFamily: palette.fontDisplay,
            fontSize: compact ? 24 : 32,
            fontWeight: 900,
            color: detail.totalPoint > 0 ? palette.success : palette.textMuted,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {detail.totalPoint}
        </div>
      </div>
    </div>
  )
}
