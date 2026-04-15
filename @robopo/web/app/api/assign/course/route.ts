import { eq } from "drizzle-orm"
import { assignById, unassignById } from "@/app/api/assign/assign"
import { db } from "@/lib/db/db"
import {
  getCourseWithCompetition,
  groupByCourse,
} from "@/lib/db/queries/queries"
import {
  competitionCourse,
  type SelectCompetitionCourse,
} from "@/lib/db/schema"

// Get assigned competition and course list
export async function GET() {
  const assigns: SelectCompetitionCourse[] = await db
    .select()
    .from(competitionCourse)
  return Response.json({ assigns })
}

export async function POST(req: Request) {
  return await assignById(req, "course")
}

export async function DELETE(req: Request) {
  return await unassignById(req, "course")
}

// Bulk update: replace all competition links for a single course
export async function PUT(req: Request) {
  try {
    const { courseId, competitionIds } = await req.json()
    if (typeof courseId !== "number") {
      return Response.json({ error: "Invalid courseId" }, { status: 400 })
    }

    // Remove all existing links for this course
    await db
      .delete(competitionCourse)
      .where(eq(competitionCourse.courseId, courseId))

    // Insert new links
    if (Array.isArray(competitionIds) && competitionIds.length > 0) {
      await db.insert(competitionCourse).values(
        competitionIds.map((compId: number) => ({
          competitionId: compId,
          courseId,
        })),
      )
    }

    // Return updated course list
    const newList = groupByCourse(await getCourseWithCompetition())
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "紐付けの更新中にエラーが発生しました。",
        error,
      },
      { status: 500 },
    )
  }
}
