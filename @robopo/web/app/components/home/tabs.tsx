"use client"

import {
  ExclamationTriangleIcon,
  PlayIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import type { Route } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

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

function CourseCard({
  name,
  disabled,
  isSelected,
  onDisabledClick,
  onClick,
}: {
  name: string
  disabled: boolean
  isSelected: boolean
  onDisabledClick?: () => void
  onClick?: () => void
}) {
  if (disabled) {
    return (
      <button
        type="button"
        onClick={onDisabledClick}
        className="group flex min-h-[56px] w-full cursor-pointer items-center gap-3 rounded-xl border border-base-300 bg-base-200 px-4 py-2.5 opacity-50 transition-all"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-300 text-base-content/30 transition-colors">
          <PlayIcon className="h-4 w-4" />
        </div>
        <span className="text-left font-medium text-sm">{name}</span>
      </button>
    )
  }
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
        <PlayIcon className="h-4 w-4" />
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
  const [showAlert, setShowAlert] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const judgeSelectRef = useRef<HTMLSelectElement>(null)
  const disableCondition = competitionId === 0 || judgeId === 0

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

  const filteredJudges = (() => {
    if (competitionId === 0) {
      return judgeList
    }
    const assignedIds = competitionJudgeList.competitionJudgeList
      .filter((cu) => cu.competitionId === competitionId)
      .map((cu) => cu.judgeId)
    return judgeList.filter((u) => assignedIds.includes(u.id))
  })()

  // Validate judgeId against current competition's judges
  useEffect(() => {
    if (!isLoaded || judgeId === 0) {
      return
    }
    if (loggedInJudgeId && judgeId === loggedInJudgeId) {
      return
    }
    if (competitionId !== 0 && !filteredJudges.some((j) => j.id === judgeId)) {
      setJudgeId(loggedInJudgeId ?? 0)
    }
  }, [competitionId, isLoaded, loggedInJudgeId, judgeId, filteredJudges])

  const handleDisabledClick = () => {
    if (judgeId === 0) {
      setShowAlert(true)
      judgeSelectRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showAlert])

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
      save({ competitionId: newId, courseId: undefined })
    },
    [loggedInJudgeId, save],
  )

  const handleJudgeChange = (newId: number) => {
    setJudgeId(newId)
    setShowAlert(false)
    save({ judgeId: newId })
  }

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

  return (
    <div className="space-y-4">
      {/* Competition selection */}
      {singleCompetition ? (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
          <span className="text-base-content/60 text-sm">開催中:</span>
          <span className="font-semibold text-primary">
            {singleCompetition.name}
          </span>
        </div>
      ) : (
        <div>
          <label
            htmlFor="competition-select"
            className="mb-1 block text-base-content/60 text-sm"
          >
            大会を選択
          </label>
          <select
            id="competition-select"
            className="select select-bordered w-full"
            value={competitionId}
            onChange={(e) => handleCompetitionChange(Number(e.target.value))}
          >
            <option value={0} disabled>
              大会を選んでください
            </option>
            {activeCompetitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Judge selection */}
      <div>
        <label
          htmlFor="judge-select"
          className="mb-1 flex items-center gap-1 text-base-content/60 text-sm"
        >
          <UserCircleIcon className="h-4 w-4" />
          採点者を選択
        </label>
        <select
          id="judge-select"
          ref={judgeSelectRef}
          className={`select select-bordered w-full ${showAlert ? "select-warning" : ""}`}
          value={judgeId}
          onChange={(e) => handleJudgeChange(Number(e.target.value))}
        >
          <option value={0} disabled>
            採点者を選んでください
          </option>
          {filteredJudges.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
        {showAlert && (
          <div role="alert" className="alert alert-warning mt-2 py-2">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
            <span className="font-medium text-sm">
              先に採点者を選択してください
            </span>
          </div>
        )}
      </div>

      {/* Course and Player selection side by side */}
      {competitionId !== 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Course selection */}
          <div>
            <p className="mb-2 text-base-content/60 text-sm">コースを選択</p>
            {filteredCourses.length > 0 ? (
              <div className="grid gap-2">
                {filteredCourses.map((c) => (
                  <CourseCard
                    key={c.id}
                    name={c.name}
                    disabled={disableCondition}
                    isSelected={selectedCourseId === c.id}
                    onDisabledClick={handleDisabledClick}
                    onClick={() => handleCourseSelect(c.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-base-content/40 text-sm">
                コースが割り当てられていません
              </p>
            )}
          </div>

          {/* Player selection */}
          <div>
            <p className="mb-2 text-base-content/60 text-sm">選手を選択</p>
            <PlayerSelector
              competitionId={competitionId}
              selectedPlayerId={selectedPlayerId}
              onSelect={handlePlayerSelect}
            />
          </div>
        </div>
      )}

      {competitionId === 0 && (
        <p className="py-4 text-center text-base-content/40 text-sm">
          大会を選択するとコースと選手が表示されます
        </p>
      )}

      {/* Start scoring button - always visible when competition selected */}
      {competitionId !== 0 && (
        <button
          type="button"
          onClick={handleStartScoring}
          disabled={!canStartScoring}
          className={`btn w-full gap-2 rounded-xl border-0 font-bold text-base tracking-wide transition-all duration-300 ${
            canStartScoring
              ? "btn-primary scoring-btn-ready hover:brightness-110 active:scale-[0.97]"
              : "cursor-not-allowed bg-base-300 text-base-content/30"
          }`}
        >
          <PlayIcon className="h-5 w-5" />
          採点を開始
        </button>
      )}
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
