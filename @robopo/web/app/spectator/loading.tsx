import { Skeleton } from "@/components/common/skeleton"

const cardIds = ["c1", "c2", "c3", "c4", "c5"]

export default function Loading() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-2xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-64 sm:h-9 sm:w-72" />
      </div>

      {/* Competition name / selector placeholder */}
      <Skeleton className="mb-6 h-4 w-40 self-center" />

      {/* Refresh indicator */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-20 rounded" />
      </div>

      {/* Refresh progress bar */}
      <Skeleton className="mb-6 h-0.5 w-full" />

      {/* Leaderboard cards */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-3">
          {cardIds.map((id, i) => {
            // Top 2 cards have larger padding to emphasize higher ranks
            const isTopTwo = i < 2
            const padding = isTopTwo ? "p-5" : "p-4"
            return (
              <div
                key={id}
                className={`rounded-2xl border border-base-300 bg-base-100 ${padding}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <Skeleton className="size-10 shrink-0 rounded-xl" />

                  {/* Player info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-10 rounded" />
                    </div>
                    {/* Score bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <Skeleton className="h-2.5 min-w-0 flex-1 rounded-full" />
                      <Skeleton className="h-6 w-14 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
