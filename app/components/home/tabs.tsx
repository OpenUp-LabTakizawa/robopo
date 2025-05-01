"use client"
import Link from "next/link"
import React, { useMemo, useState } from "react"
import type { SelectCompetition, SelectUmpire, SelectUmpireCourse } from "@/app/lib/db/schema"

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
  umpireList: { umpires: SelectUmpire[] }
  rawAssignList: { assigns: SelectUmpireCourse[] }
}

type SummaryTabProps = {
  competitionList: { competitions: SelectCompetition[] }
}

export const ChallengeTab = ({ competitionList, umpireList, rawAssignList }: ChallengeTabProps): React.JSX.Element => {
  const [competitionId, setCompetitionId] = useState(0)
  const [umpireId, setUmpireId] = useState(0)
  const disableCondition = !competitionId || !umpireId || competitionId === 0 || umpireId === 0

  // 大会選択後割当済の採点者を表示する
  const filteredUmpires = useMemo(() => {
    if (competitionId === 0) return []
    const assignedUmpireIds = rawAssignList.assigns
      .filter((assign) => assign.competitionId === competitionId)
      .map((assign) => assign.umpireId)

    return umpireList.umpires.filter((umpire) => assignedUmpireIds.includes(umpire.id))
  }, [competitionId, rawAssignList, umpireList])

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
          <option key={competition.id} value={competition.id} hidden={competition.step !== 1}>
            {competition.name}
          </option>
        ))}
      </select>

      <select
        className="select select-bordered m-3 w-50"
        onChange={(event) => setUmpireId(Number(event.target.value))}
        value={umpireId || 0}
        disabled={!competitionId}>
        <option value={0} disabled>
          採点者を選んでください
        </option>
        {filteredUmpires.length > 0 ? (
          filteredUmpires.map((umpire) => (
            <option key={umpire.id} value={umpire.id}>
              {umpire.name}
            </option>
          ))
        ) : (
          <option>採点者未割り当てです</option>
        )}
      </select>

      <ContentButton
        name="採点"
        link={`/challenge/${competitionId}/${umpireId}`}
        disabled={disableCondition}
      />
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
