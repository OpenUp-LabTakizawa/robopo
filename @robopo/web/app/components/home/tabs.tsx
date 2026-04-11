"use client"

import {
  CalculatorIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import type { Route } from "next"
import Link from "next/link"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { COMPETITION_MANAGEMENT_LIST } from "@/app/lib/const"
import type {
  SelectCompetition,
  SelectCompetitionCourse,
  SelectCompetitionJudge,
  SelectCourse,
  SelectJudge,
} from "@/app/lib/db/schema"

function CourseCard({
  name,
  link,
  disabled,
  onDisabledClick,
}: {
  name: string
  link: Route
  disabled: boolean
  onDisabledClick?: () => void
}) {
  if (disabled) {
    return (
      <button
        type="button"
        onClick={onDisabledClick}
        className="group flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-xl border border-base-300 bg-base-200 px-4 py-3 opacity-50 transition-all"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-300 text-base-content/30 transition-colors">
          <PlayIcon className="h-5 w-5" />
        </div>
        <span className="text-left font-medium text-base">{name}</span>
      </button>
    )
  }
  return (
    <Link
      href={link}
      className="group flex min-h-[72px] items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
        <PlayIcon className="h-5 w-5" />
      </div>
      <span className="font-medium text-base">{name}</span>
    </Link>
  )
}

type ChallengeTabProps = {
  competitionList: { competitions: SelectCompetition[] }
  courseList: { courses: SelectCourse[] }
  competitionCourseList: { competitionCourseList: SelectCompetitionCourse[] }
  judgeList: SelectJudge[]
  competitionJudgeList: { competitionJudgeList: SelectCompetitionJudge[] }
}

type SummaryTabProps = {
  competitionList: { competitions: SelectCompetition[] }
}

export function ChallengeTab({
  competitionList,
  courseList,
  competitionCourseList,
  judgeList,
  competitionJudgeList,
}: ChallengeTabProps): React.JSX.Element {
  const activeCompetitions = useMemo(
    () => competitionList.competitions.filter((c) => c.step === 1),
    [competitionList.competitions],
  )
  const singleCompetition =
    activeCompetitions.length === 1 ? activeCompetitions[0] : null

  const [competitionId, setCompetitionId] = useState(singleCompetition?.id ?? 0)
  const [judgeId, setJudgeId] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const judgeSelectRef = useRef<HTMLSelectElement>(null)
  const disableCondition = competitionId === 0 || judgeId === 0

  const handleDisabledClick = useCallback(() => {
    if (judgeId === 0) {
      setShowAlert(true)
      judgeSelectRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [judgeId])

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showAlert])

  const filteredCourses = useMemo(() => {
    if (competitionId === 0) {
      return []
    }
    const assigned = competitionCourseList.competitionCourseList
      .filter((cc) => cc.competitionId === competitionId)
      .map((cc) => cc.courseId)
    return courseList.courses.filter((c) => assigned.includes(c.id))
  }, [competitionId, competitionCourseList, courseList.courses])

  const filteredJudges = useMemo(() => {
    if (competitionId === 0) {
      return judgeList
    }
    const assignedIds = competitionJudgeList.competitionJudgeList
      .filter((cu) => cu.competitionId === competitionId)
      .map((cu) => cu.judgeId)
    return judgeList.filter((u) => assignedIds.includes(u.id))
  }, [competitionId, competitionJudgeList, judgeList])

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
            onChange={(e) => {
              setCompetitionId(Number(e.target.value))
              setJudgeId(0)
            }}
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
          onChange={(e) => {
            setJudgeId(Number(e.target.value))
            setShowAlert(false)
          }}
        >
          <option value={0} disabled>
            採点者を選んでください
          </option>
          {filteredJudges.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
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

      {/* Course cards */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredCourses.map((c) => (
            <CourseCard
              key={c.id}
              name={c.name}
              link={
                `/challenge/${competitionId}/${c.id}?judgeId=${judgeId}` as Route
              }
              disabled={disableCondition}
              onDisabledClick={handleDisabledClick}
            />
          ))}
        </div>
      ) : competitionId === 0 ? (
        <p className="py-4 text-center text-base-content/40 text-sm">
          大会を選択するとコースが表示されます
        </p>
      ) : (
        <p className="py-4 text-center text-base-content/40 text-sm">
          コースが割り当てられていません
        </p>
      )}
    </div>
  )
}

export function SummaryTab({
  competitionList,
}: SummaryTabProps): React.JSX.Element {
  const [competitionId, setCompetitionId] = useState(0)
  const disableCondition = !competitionId || competitionId === 0

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="summary-competition-select"
          className="mb-1 block text-base-content/60 text-sm"
        >
          大会を選択
        </label>
        <select
          id="summary-competition-select"
          className="select select-bordered w-full"
          onChange={(event) => setCompetitionId(Number(event.target.value))}
          value={competitionId || 0}
        >
          <option value={0} disabled>
            大会を選んでください
          </option>
          {competitionList?.competitions?.map((competition) => (
            <option
              key={competition.id}
              value={competition.id}
              hidden={competition.step === 0}
            >
              {competition.name}
            </option>
          ))}
        </select>
      </div>
      {disableCondition ? (
        <button type="button" className="btn btn-disabled w-full" disabled>
          <CalculatorIcon className="h-5 w-5" />
          集計結果を見る
        </button>
      ) : (
        <Link
          href={`/summary/${competitionId}` as Route}
          className="btn btn-secondary w-full"
        >
          <CalculatorIcon className="h-5 w-5" />
          集計結果を見る
        </Link>
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
