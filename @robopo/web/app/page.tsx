import {
  CalculatorIcon,
  ClipboardDocumentCheckIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline"
import { ChallengeTab, ManageTab, SummaryTab } from "@/app/components/home/tabs"
import { ThreeTabs } from "@/app/components/parts/threeTabs"
import {
  getCompetitionCourseAssignList,
  getCompetitionList,
  getCourseList,
} from "@/app/components/server/db"
import type {
  SelectCompetition,
  SelectCompetitionCourse,
  SelectCourse,
} from "@/app/lib/db/schema"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const session = await auth()
  const competitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()
  const courseList: { courses: SelectCourse[] } = await getCourseList()
  const competitionCourseList: {
    competitionCourseList: SelectCompetitionCourse[]
  } = await getCompetitionCourseAssignList()

  return session?.user ? (
    <ThreeTabs
      tab1Title="採点"
      tab1={
        <ChallengeTab
          key="challenge"
          competitionList={competitionList}
          courseList={courseList}
          competitionCourseList={competitionCourseList}
        />
      }
      tab1Icon={
        <ClipboardDocumentCheckIcon className="h-3 w-3 md:h-8 md:w-8" />
      }
      tab2Title="集計結果"
      tab2={<SummaryTab key="summary" competitionList={competitionList} />}
      tab2Icon={<CalculatorIcon className="h-3 w-3 md:h-8 md:w-8" />}
      tab3Title="大会管理"
      tab3={<ManageTab key="manage" />}
      tab3Icon={<TrophyIcon className="h-3 w-3 md:h-8 md:w-8" />}
    />
  ) : (
    <div className="rounded-box border border-base-300 bg-base-100 p-6">
      <ChallengeTab
        key="challenge"
        competitionList={competitionList}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
      />
    </div>
  )
}
