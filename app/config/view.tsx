"use client"
import { useState } from "react"
import { ThreeTabs } from "@/app/components/parts/threeTabs"
import { AssignTab, CompetitionListTab, NewCompetitionTab } from "@/app/config/tabs"
import { SelectCompetition, SelectCourse, SelectUmpire } from "@/app/lib/db/schema"

type ViewProps = {
  initialCompetitionList: { competitions: SelectCompetition[] }
  courseList: { courses: SelectCourse[] }
  umpireList: { umpires: SelectUmpire[] }
}

export default function View({ initialCompetitionList, courseList, umpireList }: ViewProps) {
  const [competitionId, setCompetitionId] = useState<number | null>(null)
  const [competitionList, setCompetitionList] = useState<SelectCompetition[]>(initialCompetitionList.competitions)

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
      tab3Title="コース・採点者割当"
      tab3={
        <AssignTab
          competitionId={competitionId}
          competitionList={competitionList}
          courseList={courseList}
          umpireList={umpireList}
        />
      }
    />
  )
}
