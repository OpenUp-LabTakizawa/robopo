import { auth } from "@/auth"
import { SelectCompetition, SelectCourse, SelectCompetitionCourse } from "@/app/lib/db/schema"
import { getCompetitionList, getCourseList, getCompetitionCourseAssignList } from "@/app/components/server/db"
import { ChallengeTab, SummaryTab, ManageTab } from "@/app/components/home/tabs"
import { ThreeTabs } from "@/app/components/parts/threeTabs"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const session = await auth()
  const competitionList: { competitions: SelectCompetition[] } = await getCompetitionList()
  const courseList: { courses: SelectCourse[] } = await getCourseList()
  const competitionCourseList: { competitionCourseList: SelectCompetitionCourse[] } = await getCompetitionCourseAssignList()

  return (
    session?.user ?
      <ThreeTabs
        tab1Title="採点"
        tab1={<ChallengeTab key="challenge" competitionList={competitionList} courseList={courseList} competitionCourseList={competitionCourseList} />}
        tab2Title="集計結果"
        tab2={<SummaryTab key="summary" competitionList={competitionList} />}
        tab3Title="大会管理"
        tab3={<ManageTab key="manage" />}
      />
      :
      <div role="tablist" className="tabs tabs-lifted m-5">
        <input
          type="radio"
          name="tabs"
          role="tab"
          className="tab whitespace-nowrap"
          aria-label={"採点"}
          defaultChecked={true}
        />
        <div role="tabpanel" className="tab-content bg-base-100 border border-base-300 rounded-box p-6">
          <ChallengeTab key="challenge" competitionList={competitionList} courseList={courseList} competitionCourseList={competitionCourseList} />
        </div>
      </div>
  )
}
