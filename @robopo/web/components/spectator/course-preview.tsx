"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Panel } from "@/components/course/panel"
import { deserializeField, getFieldBounds } from "@/lib/course/field"
import {
  deserializeMission,
  getRobotPosition,
  missionStatePair,
} from "@/lib/course/mission"
import type { FieldState, MissionValue } from "@/lib/course/types"

const STEP_MS = 700
const HOLD_MS = 1100

function dirToDeg(dir: MissionValue): number {
  switch (dir) {
    case "u":
      return 0
    case "r":
      return 90
    case "d":
      return 180
    case "l":
      return -90
    default:
      return 0
  }
}

export function CoursePreview({
  fieldRaw,
  missionRaw,
  reachedIndex,
  height = 320,
  accent = "#00e0ff",
  trackColor = "#0f1a2e",
  successColor = "#39ff88",
  failColor = "#ff5577",
  showOverlayLabel = true,
}: {
  fieldRaw: string | null
  missionRaw: string | null
  reachedIndex: number
  height?: number
  accent?: string
  trackColor?: string
  successColor?: string
  failColor?: string
  showOverlayLabel?: boolean
}) {
  const field: FieldState | null = useMemo(() => {
    if (!fieldRaw) {
      return null
    }
    try {
      return deserializeField(fieldRaw)
    } catch {
      return null
    }
  }, [fieldRaw])

  const missionState = useMemo(() => {
    if (!missionRaw) {
      return []
    }
    try {
      return deserializeMission(missionRaw)
    } catch {
      return []
    }
  }, [missionRaw])

  const pairs = useMemo(() => missionStatePair(missionState), [missionState])
  const totalSteps = pairs.length
  const targetStep = Math.max(0, Math.min(reachedIndex, totalSteps))
  const isComplete = totalSteps > 0 && targetStep === totalSteps

  // Walk from 0 to targetStep, hold, then loop.
  const [step, setStep] = useState(0)
  useEffect(() => {
    // Touch totalSteps so the effect re-runs when the underlying course
    // changes (different mission length) even if targetStep is the same number.
    void totalSteps
    setStep(0)
    if (targetStep === 0) {
      return
    }
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout> | null = null
    const advance = (next: number) => {
      if (cancelled) {
        return
      }
      setStep(next)
      if (next < targetStep) {
        timeout = setTimeout(() => advance(next + 1), STEP_MS)
      } else {
        // Hold then loop.
        timeout = setTimeout(() => {
          if (cancelled) {
            return
          }
          setStep(0)
          timeout = setTimeout(() => advance(1), STEP_MS)
        }, HOLD_MS)
      }
    }
    timeout = setTimeout(() => advance(1), STEP_MS)
    return () => {
      cancelled = true
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [targetStep, totalSteps])

  if (!field) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          background: trackColor,
        }}
      >
        コース未設定
      </div>
    )
  }

  const bounds = getFieldBounds(field)
  const renderMinR = bounds.minR
  const renderMinC = bounds.minC
  const renderWidth = bounds.maxC - bounds.minC + 1
  const renderHeight = bounds.maxR - bounds.minR + 1

  // Position from start to step.
  let robotPos: [number, number, MissionValue] | null = null
  let trail: { row: number; col: number }[] = []
  const startInfo = (() => {
    for (let r = 0; r < field.length; r++) {
      for (let c = 0; c < (field[r]?.length ?? 0); c++) {
        if (field[r][c] === "start" || field[r][c] === "startGoal") {
          return { row: r, col: c }
        }
      }
    }
    return null
  })()
  if (startInfo && missionState.length > 0) {
    // Clamp step to current course's mission length. Without this, switching
    // between players whose best courses have different mission lengths can
    // briefly call getRobotPosition with a step that overruns the new
    // missionPair (state survives across re-renders before useEffect resets).
    const safeStep = Math.max(0, Math.min(step, totalSteps))
    robotPos = getRobotPosition(
      startInfo.row,
      startInfo.col,
      missionState,
      safeStep,
    )
    // Build trail by replaying steps 0..safeStep
    trail = []
    for (let i = 0; i <= safeStep; i++) {
      const [r, c] = getRobotPosition(
        startInfo.row,
        startInfo.col,
        missionState,
        i,
      )
      trail.push({ row: r, col: c })
    }
  }

  const cellSize = Math.floor(
    Math.min(height / renderHeight, (height * 1.6) / renderWidth),
  )

  const cells: { r: number; c: number; panel: FieldState[0][0] }[] = []
  for (let r = bounds.minR; r <= bounds.maxR; r++) {
    for (let c = bounds.minC; c <= bounds.maxC; c++) {
      cells.push({ r, c, panel: field[r]?.[c] ?? null })
    }
  }

  const reachedColor = isComplete ? successColor : failColor

  return (
    <div
      style={{
        position: "relative",
        height,
        background: trackColor,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${accent}22, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: `repeat(${renderWidth}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${renderHeight}, ${cellSize}px)`,
          ["--cell-size" as string]: `${cellSize}px`,
        }}
      >
        {cells.map((cell) => {
          const inTrail = trail.some(
            (t) => t.row === cell.r && t.col === cell.c,
          )
          return (
            <div
              key={`${cell.r}-${cell.c}`}
              style={{
                position: "relative",
                boxShadow: inTrail
                  ? `inset 0 0 0 3px ${reachedColor}`
                  : undefined,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Panel value={cell.panel} onClick={() => {}} />
              </div>
            </div>
          )
        })}
        {/* Trail markers between cells (dots) */}
        {trail.map((t, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: trail step order is the identity (a cell may be revisited)
            key={`trail-${i}-${t.row}-${t.col}`}
            style={{
              position: "absolute",
              top: (t.row - renderMinR) * cellSize + cellSize / 2 - 5,
              left: (t.col - renderMinC) * cellSize + cellSize / 2 - 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: reachedColor,
              boxShadow: `0 0 12px ${reachedColor}`,
              opacity: 0.85,
              pointerEvents: "none",
              transition: "background 0.3s",
            }}
          />
        ))}
        {/* Robot */}
        {robotPos && (
          <div
            style={{
              position: "absolute",
              top: (robotPos[0] - renderMinR) * cellSize,
              left: (robotPos[1] - renderMinC) * cellSize,
              width: cellSize,
              height: cellSize,
              transition:
                "top 0.45s ease, left 0.45s ease, transform 0.45s ease",
              transform: `rotate(${dirToDeg(robotPos[2])}deg)`,
              pointerEvents: "none",
              filter: `drop-shadow(0 0 8px ${reachedColor})`,
            }}
          >
            <Image
              src="/robot.png"
              alt="bot"
              fill
              sizes={`${cellSize}px`}
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
      </div>
      {/* Overlay label */}
      {showOverlayLabel && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            padding: "4px 10px",
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            borderRadius: 4,
            border: `1px solid ${accent}88`,
          }}
        >
          {targetStep} / {totalSteps} ステップ {isComplete ? "✓ クリア" : ""}
        </div>
      )}
    </div>
  )
}
