"use client"

import { Crown, Medal, RefreshCw, Trophy } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SelectCompetition } from "@/lib/db/schema"

type SpectatorPlayer = {
  playerId: number
  playerName: string
  bibNumber: string | null
  totalPoint: number
  rank: number
}

const REFRESH_INTERVAL = 15

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return {
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-md shadow-amber-200/40",
        accent: "text-amber-600",
        bar: "bg-gradient-to-r from-amber-400 to-yellow-400",
        badge: "bg-amber-500 text-white",
        icon: <Crown className="size-6 text-amber-500" />,
        padding: "p-5",
      }
    case 2:
      return {
        bg: "bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-300 shadow-sm",
        accent: "text-slate-600",
        bar: "bg-gradient-to-r from-slate-400 to-gray-400",
        badge: "bg-slate-500 text-white",
        icon: <Medal className="size-5 text-slate-400" />,
        padding: "p-5",
      }
    case 3:
      return {
        bg: "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-300",
        accent: "text-orange-700",
        bar: "bg-gradient-to-r from-orange-400 to-amber-500",
        badge: "bg-orange-600 text-white",
        icon: <Medal className="size-5 text-orange-400" />,
        padding: "p-4",
      }
    default:
      return {
        bg: "bg-base-100 border border-base-300",
        accent: "text-base-content/70",
        bar: "bg-primary/60",
        badge: "bg-base-300 text-base-content/70",
        icon: null,
        padding: "p-4",
      }
  }
}

export function Leaderboard({
  competitions,
  defaultCompetitionId,
}: {
  competitions: SelectCompetition[]
  defaultCompetitionId: number | null
}) {
  const [competitionId, setCompetitionId] = useState<number>(
    defaultCompetitionId ?? 0,
  )
  const [players, setPlayers] = useState<SpectatorPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    if (competitionId === 0) {
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/spectator/${competitionId}`)
      if (res.ok) {
        const data = await res.json()
        setPlayers(data)
      }
    } catch {
      // Silently retry on next interval
    } finally {
      setLoading(false)
      setCountdown(REFRESH_INTERVAL)
    }
  }, [competitionId])

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchData()

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData()
          return REFRESH_INTERVAL
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [fetchData])

  const maxPoint = players.length > 0 ? players[0].totalPoint : 1

  if (competitions.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Trophy className="size-16 text-base-content/20" />
        <h2 className="font-bold text-base-content/40 text-xl">
          現在開催中の大会はありません
        </h2>
        <p className="text-base-content/30 text-sm">
          大会が開催されると、ここにリアルタイムランキングが表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-2xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
          <Trophy className="size-4 text-primary" />
          <span className="font-bold text-primary text-sm">LIVE</span>
        </div>
        <h1 className="font-black text-2xl tracking-tight sm:text-3xl">
          リアルタイムランキング
        </h1>
      </div>

      {/* Competition selector */}
      {competitions.length > 1 && (
        <div className="mb-6">
          <select
            className="select select-bordered w-full rounded-xl"
            value={competitionId}
            onChange={(e) => setCompetitionId(Number(e.target.value))}
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Competition name (single) */}
      {competitions.length === 1 && (
        <p className="mb-6 text-center text-base-content/50 text-sm">
          {competitions[0].name}
        </p>
      )}

      {/* Refresh indicator */}
      <div className="mb-4 flex items-center justify-between text-base-content/40 text-xs">
        <div className="flex items-center gap-1.5">
          <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
          <span>{countdown}秒後に更新</span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-xs gap-1"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className="size-3" />
          今すぐ更新
        </button>
      </div>

      {/* Refresh progress bar */}
      <div className="mb-6 h-0.5 w-full overflow-hidden rounded-full bg-base-300">
        <div
          className="h-full bg-primary/40 transition-all duration-1000 ease-linear"
          style={{
            width: `${((REFRESH_INTERVAL - countdown) / REFRESH_INTERVAL) * 100}%`,
          }}
        />
      </div>

      {/* Leaderboard (scrollable) */}
      {players.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
          <div className="relative">
            <Trophy className="size-12 text-base-content/15" />
            <div className="absolute -top-1 -right-1 size-4 animate-pulse rounded-full bg-primary/30" />
          </div>
          <p className="font-medium text-base-content/40">
            まだ記録がありません
          </p>
          <p className="text-base-content/25 text-sm">
            選手がチャレンジを開始すると、ランキングに表示されます
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 pb-4">
            {players.map((player) => {
              const style = getRankStyle(player.rank)
              const barWidth =
                maxPoint > 0 ? (player.totalPoint / maxPoint) * 100 : 0

              return (
                <div
                  key={player.playerId}
                  className={`rounded-2xl transition-all duration-500 ${style.bg} ${style.padding}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-black text-lg ${style.badge}`}
                    >
                      {player.rank}
                    </div>

                    {/* Player info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {style.icon}
                        <span className="truncate font-bold text-base">
                          {player.playerName}
                        </span>
                        {player.bibNumber && (
                          <span className="shrink-0 rounded bg-base-200/80 px-1.5 py-0.5 font-mono text-[10px] text-base-content/50">
                            {player.bibNumber}
                          </span>
                        )}
                      </div>

                      {/* Score bar */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-base-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${style.bar}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span
                          className={`shrink-0 font-black text-lg tabular-nums ${style.accent}`}
                        >
                          {player.totalPoint}
                          <span className="ml-0.5 font-normal text-xs">pt</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
