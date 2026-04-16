function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ""}`} />
}

function RobotIcon() {
  return (
    <div className="absolute inset-0 z-[1] flex items-center justify-center">
      <div className="loading-robot-pulse flex size-14 items-center justify-center rounded-2xl bg-base-100">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
          role="img"
        >
          <title>Loading robot icon</title>
          {/* Antenna */}
          <circle cx="16" cy="4" r="2" fill="currentColor" opacity="0.6" />
          <line
            x1="16"
            y1="6"
            x2="16"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Head */}
          <rect
            x="7"
            y="10"
            width="18"
            height="12"
            rx="4"
            fill="currentColor"
            opacity="0.15"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Eyes */}
          <circle cx="12" cy="16" r="2" fill="currentColor">
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="20" cy="16" r="2" fill="currentColor">
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="2s"
              repeatCount="indefinite"
              begin="0.15s"
            />
          </circle>
          {/* Body */}
          <rect
            x="9"
            y="23"
            width="14"
            height="6"
            rx="2"
            fill="currentColor"
            opacity="0.15"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Arms */}
          <line
            x1="7"
            y1="25"
            x2="4"
            y2="27"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="25"
            y1="25"
            x2="28"
            y2="27"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

const gridCells = ["g0", "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"]
const panelItems = ["p0", "p1", "p2", "p3", "p4"]
const missionItems = ["m0", "m1", "m2", "m3", "m4"]
const radioItems = ["r0", "r1", "r2"]
const btnItems = ["b0", "b1"]

export function PageLoading() {
  return (
    <div className="h-full w-full animate-[skeletonFadeIn_0.3s_ease-out]">
      <div className="gap-4 p-4 sm:grid sm:max-h-screen sm:grid-cols-2">
        {/* Left column: Field editor skeleton */}
        <div className="sm:w-full sm:justify-self-end">
          {/* Field grid card */}
          <div className="card w-full min-w-72 bg-base-100 shadow-xl">
            <div className="card-body">
              <SkeletonBlock className="mb-3 h-4 w-24" />
              {/* 3x3 grid */}
              <div className="relative mx-auto grid grid-cols-[repeat(3,85px)] grid-rows-[repeat(3,85px)] gap-[1px]">
                {gridCells.map((id, i) => (
                  <div
                    key={id}
                    className="skeleton-shimmer size-[85px] rounded-lg border border-base-300/50"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
                <RobotIcon />
              </div>
            </div>
          </div>
          {/* Panel select card */}
          <div className="card mt-4 w-full min-w-72 bg-base-100 shadow-xl">
            <div className="card-body flex w-full flex-row items-center gap-3">
              {panelItems.map((id) => (
                <SkeletonBlock key={id} className="size-10" />
              ))}
              <SkeletonBlock className="ml-auto h-10 w-20 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right column: Mission editor skeleton */}
        <div className="mt-4 sm:mx-4 sm:mt-0 sm:w-full sm:justify-self-start">
          {/* Mission list card */}
          <div className="card w-full min-w-72 bg-base-100 shadow-xl">
            <div className="card-body">
              <SkeletonBlock className="mb-3 h-4 w-32" />
              <div className="space-y-2">
                {missionItems.map((id) => (
                  <SkeletonBlock key={id} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
          {/* Course-out rule card */}
          <div className="card mt-3 w-full min-w-72 bg-base-100 shadow-xl">
            <div className="card-body">
              <SkeletonBlock className="mb-3 h-4 w-24" />
              <div className="flex flex-wrap gap-4">
                {radioItems.map((id) => (
                  <div key={id} className="flex items-center gap-2">
                    <SkeletonBlock className="size-5 rounded-full" />
                    <SkeletonBlock className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="mt-0 flex justify-center gap-4 p-4">
        {btnItems.map((id) => (
          <SkeletonBlock key={id} className="h-12 min-w-28 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
