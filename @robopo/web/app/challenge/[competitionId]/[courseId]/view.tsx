"use client"

import {
  ArrowUturnLeftIcon,
  MagnifyingGlassIcon,
  PlayIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"
import { HomeButton, ReloadButton } from "@/app/components/parts/buttons"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export function View({
  courseData,
  initialPlayerDataList,
  competitionId,
  courseId,
  umpireId,
}: {
  courseData: SelectCourse
  initialPlayerDataList: { players: SelectPlayer[] }
  competitionId: number
  courseId: number
  umpireId: number
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const playerDataList = initialPlayerDataList.players

  const filteredPlayers = useMemo(() => {
    if (!searchQuery) {
      return playerDataList
    }
    const q = searchQuery.toLowerCase()
    return playerDataList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.furigana?.toLowerCase().includes(q) ||
        p.zekken?.toLowerCase().includes(q),
    )
  }, [playerDataList, searchQuery])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-base-content/60 text-sm">選択中コース</p>
          <h2 className="font-bold text-primary text-xl">{courseData.name}</h2>
        </div>
        <Link href="/" className="btn btn-ghost btn-sm gap-1">
          <ArrowUturnLeftIcon className="h-4 w-4" />
          戻る
        </Link>
      </div>

      {/* Search */}
      {playerDataList.length > 5 && (
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="選手を検索..."
            className="input input-bordered w-full pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Player instruction */}
      <p className="mb-3 text-base-content/60 text-sm">
        選手をタップして採点を開始
      </p>

      {/* Player cards */}
      <div className="grid gap-2">
        {filteredPlayers.map((player) => (
          <Link
            key={player.id}
            href={`/challenge/${competitionId}/${courseId}/${player.id}?umpireId=${umpireId}`}
            className="group flex items-center gap-4 rounded-xl border border-base-300 bg-base-100 px-4 py-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
          >
            {/* Zekken badge */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
              {player.zekken || "-"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-base">{player.name}</p>
              {player.furigana && (
                <p className="truncate text-base-content/50 text-xs">
                  {player.furigana}
                </p>
              )}
            </div>
            <PlayIcon className="h-5 w-5 shrink-0 text-base-content/30 transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <p className="py-8 text-center text-base-content/40 text-sm">
          {searchQuery ? "該当する選手がいません" : "選手が登録されていません"}
        </p>
      )}

      <div className="mt-6 flex justify-center gap-3">
        <ReloadButton />
        <HomeButton />
      </div>
    </div>
  )
}
