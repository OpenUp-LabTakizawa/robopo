"use client"

import { ChevronRight, CircleCheck, ListOrdered, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { getMissionParameterUnit } from "@/lib/course/mission"
import {
  MissionString,
  type MissionValue,
  type PointEntry,
  type PointState,
} from "@/lib/course/types"
import type { MissionProgress } from "@/lib/scoring/scoring"

// Mission status
type MissionStatus = "completed" | "current" | "upcoming"

function getMissionStatus(
  index: number,
  nowMission: number,
  isGoal: boolean,
): MissionStatus {
  if (isGoal || index < nowMission) {
    return "completed"
  }
  if (index === nowMission) {
    return "current"
  }
  return "upcoming"
}

// Individual mission item component
function MissionOverviewItem({
  index,
  pair,
  pointEntry,
  status,
  isTier,
  currentRef,
}: {
  index: number
  pair: MissionValue[]
  pointEntry: PointEntry
  status: MissionStatus
  isTier: boolean
  currentRef?: (el: HTMLDivElement | null) => void
}) {
  const isCurrent = status === "current"
  const isCompleted = status === "completed"

  const containerClass = `mx-1 my-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
    isCurrent
      ? "bg-primary/10 ring-1 ring-primary/30"
      : isCompleted
        ? "bg-success/5"
        : "bg-base-200/50"
  }`

  const titleClass = `font-semibold text-sm leading-tight ${
    isCurrent
      ? "text-primary"
      : isCompleted
        ? "text-base-content/60"
        : "text-base-content/40"
  }`

  const pointsClass = `text-xs ${
    isCurrent
      ? "text-accent"
      : isCompleted
        ? "text-success/60"
        : "text-base-content/30"
  }`

  return (
    <div ref={isCurrent ? currentRef : undefined} className={containerClass}>
      {/* Status icon / Number */}
      {isCompleted ? (
        <CircleCheck className="size-6 shrink-0 text-success" />
      ) : (
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
            isCurrent
              ? "bg-primary font-bold text-primary-content"
              : "bg-base-300 font-medium text-base-content/40"
          }`}
        >
          {index + 1}
        </div>
      )}

      {/* Mission info */}
      <div className="min-w-0 flex-1">
        <p className={titleClass}>
          {pair[0] === null ? "-" : MissionString[pair[0]]}
          {pair[1] === null ? "" : ` ${pair[1]}`}
          {pair[0] === null ? "" : getMissionParameterUnit(pair[0])}
        </p>
        <p className={pointsClass}>
          {isTier ? "段階評価" : pointEntry !== null ? `${pointEntry}pt` : "-"}
        </p>
      </div>

      {/* Current indicator */}
      {isCurrent && (
        <ChevronRight className="size-4 shrink-0 animate-pulse text-primary" />
      )}
    </div>
  )
}

// Main component
type MissionOverviewProps = {
  missionPair: MissionValue[][]
  pointState: PointState
  nowMission: number
  isGoal: boolean
  progress: MissionProgress
}

export function MissionOverview({
  missionPair,
  pointState,
  nowMission,
  isGoal,
  progress,
}: MissionOverviewProps) {
  const [open, setOpen] = useState(false)
  const currentMissionRef = useRef<HTMLDivElement | null>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) {
      return
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  // Scroll current mission into view
  useEffect(() => {
    if (!open || !currentMissionRef.current) {
      return
    }
    currentMissionRef.current.scrollIntoView({
      block: "center",
      behavior: "smooth",
    })
  }, [open])

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        className="btn btn-ghost btn-sm gap-1"
        onClick={() => setOpen(true)}
        aria-label="ミッション一覧を開く"
      >
        <ListOrdered className="size-5" />
        <span className="font-medium text-xs">
          {progress.completed}/{progress.total}
        </span>
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss pattern */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />

          {/* Drawer panel */}
          <div className="drawer-slide-in relative flex w-80 max-w-[85vw] flex-col bg-base-100 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-base-300 border-b px-4 py-3">
              <div>
                <h3 className="font-bold text-base">ミッション一覧</h3>
                <p className="text-base-content/50 text-xs">
                  {progress.completed} / {progress.total} 完了
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-4 py-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-300">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            {/* Mission list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {missionPair.map((pair, i) => {
                const status = getMissionStatus(i, nowMission, isGoal)
                const pointEntry = pointState[i + 2]
                const isTier = Array.isArray(pointEntry)

                return (
                  <MissionOverviewItem
                    // biome-ignore lint/suspicious/noArrayIndexKey: mission pairs can have duplicate values
                    key={`mission-${i}-${String(pair[0])}`}
                    index={i}
                    pair={pair}
                    pointEntry={pointEntry}
                    status={status}
                    isTier={isTier}
                    currentRef={(el) => {
                      if (status === "current") {
                        currentMissionRef.current = el
                      }
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
