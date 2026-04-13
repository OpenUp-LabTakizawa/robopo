import { eq, inArray } from "drizzle-orm"
import { sanitizeCompetitionIds } from "@/app/api/validate"
import { db } from "@/app/lib/db/db"
import { createJudge } from "@/app/lib/db/queries/insert"
import { competitionJudge, judge, user } from "@/app/lib/db/schema"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const { note, competitionIds, username, password } = await req.json()

  if (!username?.trim()) {
    return Response.json(
      { success: false, message: "ユーザー名は必須です。" },
      { status: 400 },
    )
  }

  if (!/^[a-z0-9_]+$/.test(username.trim().toLowerCase())) {
    return Response.json(
      {
        success: false,
        message: "ユーザー名は英小文字・数字・アンダースコアのみ使用できます。",
      },
      { status: 400 },
    )
  }

  if (!password || password.length < 8) {
    return Response.json(
      { success: false, message: "パスワードは8文字以上で入力してください。" },
      { status: 400 },
    )
  }

  let createdUserId: string | null = null

  try {
    // Create Better Auth user for the judge
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: `${username.trim().toLowerCase()}@robopo.local`,
        password,
        name: username.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
      },
    })

    if (!signUpRes?.user?.id) {
      return Response.json(
        { success: false, message: "ユーザーアカウントの作成に失敗しました。" },
        { status: 500 },
      )
    }

    createdUserId = signUpRes.user.id

    const result = await createJudge({
      note: note || null,
      userId: signUpRes.user.id,
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
    // Clean up orphaned auth user if judge creation failed
    if (createdUserId) {
      await db
        .delete(user)
        .where(eq(user.id, createdUserId))
        .catch(() => {})
    }

    const message =
      error instanceof Error && error.message.includes("unique")
        ? "このユーザー名は既に使用されています。"
        : "採点者の登録中にエラーが発生しました。"
    return Response.json(
      { success: false, message, error: String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  if (!id || !Array.isArray(id) || id.length === 0) {
    return Response.json(
      { success: false, message: "削除対象が指定されていません。" },
      { status: 400 },
    )
  }

  try {
    // Find linked user IDs before deleting judges
    const judges = await db
      .select({ userId: judge.userId })
      .from(judge)
      .where(inArray(judge.id, id))

    const userIds = judges.map((j) => j.userId)

    // Delete judges (cascade handles competition_judge)
    await db.delete(judge).where(inArray(judge.id, id))

    // Delete linked Better Auth users (cascade handles session, account)
    if (userIds.length > 0) {
      await db.delete(user).where(inArray(user.id, userIds))
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "採点者の削除中にエラーが発生しました。",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
