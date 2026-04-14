"use client"

import { Play, Search, Trophy, UserCheck, Waypoints } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useCallback, useEffect, useState } from "react"

import { PlayerSelector } from "@/app/components/home/player-selector"
import { useSelectionStorage } from "@/app/hooks/useSelectionStorage"
import { isCompetitionActive } from "@/app/lib/competition"
import { COMPETITION_MANAGEMENT_LIST } from "@/app/lib/const"
import type {
  SelectCompetition,
  SelectCompetitionCourse,
  SelectCompetitionJudge,
  SelectCourse,
  SelectJudgeWithUsername,
  SelectPlayer,
} from "@/app/lib/db/schema"

function SelectionCard({
  name,
  icon,
  isSelected,
  onClick,
}: {
  name: string
  icon: React.ReactNode
  isSelected: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-2.5 transition-all active:scale-[0.98] ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-base-300 bg-base-100 shadow-sm hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          isSelected
            ? "bg-primary text-primary-content"
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content"
        }`}
      >
        {icon}
      </div>
      <span className="text-left font-medium text-sm">{name}</span>
    </button>
  )
}

type ChallengeTabProps = {
  competitionList: { competitions: SelectCompetition[] }
  courseList: { courses: SelectCourse[] }
  competitionCourseList: { competitionCourseList: SelectCompetitionCourse[] }
  judgeList: SelectJudgeWithUsername[]
  competitionJudgeList: { competitionJudgeList: SelectCompetitionJudge[] }
  loggedInJudgeId?: number
}

export function ChallengeTab({
  competitionList,
  courseList,
  competitionCourseList,
  judgeList,
  competitionJudgeList,
  loggedInJudgeId,
}: ChallengeTabProps): React.JSX.Element {
  const router = useRouter()
  const activeCompetitions =
    competitionList.competitions.filter(isCompetitionActive)
  const singleCompetition =
    activeCompetitions.length === 1 ? activeCompetitions[0] : null

  const { stored, isLoaded, save } = useSelectionStorage()

  const [competitionId, setCompetitionId] = useState(singleCompetition?.id ?? 0)
  const [judgeId, setJudgeId] = useState(loggedInJudgeId ?? 0)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [judgeSearchQuery, setJudgeSearchQuery] = useState("")

  // Apply localStorage values after hydration (split by responsibility)
  useEffect(() => {
    if (!isLoaded || singleCompetition || !stored.competitionId) {
      return
    }
    if (activeCompetitions.some((c) => c.id === stored.competitionId)) {
      setCompetitionId(stored.competitionId)
    }
  }, [isLoaded, singleCompetition, stored.competitionId, activeCompetitions])

  useEffect(() => {
    if (!isLoaded || loggedInJudgeId || !stored.judgeId) {
      return
    }
    setJudgeId(stored.judgeId)
  }, [isLoaded, loggedInJudgeId, stored.judgeId])

  useEffect(() => {
    if (!isLoaded || !stored.courseId) {
      return
    }
    setSelectedCourseId(stored.courseId)
  }, [isLoaded, stored.courseId])

  const competitionJudges = (() => {
    if (competitionId === 0) {
      return judgeList
    }
    const assignedIds = competitionJudgeList.competitionJudgeList
      .filter((cu) => cu.competitionId === competitionId)
      .map((cu) => cu.judgeId)
    return judgeList.filter((u) => assignedIds.includes(u.id))
  })()

  const filteredJudges = (() => {
    if (!judgeSearchQuery) {
      return competitionJudges
    }
    const q = judgeSearchQuery.toLowerCase()
    return competitionJudges.filter((u) => u.username.toLowerCase().includes(q))
  })()

  // Validate judgeId against current competition's judges
  useEffect(() => {
    if (!isLoaded || judgeId === 0) {
      return
    }
    if (loggedInJudgeId && judgeId === loggedInJudgeId) {
      return
    }
    if (competitionId === 0) {
      return
    }
    const assignedIds = competitionJudgeList.competitionJudgeList
      .filter((cu) => cu.competitionId === competitionId)
      .map((cu) => cu.judgeId)
    const isValid = judgeList.some(
      (u) => assignedIds.includes(u.id) && u.id === judgeId,
    )
    if (!isValid) {
      setJudgeId(loggedInJudgeId ?? 0)
    }
  }, [
    competitionId,
    isLoaded,
    loggedInJudgeId,
    judgeId,
    judgeList,
    competitionJudgeList,
  ])

  const filteredCourses = (() => {
    if (competitionId === 0) {
      return []
    }
    const assigned = competitionCourseList.competitionCourseList
      .filter((cc) => cc.competitionId === competitionId)
      .map((cc) => cc.courseId)
    return courseList.courses.filter(
      (c) => assigned.includes(c.id) && c.isConfigured,
    )
  })()

  const handleCourseSelect = useCallback(
    (courseId: number) => {
      setSelectedCourseId((prev) => {
        const next = prev === courseId ? null : courseId
        save({ courseId: next ?? undefined })
        return next
      })
    },
    [save],
  )

  const handlePlayerSelect = (player: SelectPlayer) => {
    setSelectedPlayerId((prev) => (prev === player.id ? null : player.id))
  }

  const handleCompetitionChange = useCallback(
    (newId: number) => {
      setCompetitionId(newId)
      setJudgeId(loggedInJudgeId ?? 0)
      setSelectedCourseId(null)
      setSelectedPlayerId(null)
      setJudgeSearchQuery("")
      save({ competitionId: newId, courseId: undefined })
    },
    [loggedInJudgeId, save],
  )

  const handleJudgeChange = useCallback(
    (newId: number) => {
      setJudgeId(newId)
      save({ judgeId: newId })
    },
    [save],
  )

  const handleStartScoring = useCallback(() => {
    if (!selectedCourseId || !selectedPlayerId || !judgeId) {
      return
    }
    save({
      competitionId,
      judgeId,
      courseId: selectedCourseId,
    })
    router.push(
      `/challenge/${competitionId}/${selectedCourseId}/${selectedPlayerId}?judgeId=${judgeId}` as Route,
    )
  }, [competitionId, selectedCourseId, selectedPlayerId, judgeId, save, router])

  const canStartScoring =
    competitionId !== 0 &&
    judgeId !== 0 &&
    selectedCourseId !== null &&
    selectedPlayerId !== null

  const competitionDisabled = competitionId === 0
  const courseDisabled = competitionDisabled

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 1. Competition selection */}
      <div>
        <p className="mb-2 text-base-content/60 text-sm">大会を選択</p>
        {singleCompetition ? (
          <SelectionCard
            name={singleCompetition.name}
            icon={<Trophy className="h-4 w-4" />}
            isSelected
          />
        ) : activeCompetitions.length > 0 ? (
          <div className="grid gap-2">
            {activeCompetitions.map((c) => (
              <SelectionCard
                key={c.id}
                name={c.name}
                icon={<Trophy className="h-4 w-4" />}
                isSelected={competitionId === c.id}
                onClick={() => handleCompetitionChange(c.id)}
              />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-base-content/40 text-sm">
            開催中の大会がありません
          </p>
        )}
      </div>

      {/* 2. Course selection */}
      <div className={courseDisabled ? "opacity-50" : ""}>
        <p className="mb-2 text-base-content/60 text-sm">コースを選択</p>
        {filteredCourses.length > 0 ? (
          <div className="grid gap-2">
            {filteredCourses.map((c) => (
              <SelectionCard
                key={c.id}
                name={c.name}
                icon={<Waypoints className="h-4 w-4" />}
                isSelected={selectedCourseId === c.id}
                onClick={
                  courseDisabled ? undefined : () => handleCourseSelect(c.id)
                }
              />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-base-content/40 text-sm">
            {competitionDisabled
              ? "大会を選択してください"
              : "コースが割り当てられていません"}
          </p>
        )}
      </div>

      {/* 3. Judge selection */}
      <div className={competitionDisabled ? "opacity-50" : ""}>
        <p className="mb-2 text-base-content/60 text-sm">採点者を選択</p>
        {competitionJudges.length > 0 ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="採点者を検索..."
                className="input input-bordered input-sm w-full pl-9 text-sm"
                value={judgeSearchQuery}
                onChange={(e) => setJudgeSearchQuery(e.target.value)}
                disabled={competitionDisabled}
              />
            </div>
            {filteredJudges.length > 0 ? (
              <div className="grid gap-2">
                {filteredJudges.map((u) => (
                  <SelectionCard
                    key={u.id}
                    name={u.username}
                    icon={<UserCheck className="h-4 w-4" />}
                    isSelected={judgeId === u.id}
                    onClick={
                      competitionDisabled
                        ? undefined
                        : () => handleJudgeChange(u.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-base-content/40 text-sm">
                該当する採点者がいません
              </p>
            )}
          </div>
        ) : (
          <p className="py-4 text-center text-base-content/40 text-sm">
            {competitionDisabled
              ? "大会を選択してください"
              : "採点者が割り当てられていません"}
          </p>
        )}
      </div>

      {/* 4. Player selection */}
      <div className={competitionDisabled ? "opacity-50" : ""}>
        <p className="mb-2 text-base-content/60 text-sm">選手を選択</p>
        {competitionId !== 0 ? (
          <PlayerSelector
            competitionId={competitionId}
            selectedPlayerId={selectedPlayerId}
            onSelect={handlePlayerSelect}
          />
        ) : (
          <p className="py-4 text-center text-base-content/40 text-sm">
            大会を選択してください
          </p>
        )}
      </div>

      {/* Start scoring button - spans both columns */}
      <button
        type="button"
        onClick={handleStartScoring}
        disabled={!canStartScoring}
        className={`btn col-span-2 w-full gap-2 rounded-xl border-0 font-bold text-base tracking-wide transition-all duration-300 ${
          canStartScoring
            ? "btn-primary scoring-btn-ready hover:brightness-110 active:scale-[0.97]"
            : "cursor-not-allowed bg-base-300 text-base-content/30"
        }`}
      >
        <Play className="h-5 w-5" />
        採点を開始
      </button>
    </div>
  )
}

export const ManageTab = (): React.JSX.Element => {
  return (
    <div className="grid gap-2">
      {COMPETITION_MANAGEMENT_LIST.map((btn) => (
        <Link
          key={btn.href}
          href={btn.href}
          className="btn btn-ghost justify-start gap-3 border border-base-300"
        >
          {btn.icon}
          {btn.label}
        </Link>
      ))}
    </div>
  )
}
