"use client"
import Link from "next/link"
import React, { useMemo, useState } from "react"
import type { SelectCompetition, SelectCompetitionCourse, SelectCourse } from "@/app/lib/db/schema"

const ContentButton = ({ name, link, disabled }: { name: string; link: string; disabled: boolean }) => {
  return (
    <Link
      href={disabled ? "" : link}
      className={
        "btn min-w-40 min-h-20 text-2xl max-w-fit m-3" + (disabled ? " btn-disabled hidden" : " btn-primary")
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
  const competition = (competitionList => {
    // 開催中大会が1つの場合
    if (competitionList?.competitions?.filter((competition) => competition.step === 1).length === 1) {
      return competitionList?.competitions?.filter((competition) => competition.step === 1)[0]
    } else return { id: 0 }
  })(competitionList)

  const [competitionId, setCompetitionId] = useState(competition.id)
  const disableCondition = !competitionId || competitionId === 0

  // 大会選択後割当済のコースを表示する
  const filteredCourses = useMemo(() => {
    if (competitionId === 0) return []
    const assignedCourseIds = competitionCourseList.competitionCourseList
      .filter((course) => course.competitionId === competitionId)
      .map((course) => course.courseId)

    return courseList.courses.filter((course) => assignedCourseIds.includes(course.id))
  }, [competitionId, competitionCourseList, courseList])

  return (
    <div>
      {competitionList?.competitions?.filter((competition) => competition.step === 1).length === 1 ? (
        <div className="flex flex-col justify-center overflow-y-auto w-full">
          <h2 className="text-xl">開催中大会: {competitionList?.competitions?.filter((competition) => competition.step === 1)[0].name}</h2>
        </div>
      ) : (
        <select
          className="select select-bordered m-3 w-50"
          onChange={(event) => setCompetitionId(Number(event.target.value))}
          value={competitionId || 0}>
          <option value={0} disabled>
            大会を選んでください
          </option>
          {competitionList?.competitions?.map((competition) => (
            <option key={competition.id} value={competition.id} hidden={competition.step !== 1}>
              {competition.name}
            </option>
          ))}
        </select>
      )}

      {filteredCourses.length > 0 ? (
        <div className="flex flex-col justify-center overflow-y-auto w-full">
          {filteredCourses.map((course) => (
            <ContentButton
              name={course.name}
              key={course.id}
              link={`/challenge/${competitionId}/${course.id}`}
              disabled={disableCondition}
            />
          ))}

          <ContentButton
            name="THE一本橋"
            link={`/challenge/${competitionId}/-1`}
            disabled={disableCondition}
          />

          <ContentButton
            name="センサーコース"
            link={`/challenge/${competitionId}/-2`}
            disabled={disableCondition}
          />
        </div>
      ) : (
        <>
          <br />コース未割り当てです<br />
        </>
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
