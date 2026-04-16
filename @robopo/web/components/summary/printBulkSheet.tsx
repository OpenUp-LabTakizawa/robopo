"use client"

import { ArrowLeft, Printer } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  type PrintCourseData,
  PrintCourseTable,
} from "@/components/summary/printScoreSheet"

type PlayerSheet = {
  player: {
    id: number
    name: string
    furigana: string | null
    bibNumber: string | null
  }
  courses: PrintCourseData[]
  totalPoint: number
  totalChallengeCount: number
}

type PrintBulkSheetProps = {
  competitionName: string
  players: PlayerSheet[]
}

export function PrintBulkSheet({
  competitionName,
  players,
}: PrintBulkSheetProps) {
  const router = useRouter()

  return (
    <>
      {/* Toolbar - hidden when printing */}
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-base-300 border-b bg-base-100 px-4 py-3 shadow-sm print:hidden">
        <button
          type="button"
          className="btn btn-ghost btn-sm rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          戻る
        </button>
        <div className="flex items-center gap-3">
          <span className="text-base-content/50 text-sm">
            一括印刷プレビュー ({players.length}名)
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            印刷する
          </button>
        </div>
      </div>

      {/* Player sheets */}
      <div className="mx-auto mt-16 mb-8 print:mt-0 print:mb-0">
        {players.map((playerData, index) => (
          <div
            key={playerData.player.id}
            className={`mx-auto box-border min-h-[297mm] w-[210mm] bg-white p-6 shadow-lg print:p-0 print:shadow-none ${
              index < players.length - 1
                ? "mb-8 print:mb-0 print:break-after-page"
                : ""
            }`}
          >
            {/* Header */}
            <div className="mb-2 flex items-baseline justify-between border-gray-400 border-b pb-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-gray-500">ゼッケンNo：</span>
                <span className="font-bold text-sm">
                  {playerData.player.bibNumber ?? "-"}
                </span>
              </div>
              <span className="text-[10px] text-gray-500">
                {competitionName}
              </span>
            </div>

            {/* Player info + totals */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <ruby className="font-bold text-base">
                  {playerData.player.name}
                  {playerData.player.furigana && (
                    <rt className="font-normal text-[8px] text-gray-400">
                      {playerData.player.furigana}
                    </rt>
                  )}
                </ruby>
              </div>
              <div className="flex items-center gap-3 text-[9px]">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">試行回数</span>
                  <span className="font-bold tabular-nums">
                    {playerData.totalChallengeCount}
                  </span>
                </div>
                <div className="flex items-center gap-1 border border-gray-800 px-2 py-0.5 font-bold">
                  <span>総得点</span>
                  <span className="text-sm tabular-nums">
                    {playerData.totalPoint}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Tables */}
            {playerData.courses.map((course) => (
              <PrintCourseTable key={course.id} course={course} />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
