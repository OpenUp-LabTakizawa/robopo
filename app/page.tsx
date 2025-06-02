import {
  ClipboardDocumentCheckIcon,
  CalculatorIcon,
  TrophyIcon
} from "@heroicons/react/24/outline"
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
        tab1Icon={<ClipboardDocumentCheckIcon className="h-3 w-3 md:h-8 md:w-8" />}
        tab2Title="集計結果"
        tab2={<SummaryTab key="summary" competitionList={competitionList} />}
        tab2Icon={<CalculatorIcon className="h-3 w-3 md:h-8 md:w-8" />}
        tab3Title="大会管理"
        tab3={<ManageTab key="manage" />}
        tab3Icon={<TrophyIcon className="h-3 w-3 md:h-8 md:w-8" />}
      />
      :
      <div role="tablist" className="tabs tabs-lifted m-5">
        <input
          type="radio"
          name="tabs"
          id="challenge-tab"
          role="tab"
          className="tab whitespace-nowrap"
          defaultChecked={true}
        />
        <div role="tabpanel" className="tab-content bg-base-100 border border-base-300 rounded-box p-6">
          <ChallengeTab key="challenge" competitionList={competitionList} courseList={courseList} competitionCourseList={competitionCourseList} />
        </div>
        <label htmlFor="challenge-tab" className="flex tab items-center gap-2">
          <ClipboardDocumentCheckIcon className="h-6 w-6" />
          採点
        </label>
      </div>
  )
}
