import { PageLoadingShell } from "@/app/components/common/pageLoadingShell"
import { Skeleton } from "@/app/components/common/skeleton"

const tableRows = ["t0", "t1", "t2", "t3", "t4", "t5"]
const tableCols = ["c0", "c1", "c2", "c3", "c4", "c5", "c6"]

export default function Loading() {
  return (
    <PageLoadingShell
      title="集計結果"
      description="大会を選択して集計結果を確認します"
    >
      {/* Competition & Course selectors skeleton */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <Skeleton className="mb-1.5 h-3 w-10" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="min-w-[200px] flex-1">
            <Skeleton className="mb-1.5 h-3 w-12" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="min-h-0 flex-1 overflow-hidden px-4">
        {/* Header row */}
        <div className="flex items-center gap-3 border-base-300 border-b py-2.5">
          {tableCols.map((id) => (
            <Skeleton key={id} className="h-3 flex-1" />
          ))}
        </div>
        {/* Data rows */}
        {tableRows.map((id, i) => (
          <div
            key={id}
            className="flex items-center gap-3 border-base-200/60 border-b py-3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {tableCols.map((cid) => (
              <Skeleton key={cid} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </PageLoadingShell>
  )
}
