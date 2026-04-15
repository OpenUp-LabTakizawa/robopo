"use client"

import { Pencil, Printer, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BackButton } from "@/components/parts/buttons"
import { CourseDetailTable } from "@/components/summary/courseDetailTable"
import type { MissionValue, PointState } from "@/lib/course/types"

type CourseData = {
  id: number
  name: string
  missionPair: MissionValue[][]
  point: PointState
  resultArray: {
    id: number
    firstResult: number
    retryResult: number | null
    detail: string | null
  }[]
  firstCount: number | null
  maxResult: number | null
  maxPt: number | null
  challengeCount: number
}

type PlayerScoreSheetProps = {
  player: { name: string; furigana: string | null; bibNumber: string | null }
  competitionId: number
  competitionName: string
  selectedCourseId: number
  playerId: number
  courses: CourseData[]
  totalPoint: number
  totalChallengeCount: number
}

export function PlayerScoreSheet({
  player,
  competitionId,
  competitionName,
  selectedCourseId,
  playerId,
  courses,
  totalPoint,
  totalChallengeCount,
}: PlayerScoreSheetProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const otherCourses = courses.filter((c) => c.id !== selectedCourseId)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:px-0 print:py-0">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <BackButton onClick={() => router.back()} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-xl transition-all duration-200 ${
              isEditing
                ? "btn-error"
                : "btn-ghost text-base-content/60 hover:text-base-content"
            }`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="size-4" />
                編集終了
              </>
            ) : (
              <>
                <Pencil className="size-4" />
                編集
              </>
            )}
          </button>
          <Link
            href={`/summary/print/${competitionId}/${selectedCourseId}/${playerId}`}
            className="btn btn-primary btn-sm rounded-xl"
          >
            <Printer className="size-4" />
            PDF出力
          </Link>
        </div>
      </div>

      {/* Header Card */}
      <div className="card mb-6 border border-base-300 bg-base-100 shadow-sm print:mb-4 print:border print:shadow-none">
        <div className="card-body p-4 sm:p-5">
          {/* Row 1: Title + Competition name */}
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl tracking-tight sm:text-2xl">
              個人成績シート
            </h1>
            <span className="text-base-content/50 text-xs sm:text-sm">
              {competitionName}
            </span>
          </div>
          {/* Row 2: Player info + Stats — single row on all sizes */}
          <div className="mt-2 flex items-center justify-between gap-2">
            {/* Player identity — compact on mobile */}
            <div className="flex items-baseline gap-1.5 overflow-hidden sm:gap-3">
              <span className="shrink-0 rounded bg-base-200 px-1.5 py-0.5 font-mono text-xs tabular-nums">
                {player.bibNumber ?? "-"}
              </span>
              <ruby className="truncate font-bold text-base text-primary sm:text-lg">
                {player.name}
                {player.furigana && (
                  <rt className="font-normal text-[9px] text-base-content/50">
                    {player.furigana}
                  </rt>
                )}
              </ruby>
            </div>
            {/* Stats badges — always visible */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex flex-col items-center rounded-lg bg-base-200 px-2.5 py-1 sm:flex-row sm:gap-2 sm:px-3 sm:py-1.5">
                <span className="text-[10px] text-base-content/60 sm:text-xs">
                  試行
                </span>
                <span className="font-bold font-mono text-sm tabular-nums">
                  {totalChallengeCount}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-primary/10 px-2.5 py-1 sm:flex-row sm:gap-2 sm:px-3 sm:py-1.5">
                <span className="font-medium text-[10px] sm:text-xs">
                  総得点
                </span>
                <span className="font-black font-mono text-lg text-primary tabular-nums sm:text-xl">
                  {totalPoint}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Course Detail */}
      {selectedCourse && (
        <CourseSection
          course={selectedCourse}
          isEditing={isEditing}
          onDataChange={() => router.refresh()}
        />
      )}

      {/* Other Courses */}
      {otherCourses.map((course) => (
        <CourseSection
          key={course.id}
          course={course}
          isEditing={isEditing}
          onDataChange={() => router.refresh()}
        />
      ))}
    </div>
  )
}

function CourseSection({
  course,
  isEditing,
  onDataChange,
}: {
  course: CourseData
  isEditing: boolean
  onDataChange: () => void
}) {
  return (
    <div className="mb-6 print:mb-4 print:break-inside-avoid">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between border-primary border-l-4 pl-3">
        <h2 className="font-bold text-lg">{course.name}</h2>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-1.5">
          <span className="font-medium text-sm">最高得点</span>
          <span className="font-black font-mono text-primary tabular-nums">
            {course.maxPt !== null ? course.maxPt : "-"}
          </span>
        </div>
      </div>

      <CourseDetailTable
        courseId={course.id}
        missionPair={course.missionPair}
        point={course.point}
        resultArray={course.resultArray}
        isEditing={isEditing}
        onDataChange={onDataChange}
      />
    </div>
  )
}
