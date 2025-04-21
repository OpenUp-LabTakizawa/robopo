"use client"
import Link from "next/link"
import React, { useMemo, useState } from "react"
import type { SelectCompetition, SelectUmpire, SelectUmpireCourse } from "@/app/lib/db/schema"

const TabButton = ({ name, link }: { name: string; link: string }) => {
  return (
    <Link href={link} className="btn btn-primary min-w-40 min-h-20 text-2xl max-w-fit m-3">
      {name}
    </Link>
  )
}

type ChallengeTabProps = {
  // competitionList: SelectCompetition[]
  competitionList: { competitions: SelectCompetition[] }
  umpireList: { umpires: SelectUmpire[] }
  rawAssignList: { assigns: SelectUmpireCourse[] }
}

export const ChallengeTab = ({ competitionList, umpireList, rawAssignList }: ChallengeTabProps): React.JSX.Element => {
  const [competitionId, setCompetitionId] = useState(0)
  const [umpireId, setUmpireId] = useState(0)
  // const [competitionList, setCompetitionList] = useState<SelectCompetition[]>(initCompetitionList)
  const disableCondiion = !competitionId || !umpireId || competitionId === 0 || umpireId === 0

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
        className="select select-bordered m-3"
        onChange={(event) => setCompetitionId(Number(event.target.value))}
        value={competitionId || 0}>
        <option value={0} disabled>
          大会を選んでください
        </option>
        {/* {competitionList?.competitions?.map((competition) => ( */}
        {competitionList?.competitions?.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
          </option>
        ))}
      </select>

      <select
        className="select select-bordered m-3"
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

      <Link
        href={disableCondiion ? "" : `/challenge/${competitionId}/${umpireId}`}
        className={
          "btn min-w-40 min-h-20 text-2xl max-w-fit m-3" + (disableCondiion ? " btn-disabled" : " btn-primary")
        }>
        採点
      </Link>
    </div>
  )
}

export const SummaryTab = (): React.JSX.Element => {
  const [competitionId, setCompetitionId] = useState(1)
  return (
    <div>
      <select
        className="select select-bordered m-3"
        onChange={(event) => setCompetitionId(Number(event.target.value))}
        value={competitionId ? competitionId : 0}>
        <option value={0} disabled>
          大会を選んでください
        </option>
        <option value="1">PreOpen</option>
        {/* {competitionList ? (
          competitionList.selectompetition.map(
            (competition) =>
            competition.id !== -1 &&
            competition.id !== -2 && (
              <option key={competition.id} value={competition.id}>
              {competition.name}
              </option>
              )
              )
              ) : (
                <option>コースがありません</option>
                )} */}
      </select>
      <TabButton name="集計結果" link={`/summary?competitionId=${competitionId}`} />
    </div>
  )
}

export const ManageTab = (): React.JSX.Element => {
  return (
    <div className="grid sm:grid-cols-2 md:flex md:flex-col justify-center">
      <TabButton name="コース作成" link={`/course`} />
      <TabButton name="選手登録" link={`/player`} />
      <TabButton name="採点者登録" link={`/umpire`} />
      <TabButton name="大会設定" link={`/config`} />
    </div>
  )
}
