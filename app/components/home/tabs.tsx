"use client"
import Link from "next/link"
import React, { useMemo, useState } from "react"
import type { SelectCompetition, SelectCompetitionCourse, SelectCourse } from "@/app/lib/db/schema"
import { RESERVED_COURSE_IDS } from "@/app/components/course/utils"

const ContentButton = ({ name, link, disabled }: { name: string; link: string; disabled: boolean }) => {
  return (
    <Link
      href={disabled ? "" : link}
      className={
        "btn min-w-40 min-h-20 text-2xl max-w-fit m-3" + (disabled ? " btn-disabled" : " btn-primary")
      }>
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

export const ChallengeTab = ({ competitionList, courseList, competitionCourseList }: ChallengeTabProps): React.JSX.Element => {
  // 1) Move all “step === 1” filtering into a single memoized array,
  //    so you don’t repeat .filter() three times or use an inline IIFE:
  const activeCompetitions = useMemo(
    () => competitionList.competitions.filter(c => c.step === 1),
    [competitionList.competitions]
  )
  const singleCompetition = activeCompetitions.length === 1
    ? activeCompetitions[0]
    : null

  // 2) Initialize state from the singleCompetition (if any):
  const [competitionId, setCompetitionId] = useState(
    singleCompetition?.id ?? 0
  )
  const disableCondition = competitionId === 0

  // 3) Memoize filteredCourses as before:
  const filteredCourses = useMemo(() => {
    if (competitionId === 0) return []
    const assigned = competitionCourseList.competitionCourseList
      .filter(cc => cc.competitionId === competitionId)
      .map(cc => cc.courseId)
    return courseList.courses.filter(c => assigned.includes(c.id))
  }, [competitionId, competitionCourseList, courseList.courses])

  return (
    <div>
      {/* 4) Flatten the competition UI into two clear branches */}
      {singleCompetition ? (
        <div className="flex flex-col ...">
          <h2 className="text-xl">開催中大会: {singleCompetition.name}</h2>
        </div>
      ) : (
        <select
          className="select select-bordered m-3 w-50"
          value={competitionId}
          onChange={e => setCompetitionId(Number(e.target.value))}
        >
          <option value={0} disabled>大会を選んでください</option>
          {activeCompetitions.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {/* 5) Same for courses: a clear conditional */}
      {filteredCourses.length > 0 ? (
        <div className="flex flex-col ...">
          {filteredCourses.map(course => (
            <ContentButton
              key={course.id}
              name={course.name}
              link={`/challenge/${competitionId}/${course.id}`}
              disabled={disableCondition}
            />
          ))}
          <ContentButton name="THE一本橋" link={`/challenge/${competitionId}/${RESERVED_COURSE_IDS.IPPON}`} disabled={disableCondition} />
          <ContentButton name="センサーコース" link={`/challenge/${competitionId}/${RESERVED_COURSE_IDS.SENSOR}`} disabled={disableCondition} />
        </div>
      ) : (
        <p className="m-3">コース未割り当てです</p>
      )}
    </div>
  )
}

export const SummaryTab = ({ competitionList }: SummaryTabProps): React.JSX.Element => {
  const [competitionId, setCompetitionId] = useState(0)
  const disableCondition = !competitionId || competitionId === 0
  return (
    <div>
      <select
        className="select select-bordered m-3 w-50"
        onChange={(event) => setCompetitionId(Number(event.target.value))}
        value={competitionId || 0}>
        <option value={0} disabled>
          大会を選んでください
        </option>
        {competitionList?.competitions?.map((competition) => (
          <option key={competition.id} value={competition.id} hidden={competition.step === 0}>
            {competition.name}
          </option>
        ))}
      </select>
      <ContentButton name="集計結果" link={`/summary/${competitionId}`} disabled={disableCondition} />
    </div>
  )
}

export const ManageTab = (): React.JSX.Element => {
  return (
    <div className="grid sm:grid-cols-2 md:flex md:flex-col justify-center">
      <ContentButton name="コース作成" link={`/course`} disabled={false} />
      <ContentButton name="選手登録" link={`/player`} disabled={false} />
      <ContentButton name="採点者登録" link={`/umpire`} disabled={false} />
      <ContentButton name="大会設定" link={`/config`} disabled={false} />
    </div>
  )
}
