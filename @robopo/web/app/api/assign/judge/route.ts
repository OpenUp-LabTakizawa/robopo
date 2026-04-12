import { eq } from "drizzle-orm"
import { assignById, unassignById } from "@/app/api/assign/assign"
import { db } from "@/app/lib/db/db"
import {
  getJudgeWithCompetition,
  groupByJudge,
} from "@/app/lib/db/queries/queries"
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

// Bulk update: replace all competition links for a single judge
export async function PUT(req: Request) {
  try {
    const { judgeId, competitionIds } = await req.json()
    if (typeof judgeId !== "number") {
      return Response.json({ error: "Invalid judgeId" }, { status: 400 })
    }

    // Remove all existing links for this judge
    await db
      .delete(competitionJudge)
      .where(eq(competitionJudge.judgeId, judgeId))

    // Insert new links
    if (Array.isArray(competitionIds) && competitionIds.length > 0) {
      await db.insert(competitionJudge).values(
        competitionIds.map((compId: number) => ({
          competitionId: compId,
          judgeId,
        })),
      )
    }

    // Return updated judge list
    const newList = groupByJudge(await getJudgeWithCompetition())
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
