import { PlusIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { View } from "@/app/components/common/view"
import { getCompetitionList } from "@/app/components/server/db"
import {
  getCourseWithCompetition,
  groupByCourse,
} from "@/app/lib/db/queries/queries"

export const revalidate = 0

export default async function Course() {
  const [courseRows, { competitions }] = await Promise.all([
    getCourseWithCompetition(),
    getCompetitionList(),
  ])
  const initialCourseDataList = groupByCourse(courseRows)
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-10 lg:px-16">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-base-content tracking-tight">
            コース一覧
          </h1>
          <p className="mt-1 text-base-content/60 text-sm">
            コースの作成・編集・削除を行います
          </p>
        </div>
        <Link
          href="/course/edit"
          className="btn btn-primary gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:shadow-xl"
        >
          <PlusIcon className="size-5" />
          新規作成
        </Link>
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
