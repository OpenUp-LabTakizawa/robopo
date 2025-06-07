import { db } from "@/app/lib/db/db"
import { insertUmpireCourse } from "@/app/lib/db/queries/insert"
import { type SelectUmpireCourse, umpireCourse } from "@/app/lib/db/schema"
import { type NextRequest, NextResponse } from "next/server"

export const revalidate = 0

// 割り当てられた大会・コース・採点者一覧を取得(予定)
export async function GET() {
  const assigns: SelectUmpireCourse[] = await db.select().from(umpireCourse)
  return Response.json({ assigns })
}

export async function POST(req: NextRequest) {
  const reqbody = await req.json()
  const { competitionId, courseId, umpireId } = reqbody
  const data = {
    competitionId: competitionId,
    courseId: courseId,
    umpireId: umpireId,
  }
  try {
    const result = await insertUmpireCourse(data)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the course.",
        error: error,
      },
      { status: 500 },
    )
  }
}
