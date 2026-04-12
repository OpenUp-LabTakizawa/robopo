import { headers } from "next/headers"
import { Dashboard } from "@/app/components/home/dashboard"
import { ChallengeTab } from "@/app/components/home/tabs"
import {
  getCompetitionCourseAssignList,
  getCompetitionJudgeAssignList,
  getCompetitionList,
  getCourseList,
  getJudgeList,
} from "@/app/components/server/db"
import type {
  SelectCompetition,
  SelectCompetitionCourse,
  SelectCompetitionJudge,
  SelectCourse,
  SelectJudge,
} from "@/app/lib/db/schema"
import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const competitionList: { competitions: SelectCompetition[] } =
    await getCompetitionList()
  const courseList: { courses: SelectCourse[] } = await getCourseList()
  const competitionCourseList: {
    competitionCourseList: SelectCompetitionCourse[]
  } = await getCompetitionCourseAssignList()
  const judgeList: SelectJudge[] = await getJudgeList()
  const competitionJudgeList: {
    competitionJudgeList: SelectCompetitionJudge[]
  } = await getCompetitionJudgeAssignList()

  return session?.user ? (
    <Dashboard
      competitionList={competitionList}
      courseList={courseList}
      competitionCourseList={competitionCourseList}
      judgeList={judgeList}
      competitionJudgeList={competitionJudgeList}
    />
  ) : (
    <div className="mx-auto mt-8 max-w-lg">
      <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
        <ChallengeTab
          key="challenge"
          competitionList={competitionList}
          courseList={courseList}
          competitionCourseList={competitionCourseList}
          judgeList={judgeList}
          competitionJudgeList={competitionJudgeList}
        />
      </div>
    </div>
  )
}
