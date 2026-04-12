import { eq } from "drizzle-orm"
import { assignById, unassignById } from "@/app/api/assign/assign"
import { db } from "@/app/lib/db/db"
import {
  getPlayersWithCompetition,
  groupByPlayer,
} from "@/app/lib/db/queries/queries"
import {
  competitionPlayer,
  type SelectCompetitionPlayer,
} from "@/app/lib/db/schema"

// Get assigned competition and player list
export async function GET() {
  const assigns: SelectCompetitionPlayer[] = await db
    .select()
    .from(competitionPlayer)
  return Response.json({ assigns })
}

export async function POST(req: Request) {
  return await assignById(req, "player")
}

export async function DELETE(req: Request) {
  return await unassignById(req, "player")
}

// Bulk update: replace all competition links for a single player
export async function PUT(req: Request) {
  try {
    const { playerId, competitionIds } = await req.json()
    if (typeof playerId !== "number") {
      return Response.json({ error: "Invalid playerId" }, { status: 400 })
    }

    // Remove all existing links for this player
    await db
      .delete(competitionPlayer)
      .where(eq(competitionPlayer.playerId, playerId))

    // Insert new links
    if (Array.isArray(competitionIds) && competitionIds.length > 0) {
      await db.insert(competitionPlayer).values(
        competitionIds.map((compId: number) => ({
          competitionId: compId,
          playerId,
        })),
      )
    }

    // Return updated player list
    const newList = groupByPlayer(await getPlayersWithCompetition())
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
