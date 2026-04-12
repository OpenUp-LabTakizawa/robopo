import { eq } from "drizzle-orm"
import { sanitizeCompetitionIds } from "@/app/api/validate"
import { db } from "@/app/lib/db/db"
import {
  getJudgeByName,
  getJudgeWithCompetition,
  groupByJudge,
} from "@/app/lib/db/queries/queries"
import { competitionJudge, judge } from "@/app/lib/db/schema"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const judgeId = Number(id)
  if (Number.isNaN(judgeId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 })
  }

  const { name, note, competitionIds } = await req.json()

  if (!name?.trim()) {
    return Response.json(
      { success: false, message: "名前は必須です。" },
      { status: 400 },
    )
  }

  const existing = await getJudgeByName(name.trim(), judgeId)
  if (existing) {
    return Response.json(
      { success: false, message: "同じ名前の採点者が既に登録されています。" },
      { status: 400 },
    )
  }

  try {
    await db
      .update(judge)
      .set({
        name: name.trim(),
        note: note || null,
      })
      .where(eq(judge.id, judgeId))

    // Update competition links if provided
    const sanitizedIds = sanitizeCompetitionIds(competitionIds)
    if (sanitizedIds) {
      await db
        .delete(competitionJudge)
        .where(eq(competitionJudge.judgeId, judgeId))

      if (sanitizedIds.length > 0) {
        await db.insert(competitionJudge).values(
          sanitizedIds.map((compId) => ({
            competitionId: compId,
            judgeId,
          })),
        )
      }
    }

    const newList = groupByJudge(await getJudgeWithCompetition())
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "採点者の更新中にエラーが発生しました。",
        error,
      },
      { status: 500 },
    )
  }
}
