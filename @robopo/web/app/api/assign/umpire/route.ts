import { assignById, unassignById } from "@/app/api/assign/assign"
import { db } from "@/app/lib/db/db"
import {
  competitionUmpire,
  type SelectCompetitionUmpire,
} from "@/app/lib/db/schema"

export const revalidate = 0

// 割り当てられた大会・選手一覧を取得
export async function GET() {
  const assigns: SelectCompetitionUmpire[] = await db
    .select()
    .from(competitionUmpire)
  return Response.json({ assigns })
}

export async function POST(req: Request) {
  return await assignById(req, "umpire")
}

export async function DELETE(req: Request) {
  return await unassignById(req, "umpire")
}
