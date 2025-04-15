import { competitionUmpire, SelectCompetitionUmpire } from "@/app/lib/db/schema"
import { db } from "@/app/lib/db/db"
import { NextRequest } from "next/server"
import { assignById, unassignById } from "@/app/api/assign/assign"

export const revalidate = 0

// 割り当てられた大会・選手一覧を取得
export async function GET(request: NextRequest) {
  const assigns: SelectCompetitionUmpire[] = await db.select().from(competitionUmpire)
  return Response.json({ assigns })
}

export async function POST(req: NextRequest) {
  const result = await assignById(req, "umpire")
  return result
}

export async function DELETE(req: NextRequest) {
  const result = await unassignById(req, "umpire")
  return result
}
