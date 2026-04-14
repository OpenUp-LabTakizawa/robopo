import { SummaryView } from "@/app/components/summary/summaryView"
import { getCompetitionStatus } from "@/app/lib/competition"
import type { SelectCompetition } from "@/app/lib/db/schema"
import { getCompetitionList } from "@/app/server/db"

function getDefaultCompetitionId(
  competitions: SelectCompetition[],
): number | null {
  // 1. 開催中の大会があればそれを選択
  const active = competitions.find((c) => getCompetitionStatus(c) === "active")
  if (active) {
    return active.id
  }

  // 2. 最も最近終了した大会を選択
  const ended = competitions
    .filter((c) => getCompetitionStatus(c) === "ended")
    .sort((a, b) => {
      const aEnd = a.endDate ? new Date(a.endDate).getTime() : 0
      const bEnd = b.endDate ? new Date(b.endDate).getTime() : 0
      return bEnd - aEnd
    })
  if (ended.length > 0) {
    return ended[0].id
  }

  return null
}

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ competitionId?: string }>
}) {
  const { competitions } = await getCompetitionList()
  const params = await searchParams

  // Filter: only show active or ended competitions
  const visibleCompetitions = competitions.filter((c) => {
    const status = getCompetitionStatus(c)
    return status === "active" || status === "ended"
  })

  const paramId = params.competitionId ? Number(params.competitionId) : null
  const defaultId =
    paramId && visibleCompetitions.some((c) => c.id === paramId)
      ? paramId
      : getDefaultCompetitionId(visibleCompetitions)

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 py-3 sm:px-10 lg:px-16">
      <div className="mb-2 shrink-0">
        <h1 className="font-bold text-2xl text-base-content tracking-tight">
          集計結果
        </h1>
        <p className="mt-0.5 text-base-content/60 text-sm lg:hidden">
          大会を選択して集計結果を確認します
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <SummaryView
          competitions={visibleCompetitions}
          defaultCompetitionId={defaultId}
        />
      </div>
    </div>
  )
}
