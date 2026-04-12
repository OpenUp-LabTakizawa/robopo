"use client"

import {
  ClipboardDocumentCheckIcon,
  MapIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import type { SelectCompetition } from "@/app/lib/db/schema"
import { CourseSummaryTable } from "@/app/summary/courseSummaryTable"
import { JudgeSummaryTable } from "@/app/summary/judgeSummaryTable"
import { PlayerSummaryTable } from "@/app/summary/playerSummaryTable"

type TabKey = "player" | "judge" | "course"

const TABS: { key: TabKey; label: string; icon: typeof UserGroupIcon }[] = [
  { key: "player", label: "選手", icon: UserGroupIcon },
  { key: "judge", label: "採点者", icon: ClipboardDocumentCheckIcon },
  { key: "course", label: "コース", icon: MapIcon },
]

type Props = {
  competitions: SelectCompetition[]
  defaultCompetitionId: number | null
}

export function SummaryView({ competitions, defaultCompetitionId }: Props) {
  const [competitionId, setCompetitionId] = useState<number>(
    defaultCompetitionId ?? 0,
  )
  const [activeTab, setActiveTab] = useState<TabKey>("player")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Competition selector */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="min-w-[200px] max-w-md">
          <label
            htmlFor="summary-competition"
            className="mb-1 block font-semibold text-base-content/60 text-xs uppercase tracking-wider"
          >
            大会
          </label>
          <select
            id="summary-competition"
            className="select select-bordered w-full"
            value={competitionId}
            onChange={(e) => setCompetitionId(Number(e.target.value))}
          >
            <option value={0} disabled>
              大会を選んでください
            </option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 px-4 pt-2 pb-3">
        <div className="inline-flex rounded-xl bg-base-200/60 p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200 ${
                activeTab === key
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {competitionId === 0 ? (
        <div className="py-12 text-center text-base-content/40">
          大会を選択してください
        </div>
      ) : (
        <>
          {activeTab === "player" && (
            <PlayerSummaryTable competitionId={competitionId} />
          )}
          {activeTab === "judge" && (
            <JudgeSummaryTable competitionId={competitionId} />
          )}
          {activeTab === "course" && (
            <CourseSummaryTable competitionId={competitionId} />
          )}
        </>
      )}
    </div>
  )
}
