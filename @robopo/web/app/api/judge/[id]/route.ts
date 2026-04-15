import { hashPassword } from "better-auth/crypto"
import { and, eq } from "drizzle-orm"
import { sanitizeCompetitionIds } from "@/app/api/validate"
import { db } from "@/lib/db/db"
import { getJudgeWithCompetition, groupByJudge } from "@/lib/db/queries/queries"
import { account, competitionJudge, judge } from "@/lib/db/schema"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const judgeId = Number(id)
  if (Number.isNaN(judgeId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 })
  }

  const { note, competitionIds, password } = await req.json()

  // Validate password up front before any updates
  if (password && password.length > 0 && password.length < 8) {
    return Response.json(
      {
        success: false,
        message: "パスワードは8文字以上で入力してください。",
      },
      { status: 400 },
    )
  }

  try {
    // Update judge record (only note)
    await db
      .update(judge)
      .set({ note: note || null })
      .where(eq(judge.id, judgeId))

    // Update password if provided
    if (password && password.length >= 8) {
      const judgeRecord = await db
        .select({ userId: judge.userId })
        .from(judge)
        .where(eq(judge.id, judgeId))
        .limit(1)

      const userId = judgeRecord[0]?.userId
      if (userId) {
        const hashed = await hashPassword(password)
        await db
          .update(account)
          .set({ password: hashed })
          .where(
            and(
              eq(account.userId, userId),
              eq(account.providerId, "credential"),
            ),
          )
      }
    }

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
        error: String(error),
      },
      { status: 500 },
    )
  }
}
