import { Skeleton } from "@/components/common/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Toolbar skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* Header card skeleton */}
      <div className="card mb-6 border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-10 rounded" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Course sections skeleton */}
      {["s1", "s2"].map((id) => (
        <div key={id} className="mb-6">
          <div className="mb-3 flex items-center justify-between border-base-300 border-l-4 pl-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-7 w-28 rounded-lg" />
          </div>
          <div className="card border border-base-300 bg-base-100 p-4 shadow-sm">
            <div className="space-y-2">
              {["r1", "r2", "r3", "r4", "r5"].map((rid) => (
                <Skeleton key={rid} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
