import { SelectCompetition, SelectUmpire, SelectUmpireCourse } from "@/app/lib/db/schema"
import { getCompetitionList, getUmpireList, getRawAssignList } from "@/app/components/common/utils"
import { ChallengeTab, SummaryTab, ManageTab } from "@/app/components/home/tabs"
import { ThreeTabs } from "@/app/components/parts/threeTabs"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const competitionList: { competitions: SelectCompetition[] } = await getCompetitionList()
  const umpireList: { umpires: SelectUmpire[] } = await getUmpireList()
  const rawAssignList: { assigns: SelectUmpireCourse[] } = await getRawAssignList()

  return (
    <ThreeTabs
      tab1Title="採点"
      tab1={<ChallengeTab key="challenge" competitionList={competitionList} umpireList={umpireList} rawAssignList={rawAssignList} />}
      tab2Title="集計結果"
      tab2={<SummaryTab key="summary" competitionList={competitionList} />}
      tab3Title="大会管理"
      tab3={<ManageTab key="manage" />}
    />
  )
}
