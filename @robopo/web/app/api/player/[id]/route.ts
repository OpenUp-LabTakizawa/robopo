import { eq } from "drizzle-orm"
import { sanitizeCompetitionIds } from "@/app/api/validate"
import { db } from "@/lib/db/db"
import {
  getPlayerByName,
  getPlayersWithCompetition,
  groupByPlayer,
} from "@/lib/db/queries/queries"
import { competitionPlayer, player } from "@/lib/db/schema"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const playerId = Number(id)
  if (Number.isNaN(playerId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 })
  }

  const { name, furigana, bibNumber, note, competitionIds } = await req.json()

  if (!name?.trim()) {
    return Response.json(
      { success: false, message: "名前は必須です。" },
      { status: 400 },
    )
  }

  const existing = await getPlayerByName(name.trim(), playerId)
  if (existing) {
    return Response.json(
      { success: false, message: "同じ名前の選手が既に登録されています。" },
      { status: 400 },
    )
  }

  try {
    await db
      .update(player)
      .set({
        name: name.trim(),
        furigana: furigana || null,
        bibNumber: bibNumber || null,
        note: note || null,
      })
      .where(eq(player.id, playerId))

    // Update competition links if provided
    const sanitizedIds = sanitizeCompetitionIds(competitionIds)
    if (sanitizedIds) {
      await db
        .delete(competitionPlayer)
        .where(eq(competitionPlayer.playerId, playerId))

      if (sanitizedIds.length > 0) {
        await db.insert(competitionPlayer).values(
          sanitizedIds.map((compId) => ({
            competitionId: compId,
            playerId,
          })),
        )
      }
    }

    const newList = groupByPlayer(await getPlayersWithCompetition())
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "選手の更新中にエラーが発生しました。",
        error,
      },
      { status: 500 },
    )
  }
}
