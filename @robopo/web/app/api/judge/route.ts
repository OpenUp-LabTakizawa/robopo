import { deleteById } from "@/app/api/delete"
import { sanitizeCompetitionIds } from "@/app/api/validate"
import { db } from "@/app/lib/db/db"
import { createJudge } from "@/app/lib/db/queries/insert"
import { getJudgeByName } from "@/app/lib/db/queries/queries"
import { competitionJudge } from "@/app/lib/db/schema"

export async function POST(req: Request) {
  const { name, note, competitionIds } = await req.json()

  if (!name?.trim()) {
    return Response.json(
      { success: false, message: "名前は必須です。" },
      { status: 400 },
    )
  }

  const existing = await getJudgeByName(name.trim())
  if (existing) {
    return Response.json(
      { success: false, message: "同じ名前の採点者が既に登録されています。" },
      { status: 400 },
    )
  }

  try {
    const result = await createJudge({
      name: name.trim(),
      note: note || null,
    })

    // Insert competition links if provided
    const sanitizedIds = sanitizeCompetitionIds(competitionIds)
    if (sanitizedIds && sanitizedIds.length > 0 && result[0]?.id) {
      await db.insert(competitionJudge).values(
        sanitizedIds.map((compId) => ({
          competitionId: compId,
          judgeId: result[0].id,
        })),
      )
    }

    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "採点者の登録中にエラーが発生しました。",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  return await deleteById(req, "judge")
}
