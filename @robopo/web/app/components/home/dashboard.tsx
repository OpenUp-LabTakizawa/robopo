"use client"

import {
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline"
import type React from "react"
import { ChallengeTab, ManageTab } from "@/app/components/home/tabs"
import type {
  SelectCompetition,
  SelectCompetitionCourse,
  SelectCompetitionJudge,
  SelectCourse,
  SelectJudgeWithUsername,
} from "@/app/lib/db/schema"

type DashboardProps = {
  competitionList: { competitions: SelectCompetition[] }
  courseList: { courses: SelectCourse[] }
  competitionCourseList: { competitionCourseList: SelectCompetitionCourse[] }
  judgeList: SelectJudgeWithUsername[]
  competitionJudgeList: { competitionJudgeList: SelectCompetitionJudge[] }
  loggedInJudgeId?: number
}

function DashboardCard({
  title,
  icon,
  children,
  variant = "default",
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  variant?: "primary" | "default"
}) {
  return (
    <div
      className={`rounded-box border bg-base-100 p-5 shadow-sm transition-shadow hover:shadow-md ${
        variant === "primary"
          ? "border-primary/20 ring-1 ring-primary/10"
          : "border-base-300"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            variant === "primary"
              ? "bg-primary/10 text-primary"
              : "bg-base-200 text-base-content/70"
          }`}
        >
          {icon}
        </div>
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export function Dashboard({
  competitionList,
  courseList,
  competitionCourseList,
  judgeList,
  competitionJudgeList,
  loggedInJudgeId,
}: DashboardProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Main scoring card - spans full width on mobile, left column on desktop */}
        <div className="md:col-span-2">
          <DashboardCard
            title="採点"
            icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />}
            variant="primary"
          >
            <ChallengeTab
              competitionList={competitionList}
              courseList={courseList}
              competitionCourseList={competitionCourseList}
              judgeList={judgeList}
              competitionJudgeList={competitionJudgeList}
              loggedInJudgeId={loggedInJudgeId}
            />
          </DashboardCard>
        </div>

        {/* Management card */}
        <div className="md:col-span-2">
          <DashboardCard
            title="大会管理"
            icon={<Cog6ToothIcon className="h-5 w-5" />}
          >
            <ManageTab />
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
