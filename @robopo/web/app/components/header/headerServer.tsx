import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/app/lib/db/db"
import { judge } from "@/app/lib/db/schema"
import { auth } from "@/lib/auth"

export type HeaderSession = {
  user: { id: string; name: string }
  isJudge: boolean
  judgeId: number | null
} | null

export default async function HeaderServer(): Promise<{
  session: HeaderSession
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    return { session: null }
  }

  // Check if the user is a judge
  const judgeRecord = await db
    .select({ id: judge.id })
    .from(judge)
    .where(eq(judge.userId, session.user.id))
    .limit(1)

  const isJudge = judgeRecord.length > 0
  const judgeId = isJudge ? judgeRecord[0].id : null

  return {
    session: {
      user: {
        id: session.user.id,
        name: session.user.name,
      },
      isJudge,
      judgeId,
    },
  }
}
