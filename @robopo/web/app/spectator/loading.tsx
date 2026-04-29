// Spectator page loading skeleton.
// Mirrors the live screen's structure (TopBar + main "注目の挑戦" panel +
// course-best strip + ランキング TOP 5) so the transition into the live UI
// feels seamless, not like a page-level swap.
//
// Both desktop and mobile layouts are rendered in the DOM and toggled with
// Tailwind responsive utilities — no client-side hooks needed.

const PANEL_BG = "bg-[#0f1525]"
const PANEL_BORDER = "border-[#1f2c47]"
const SHIMMER = "spectator-skeleton"

function Bar({ className = "" }: { className?: string }) {
  return <div className={`${SHIMMER} ${className}`} />
}

function StatBlockSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Bar className={`h-3 ${compact ? "w-12" : "w-16"}`} />
      <Bar className={`${compact ? "h-6 w-16" : "h-8 w-20"}`} />
    </div>
  )
}

function CourseBestCardSkeleton() {
  return (
    <div
      className={`rounded-xl border-2 ${PANEL_BORDER} ${PANEL_BG} flex flex-col gap-2 p-3`}
    >
      <Bar className="h-3 w-20" />
      <Bar className="h-5 w-24" />
      <div className="flex items-center justify-between">
        <Bar className="h-3 w-14" />
        <Bar className="h-6 w-12" />
      </div>
    </div>
  )
}

function LeaderboardRowSkeleton() {
  return (
    <div
      className={`grid grid-cols-[40px_1fr_auto_auto] items-center gap-3 rounded-lg border px-2.5 py-2 ${PANEL_BORDER}`}
    >
      <Bar className="h-7 w-7 justify-self-center" />
      <Bar className="h-5 w-24" />
      <Bar className="h-3 w-8" />
      <Bar className="h-6 w-10" />
    </div>
  )
}

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden bg-[#070a14] text-[#e8edf5]"
      aria-busy="true"
      aria-live="polite"
    >
      {/* TopBar */}
      <div
        className={`flex items-center justify-between gap-2 border-[#00e0ff]/40 border-b-2 bg-black/55 px-3 py-2 sm:px-6 sm:py-3`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-5">
          {/* LIVE pill */}
          <Bar className="h-6 w-14 shrink-0 sm:h-7 sm:w-16" />
          {/* ROBOSAVA */}
          <Bar className="h-6 w-32 shrink-0 sm:h-8 sm:w-44" />
          {/* Competition name (desktop only) */}
          <Bar className="hidden h-4 w-32 sm:block" />
        </div>
        {/* Clock */}
        <Bar className="h-7 w-20 shrink-0 sm:h-8 sm:w-28" />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-2.5 p-2.5 md:grid-cols-[2fr_1fr] md:gap-4 md:p-4">
        {/* ----- Left column ------------------------------------------------ */}
        <div className="flex flex-col gap-2.5 md:gap-4">
          {/* Last run / featured panel */}
          <div
            className={`rounded-xl border-2 ${PANEL_BORDER} ${PANEL_BG} flex flex-col gap-3 p-3.5 sm:gap-4 sm:p-6`}
          >
            <div className="flex flex-col gap-2 md:flex-row md:justify-between">
              <div className="flex min-w-0 flex-col gap-2">
                <Bar className="h-3 w-24" />
                <div className="flex items-baseline gap-3">
                  <Bar className="h-7 w-14 shrink-0" />
                  <Bar className="h-7 w-32 sm:h-9 sm:w-44" />
                </div>
                <Bar className="h-3 w-20" />
              </div>
              <div className="flex flex-col gap-1 md:items-end">
                {/* Reserved badge slot (matches live MainPanel min-h-32) */}
                <Bar className="h-7 w-32" />
                <Bar className="mt-1 h-3 w-12" />
                <Bar className="h-5 w-24" />
              </div>
            </div>
            {/* Course preview */}
            <Bar className="h-[200px] w-full rounded-lg sm:h-[280px]" />
            {/* Stat grid */}
            <div
              className={`grid grid-cols-2 gap-2.5 border-t ${PANEL_BORDER} pt-2 sm:grid-cols-4 sm:gap-4`}
            >
              <StatBlockSkeleton />
              <StatBlockSkeleton />
              <StatBlockSkeleton />
              <StatBlockSkeleton />
            </div>
          </div>
          {/* Course best strip - desktop (3-4 columns) */}
          <div className="hidden grid-cols-3 gap-3 md:grid">
            <CourseBestCardSkeleton />
            <CourseBestCardSkeleton />
            <CourseBestCardSkeleton />
          </div>
        </div>

        {/* ----- Right column ----------------------------------------------- */}
        <div
          className={`rounded-xl border-2 ${PANEL_BORDER} ${PANEL_BG} flex h-fit flex-col gap-2.5 p-3.5 sm:p-5`}
        >
          <Bar className="h-3 w-32" />
          <LeaderboardRowSkeleton />
          <LeaderboardRowSkeleton />
          <LeaderboardRowSkeleton />
          <LeaderboardRowSkeleton />
          <LeaderboardRowSkeleton />
        </div>

        {/* Course best strip - mobile (2 columns, after leaderboard) */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <CourseBestCardSkeleton />
          <CourseBestCardSkeleton />
        </div>
      </div>

      {/* Floating control panel (top-right desktop / bottom mobile) */}
      <div
        className={`fixed top-2 right-2 hidden items-center gap-2.5 rounded-lg border border-white/15 bg-black/70 px-2 py-2 backdrop-blur-sm md:flex`}
      >
        <Bar className="h-4 w-16" />
        <Bar className="h-2 w-2 rounded-full" />
        <Bar className="h-6 w-24" />
        <Bar className="h-6 w-24" />
      </div>
      <div
        className={`fixed right-2 bottom-2 left-2 flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-black/70 px-2 py-2 backdrop-blur-sm md:hidden`}
      >
        <div className="flex items-center gap-2">
          <Bar className="h-4 w-16" />
          <Bar className="h-2 w-2 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Bar className="h-6 w-20" />
          <Bar className="h-6 w-24" />
        </div>
      </div>

      {/* Screen-reader-only loading hint */}
      <span className="sr-only">読み込み中</span>
    </div>
  )
}
