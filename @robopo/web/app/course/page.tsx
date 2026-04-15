import { View } from "@/components/common/view"
import {
  getCourseWithCompetition,
  groupByCourse,
} from "@/lib/db/queries/queries"
import { getCompetitionList } from "@/server/db"

export default async function Course() {
  const [courseRows, { competitions }] = await Promise.all([
    getCourseWithCompetition(),
    getCompetitionList(),
  ])
  const initialCourseDataList = groupByCourse(courseRows)
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-10 lg:px-16">
      <div className="mb-4 shrink-0">
        <h1 className="font-bold text-2xl text-base-content tracking-tight">
          コース一覧
        </h1>
        <p className="mt-1 text-base-content/60 text-sm">
          コースの作成・編集・削除を行います
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <View
          initialCommonDataList={initialCourseDataList}
          competitionList={competitions}
        />
      </div>
    </div>
  )
}
