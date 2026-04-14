import { Skeleton } from "@/app/components/common/skeleton"

export default function Loading() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] animate-[skeletonFadeIn_0.3s_ease-out] flex-col">
      {/* Status bar */}
      <div className="border-base-300 border-b bg-base-100">
        <div className="flex items-center justify-between px-3 py-1.5">
          {/* Left: attempt badge + course/player info */}
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          {/* Right: mission overview + sound + score */}
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-7 w-14 rounded" />
          </div>
        </div>
        {/* Progress bar */}
        <Skeleton className="h-1 w-full rounded-none" />
      </div>

      {/* Mission info area */}
      <div className="flex shrink-0 items-center justify-center gap-4 bg-base-200/30 px-4 py-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>

      {/* Field (game board) */}
      <div className="flex flex-1 items-center justify-center px-4">
        <Skeleton className="aspect-square w-full max-w-sm rounded-2xl" />
      </div>

      {/* Action bar */}
      <div className="border-base-300 border-t bg-base-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
