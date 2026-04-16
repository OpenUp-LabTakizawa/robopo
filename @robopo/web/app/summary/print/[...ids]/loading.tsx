import { Skeleton } from "@/components/common/skeleton"

export default function Loading() {
  return (
    <>
      {/* Toolbar skeleton */}
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-base-300 border-b bg-base-100 px-4 py-3 shadow-sm">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* A4 sheet skeleton */}
      <div className="mx-auto mt-16 mb-8">
        <div className="mx-auto box-border min-h-[297mm] w-[210mm] bg-white p-6 shadow-lg">
          {/* Header */}
          <div className="mb-3 flex items-baseline justify-between border-gray-200 border-b pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          {/* Player info */}
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          {/* Course tables */}
          {["c1", "c2", "c3"].map((id) => (
            <div key={id} className="mb-4">
              <Skeleton className="mb-1 h-3 w-28" />
              <div className="space-y-1">
                {["r1", "r2", "r3", "r4", "r5", "r6"].map((rid) => (
                  <Skeleton key={rid} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
