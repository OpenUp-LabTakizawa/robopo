"use client"

import { CalculatorIcon } from "@heroicons/react/24/outline"
import type { Route } from "next"
import Link from "next/link"
import type React from "react"
import { useMemo, useState } from "react"
import { RESERVED_COURSE_IDS } from "@/app/components/course/utils"
import { COMPETITION_MANAGEMENT_LIST } from "@/app/lib/const"
import type {
  SelectCompetition,
  SelectCompetitionCourse,
  SelectCourse,
} from "@/app/lib/db/schema"

function ContentButton({
  name,
  link,
  icon,
  disabled,
}: {
  name: string
  link: Route
  icon?: React.JSX.Element
  disabled: boolean
}) {
  return (
    <Link
      href={disabled ? ("" as Route) : link}
      className={`btn m-3 flex min-h-20 min-w-40 max-w-fit text-2xl ${disabled ? "btn-disabled" : "btn-primary"}`}
    >
      {icon}
      {name}
    </Link>
  )
}

type ChallengeTabProps = {
  competitionList: { competitions: SelectCompetition[] }
  courseList: { courses: SelectCourse[] }
  competitionCourseList: { competitionCourseList: SelectCompetitionCourse[] }
}

type SummaryTabProps = {
  competitionList: { competitions: SelectCompetition[] }
}

export function ChallengeTab({
  competitionList,
  courseList,
  competitionCourseList,
}: ChallengeTabProps): React.JSX.Element {
  // 1) Move all “step === 1” filtering into a single memoized array,
  //    so you don’t repeat .filter() three times or use an inline IIFE:
  const activeCompetitions = useMemo(
    () => competitionList.competitions.filter((c) => c.step === 1),
    [competitionList.competitions],
  )
  const singleCompetition =
    activeCompetitions.length === 1 ? activeCompetitions[0] : null

  // 2) Initialize state from the singleCompetition (if any):
  const [competitionId, setCompetitionId] = useState(singleCompetition?.id ?? 0)
  const disableCondition = competitionId === 0

  // 3) Memoize filteredCourses as before:
  const filteredCourses = useMemo(() => {
    if (competitionId === 0) {
      return []
    }
    const assigned = competitionCourseList.competitionCourseList
      .filter((cc) => cc.competitionId === competitionId)
      .map((cc) => cc.courseId)
    return courseList.courses.filter((c) => assigned.includes(c.id))
  }, [competitionId, competitionCourseList, courseList.courses])

  return (
    <div>
      {/* 4) Flatten the competition UI into two clear branches */}
      {singleCompetition ? (
        <div className="... flex flex-col">
          <h2 className="text-xl">開催中大会: {singleCompetition.name}</h2>
        </div>
      ) : (
        <select
          className="select select-bordered m-3 w-50"
          value={competitionId}
          onChange={(e) => setCompetitionId(Number(e.target.value))}
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
      )}

      {/* 5) Same for courses: a clear conditional */}
      {filteredCourses.length > 0 ? (
        <div className="... flex flex-col">
          {filteredCourses.map((course) => (
            <ContentButton
              key={course.id}
              name={course.name}
              link={`/challenge/${competitionId}/${course.id}` as Route}
              disabled={disableCondition}
            />
          ))}
          <ContentButton
            name="THE一本橋"
            link={
              `/challenge/${competitionId}/${RESERVED_COURSE_IDS.IPPON}` as Route
            }
            disabled={disableCondition}
          />
          <ContentButton
            name="センサーコース"
            link={
              `/challenge/${competitionId}/${RESERVED_COURSE_IDS.SENSOR}` as Route
            }
            disabled={disableCondition}
          />
        </div>
      ) : (
        <p className="m-3">コース未割り当てです</p>
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
    <div>
      <select
        className="select select-bordered m-3 w-50"
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
      <ContentButton
        name="集計結果"
        link={`/summary/${competitionId}` as Route}
        icon={<CalculatorIcon className="h-6 w-6" />}
        disabled={disableCondition}
      />
    </div>
  )
}

export const ManageTab = (): React.JSX.Element => {
  return (
    <div className="grid justify-center sm:grid-cols-2 md:flex md:flex-col">
      {COMPETITION_MANAGEMENT_LIST.map((btn) => (
        <ContentButton
          key={btn.href}
          name={btn.label}
          link={btn.href}
          icon={btn.icon}
          disabled={false}
        />
      ))}
    </div>
  )
}
