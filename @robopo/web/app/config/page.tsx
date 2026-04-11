import { getCompetitionList } from "@/app/components/server/db"
import { CompetitionView } from "@/app/config/view"

export const revalidate = 0

export default async function Config() {
  const { competitions } = await getCompetitionList()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-base-content tracking-tight">
            大会一覧
          </h1>
          <p className="mt-1 text-base-content/60 text-sm">
            大会の作成・編集・削除を行います
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <CompetitionView initialCompetitionList={competitions} />
      </div>
    </div>
  )
}
