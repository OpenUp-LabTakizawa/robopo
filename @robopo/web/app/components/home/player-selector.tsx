"use client"

import { Check, Search } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"

import { getCompetitionPlayerList } from "@/app/components/server/db"
import type { SelectPlayer } from "@/app/lib/db/schema"

type PlayerSelectorProps = {
  competitionId: number
  selectedPlayerId: number | null
  onSelect: (player: SelectPlayer) => void
}

export function PlayerSelector({
  competitionId,
  selectedPlayerId,
  onSelect,
}: PlayerSelectorProps) {
  const [players, setPlayers] = useState<SelectPlayer[]>([])
  const [, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [loaded, setLoaded] = useState(false)

  const fetchIdRef = useRef(0)

  useEffect(() => {
    const fetchId = ++fetchIdRef.current
    setLoaded(false)
    setPlayers([])
    setSearchQuery("")
    startTransition(async () => {
      try {
        const result = await getCompetitionPlayerList(competitionId)
        if (fetchIdRef.current !== fetchId) {
          return
        }
        setPlayers(result.players)
      } catch {
        if (fetchIdRef.current !== fetchId) {
          return
        }
        setPlayers([])
      } finally {
        if (fetchIdRef.current === fetchId) {
          setLoaded(true)
        }
      }
    })
  }, [competitionId])

  const filteredPlayers = (() => {
    if (!searchQuery) {
      return players
    }
    const q = searchQuery.toLowerCase()
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.furigana?.toLowerCase().includes(q) ||
        p.bibNumber?.toLowerCase().includes(q),
    )
  })()

  return (
    <div className="space-y-3">
      {/* Search bar */}
      {loaded && players.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="選手を検索..."
            className="input input-bordered input-sm w-full pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Loading state */}
      {!loaded && (
        <div className="flex items-center justify-center gap-2 py-6">
          <span className="loading loading-spinner loading-sm text-primary" />
          <p className="text-base-content/40 text-sm">選手を読み込み中...</p>
        </div>
      )}

      {/* Player list */}
      {loaded && (
        <div className="grid max-h-[360px] gap-1.5 overflow-y-auto pr-1">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayerId === player.id
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onSelect(player)}
                className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-base-300 bg-base-100 hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-content"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {player.bibNumber || "-"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">
                    {player.name}
                  </p>
                  {player.furigana && (
                    <p className="truncate text-base-content/50 text-xs">
                      {player.furigana}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {loaded && filteredPlayers.length === 0 && (
        <p className="py-4 text-center text-base-content/40 text-sm">
          {searchQuery ? "該当する選手がいません" : "選手が登録されていません"}
        </p>
      )}
    </div>
  )
}
