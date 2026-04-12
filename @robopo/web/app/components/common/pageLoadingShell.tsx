import type React from "react"
import { Skeleton } from "@/app/components/common/skeleton"

const listRows = ["r0", "r1", "r2", "r3", "r4", "r5"]

export function PageLoadingShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-10 lg:px-16">
      <div className="mb-4 shrink-0">
        <h1 className="font-bold text-2xl text-base-content tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-base-content/60 text-sm">{description}</p>
      </div>
      <div className="flex min-h-0 flex-1 animate-[skeletonFadeIn_0.3s_ease-out] flex-col rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        {children ?? <ListPageSkeleton />}
      </div>
    </div>
  )
}

function ListPageSkeleton() {
  return (
    <>
      {/* Action buttons skeleton */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        {/* Filter / sort bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-32 rounded-lg" />
        </div>
      </div>

      {/* List rows skeleton */}
      <div className="min-h-0 flex-1 space-y-0 px-4">
        {listRows.map((id, i) => (
          <div
            key={id}
            className="flex items-center gap-3 border-base-200/60 border-b py-3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Skeleton className="size-5 shrink-0 rounded" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="ml-auto h-3 w-1/5" />
          </div>
        ))}
      </div>
    </>
  )
}
