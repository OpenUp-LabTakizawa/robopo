import { deleteById } from "@/app/api/delete"
import { sanitizeCompetitionIds } from "@/app/api/validate"
import { db } from "@/app/lib/db/db"
import { createPlayer } from "@/app/lib/db/queries/insert"
import { getPlayerByName } from "@/app/lib/db/queries/queries"
import { competitionPlayer } from "@/app/lib/db/schema"

export async function POST(req: Request) {
  const { name, furigana, bibNumber, qr, note, competitionIds } =
    await req.json()

  if (!name?.trim()) {
    return Response.json(
      { success: false, message: "名前は必須です。" },
      { status: 400 },
    )
  }

  const existing = await getPlayerByName(name.trim())
  if (existing) {
    return Response.json(
      { success: false, message: "同じ名前の選手が既に登録されています。" },
      { status: 400 },
    )
  }

  try {
    const result = await createPlayer({
      name: name.trim(),
      furigana: furigana || null,
      bibNumber: bibNumber || null,
      qr: qr || null,
      note: note || null,
    })

    // Insert competition links if provided
    const sanitizedIds = sanitizeCompetitionIds(competitionIds)
    if (sanitizedIds && sanitizedIds.length > 0 && result[0]?.id) {
      await db.insert(competitionPlayer).values(
        sanitizedIds.map((compId) => ({
          competitionId: compId,
          playerId: result[0].id,
        })),
      )
    }

    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "選手の登録中にエラーが発生しました。",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  return await deleteById(req, "player")
}
