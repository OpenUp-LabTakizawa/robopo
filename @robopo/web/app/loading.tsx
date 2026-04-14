import { Skeleton } from "@/app/components/common/skeleton"

const selectionCardKeys = ["sc0", "sc1"]
const playerCardKeys = ["pc0", "pc1", "pc2"]
const manageItems = ["m0", "m1", "m2", "m3", "m4"]

function SelectionCardSkeleton() {
  return (
    <div className="flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-base-300 px-4 py-2.5">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  )
}

function PlayerCardSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-base-300 px-3 py-2.5">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-2.5 w-2/5" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-[skeletonFadeIn_0.3s_ease-out] px-4 py-6">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Scoring card skeleton */}
        <div className="md:col-span-2">
          <div className="rounded-box border border-primary/20 bg-base-100 p-5 shadow-sm ring-1 ring-primary/10">
            {/* Card header */}
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-5 w-14" />
            </div>
            {/* ChallengeTab 2x2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Competition selection */}
              <div>
                <Skeleton className="mb-2 h-3.5 w-20" />
                <div className="grid gap-2">
                  {selectionCardKeys.map((id) => (
                    <SelectionCardSkeleton key={id} />
                  ))}
                </div>
              </div>

              {/* Course selection */}
              <div>
                <Skeleton className="mb-2 h-3.5 w-24" />
                <div className="grid gap-2">
                  {selectionCardKeys.map((id) => (
                    <SelectionCardSkeleton key={`c-${id}`} />
                  ))}
                </div>
              </div>

              {/* Judge selection */}
              <div>
                <Skeleton className="mb-2 h-3.5 w-24" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <div className="mt-2 grid gap-2">
                  {selectionCardKeys.map((id) => (
                    <SelectionCardSkeleton key={`j-${id}`} />
                  ))}
                </div>
              </div>

              {/* Player selection */}
              <div>
                <Skeleton className="mb-2 h-3.5 w-20" />
                <div className="grid gap-1.5">
                  {playerCardKeys.map((id) => (
                    <PlayerCardSkeleton key={id} />
                  ))}
                </div>
              </div>

              {/* Start scoring button */}
              <Skeleton className="col-span-2 h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Management card skeleton */}
        <div className="md:col-span-2">
          <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
            {/* Card header */}
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-5 w-20" />
            </div>
            {/* Nav links */}
            <div className="grid gap-2">
              {manageItems.map((id, i) => (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-base-300 px-4 py-3"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Skeleton className="h-6 w-6 shrink-0 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
