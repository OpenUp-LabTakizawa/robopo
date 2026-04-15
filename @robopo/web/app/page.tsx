import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { Dashboard } from "@/components/home/dashboard"
import { ChallengeTab } from "@/components/home/tabs"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db/db"
import type {
  SelectCompetition,
  SelectCompetitionCourse,
  SelectCompetitionJudge,
  SelectCourse,
  SelectJudgeWithUsername,
} from "@/lib/db/schema"
import { judge } from "@/lib/db/schema"
import {
  getCompetitionCourseAssignList,
  getCompetitionJudgeAssignList,
  getCompetitionList,
  getCourseList,
  getJudgeList,
} from "@/server/db"

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
  const judgeList: SelectJudgeWithUsername[] = await getJudgeList()
  const competitionJudgeList: {
    competitionJudgeList: SelectCompetitionJudge[]
  } = await getCompetitionJudgeAssignList()

  // Check if logged-in user is a judge
  let isJudge = false
  let loggedInJudgeId: number | undefined
  if (session?.user) {
    const judgeRecord = await db
      .select({ id: judge.id })
      .from(judge)
      .where(eq(judge.userId, session.user.id))
      .limit(1)
    if (judgeRecord.length > 0) {
      isJudge = true
      loggedInJudgeId = judgeRecord[0].id
    }
  }

  const isAdmin = session?.user && !isJudge

  const challengeTab = (
    <ChallengeTab
      key="challenge"
      competitionList={competitionList}
      courseList={courseList}
      competitionCourseList={competitionCourseList}
      judgeList={judgeList}
      competitionJudgeList={competitionJudgeList}
      loggedInJudgeId={loggedInJudgeId}
    />
  )

  if (isAdmin) {
    return (
      <Dashboard
        competitionList={competitionList}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
        loggedInJudgeId={loggedInJudgeId}
      />
    )
  }

  return (
    <div className="mx-auto mt-8 max-w-3xl px-4">
      <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
        {challengeTab}
      </div>
    </div>
  )
}
