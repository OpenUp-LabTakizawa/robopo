import { assignById, unassignById } from "@/app/api/assign/assign"
import { db } from "@/app/lib/db/db"
import {
  competitionJudge,
  type SelectCompetitionJudge,
} from "@/app/lib/db/schema"

export const revalidate = 0

// Get assigned competition and judge list
export async function GET() {
  const assigns: SelectCompetitionJudge[] = await db
    .select()
    .from(competitionJudge)
  return Response.json({ assigns })
}

export async function POST(req: Request) {
  return await assignById(req, "judge")
}

export async function DELETE(req: Request) {
  return await unassignById(req, "judge")
}
