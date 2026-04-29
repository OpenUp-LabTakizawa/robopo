"use client"

import { useEffect, useRef, useState } from "react"
import type {
  SpectatorEvent,
  SpectatorLastRun,
  SpectatorSnapshot,
} from "@/lib/spectator/types"

export type LiveFxEvent =
  | {
      kind: "score"
      lastRun: SpectatorLastRun
    }
  | {
      kind: "personal-best"
      lastRun: SpectatorLastRun
    }
  | {
      kind: "course-best"
      lastRun: SpectatorLastRun
    }
  | {
      kind: "takeover"
      newLeaderName: string
      previousLeaderName: string | null
    }

export type LiveFeedState = {
  snapshot: SpectatorSnapshot | null
  connected: boolean
  // Latest fx event (consumer should react then clear).
  fxEvent: LiveFxEvent | null
  clearFxEvent: () => void
}

export function useLiveFeed(
  competitionId: number | null,
  initialSnapshot: SpectatorSnapshot | null = null,
): LiveFeedState {
  const [snapshot, setSnapshot] = useState<SpectatorSnapshot | null>(
    initialSnapshot,
  )
  const [connected, setConnected] = useState(false)
  const [fxEvent, setFxEvent] = useState<LiveFxEvent | null>(null)
  // Seed previousRef with the initial snapshot so the very first SSE delivery
  // is treated as a delta against what the page already rendered (no false
  // "new run" fx for stale data we already had).
  const previousRef = useRef<SpectatorSnapshot | null>(initialSnapshot)

  useEffect(() => {
    if (competitionId === null) {
      return
    }
    let es: EventSource | null = null
    let cancelled = false

    const connect = () => {
      es = new EventSource(`/api/spectator/${competitionId}/stream`)
      es.onopen = () => {
        if (!cancelled) {
          setConnected(true)
        }
      }
      es.onerror = () => {
        if (!cancelled) {
          setConnected(false)
        }
      }
      es.onmessage = (ev) => {
        let data: SpectatorEvent
        try {
          data = JSON.parse(ev.data)
        } catch {
          return
        }
        if (data.kind === "snapshot") {
          handleSnapshot(data.snapshot)
        }
      }
    }

    const handleSnapshot = (next: SpectatorSnapshot) => {
      const prev = previousRef.current
      previousRef.current = next
      setSnapshot(next)

      if (!prev) {
        return
      }

      // Detect new lastRun.
      if (
        next.lastRun &&
        (!prev.lastRun || prev.lastRun.challengeId !== next.lastRun.challengeId)
      ) {
        if (next.lastRun.isCourseBest) {
          setFxEvent({ kind: "course-best", lastRun: next.lastRun })
        } else if (next.lastRun.isPersonalBest) {
          setFxEvent({ kind: "personal-best", lastRun: next.lastRun })
        } else {
          setFxEvent({ kind: "score", lastRun: next.lastRun })
        }
      }

      // Detect leader takeover.
      const prevLeader = prev.board[0]
      const nextLeader = next.board[0]
      if (
        nextLeader &&
        (!prevLeader || prevLeader.player.id !== nextLeader.player.id)
      ) {
        if (prevLeader || nextLeader.total > 0) {
          // Stash takeover after slight delay so it can chain after score fx.
          setTimeout(() => {
            setFxEvent({
              kind: "takeover",
              newLeaderName: nextLeader.player.name,
              previousLeaderName: prevLeader?.player.name ?? null,
            })
          }, 800)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      if (es) {
        es.close()
      }
      setConnected(false)
    }
  }, [competitionId])

  return {
    snapshot,
    connected,
    fxEvent,
    clearFxEvent: () => setFxEvent(null),
  }
}
