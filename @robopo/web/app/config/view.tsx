"use client"
import { useState } from "react"
import { ThreeTabs } from "@/app/components/parts/threeTabs"
import { CompetitionListTab, NewCompetitionTab } from "@/app/config/tabs"
import type { SelectCompetition } from "@/app/lib/db/schema"

type ViewProps = {
  initialCompetitionList: { competitions: SelectCompetition[] }
}

export function View({ initialCompetitionList }: ViewProps) {
  const [competitionId, setCompetitionId] = useState<number | null>(null)
  const [competitionList, setCompetitionList] = useState<SelectCompetition[]>(
    initialCompetitionList.competitions,
  )

  return (
    <ThreeTabs
      tab1Title="大会一覧"
      tab1={
        <CompetitionListTab
          competitionId={competitionId}
          setCompetitionId={setCompetitionId}
          competitionList={competitionList}
          setCompetitionList={setCompetitionList}
        />
      }
      tab2Title="大会登録"
      tab2={<NewCompetitionTab setCompetitionList={setCompetitionList} />}
      tab3Title=""
      tab3={null}
    />
  )
}
