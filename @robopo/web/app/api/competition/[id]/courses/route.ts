import { NextResponse } from "next/server"
import { getCompetitionCourseList } from "@/app/components/server/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const competitionId = Number(id)
  if (Number.isNaN(competitionId)) {
    return NextResponse.json([], { status: 400 })
  }
  const { competitionCourses } = await getCompetitionCourseList(competitionId)
  return NextResponse.json(competitionCourses)
}
