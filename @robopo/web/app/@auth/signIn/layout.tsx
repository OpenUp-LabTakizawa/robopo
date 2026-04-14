import type React from "react"
import { Suspense } from "react"
import { Skeleton } from "@/app/components/common/skeleton"

function SignInSkeleton() {
  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-sm">
        <div className="flex animate-[skeletonFadeIn_0.3s_ease-out] flex-col items-center px-2">
          {/* Title */}
          <div className="mb-6 w-full text-center">
            <Skeleton className="mx-auto h-7 w-24" />
          </div>

          {/* Form fields */}
          <div className="flex w-full flex-col gap-4">
            <div>
              <Skeleton className="mb-1.5 h-3.5 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-3.5 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex w-full flex-col gap-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="modal-backdrop" />
    </dialog>
  )
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Suspense fallback={<SignInSkeleton />}>{children}</Suspense>
}
