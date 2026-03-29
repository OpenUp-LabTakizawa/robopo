import { assignById, unassignById } from "@/app/api/assign/assign"
import { db } from "@/app/lib/db/db"
import {
  competitionCourse,
  type SelectCompetitionCourse,
} from "@/app/lib/db/schema"

export const revalidate = 0

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
