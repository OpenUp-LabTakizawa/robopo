import { and, eq } from "drizzle-orm"
import { db } from "@/app/lib/db/db"
import {
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
} from "@/app/lib/db/schema"

// 各種idとcompetitionIdを与えてそのcompetitionIdに割り当ての無いものを割り当てていく関数
export async function assignById(req: Request, mode: string) {
  // modeは"player", "course", "umpire"のどれか
  try {
    const { ids, competitionId } = await req.json()
    if (!(competitionId && Array.isArray(ids))) {
      return Response.json({ error: "Invalid input" }, { status: 400 })
    }

    for (const pid of ids) {
      const existing = await db
        .select()
        .from(
          mode === "player"
            ? competitionPlayer
            : mode === "course"
              ? competitionCourse
              : competitionUmpire,
        )
        .where(
          and(
            eq(
              mode === "player"
                ? competitionPlayer.competitionId
                : mode === "course"
                  ? competitionCourse.competitionId
                  : competitionUmpire.competitionId,
              competitionId,
            ),
            eq(
              mode === "player"
                ? competitionPlayer.playerId
                : mode === "course"
                  ? competitionCourse.courseId
                  : competitionUmpire.umpireId,
              pid,
            ),
          ),
        )

      if (existing.length === 0) {
        // 割り当てが無い場合、割り当てを追加
        await db
          .insert(
            mode === "player"
              ? competitionPlayer
              : mode === "course"
                ? competitionCourse
                : competitionUmpire,
          )
          .values({
            competitionId: competitionId,
            [mode === "player"
              ? "playerId"
              : mode === "course"
                ? "courseId"
                : "umpireId"]: pid,
          })
      }
    }
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while assigning.",
        error: error,
      },
      { status: 500 },
    )
  }
}

// 各種idとcompetitionIdを与えてそのcompetitionIdに割り当てのあるものの割り当てを解除する関数
export async function unassignById(req: Request, mode: string) {
  // modeは"player", "course", "umpire"のどれか
  try {
    const { ids, competitionId } = await req.json()
    if (!(competitionId && Array.isArray(ids))) {
      return Response.json({ error: "Invalid input" }, { status: 400 })
    }
    for (const pid of ids) {
      const existing = await db
        .select()
        .from(
          mode === "player"
            ? competitionPlayer
            : mode === "course"
              ? competitionCourse
              : competitionUmpire,
        )
        .where(
          and(
            eq(
              mode === "player"
                ? competitionPlayer.competitionId
                : mode === "course"
                  ? competitionCourse.competitionId
                  : competitionUmpire.competitionId,
              competitionId,
            ),
            eq(
              mode === "player"
                ? competitionPlayer.playerId
                : mode === "course"
                  ? competitionCourse.courseId
                  : competitionUmpire.umpireId,
              pid,
            ),
          ),
        )

      if (existing.length > 0) {
        // 割り当てがある場合、割り当てを解除
        await db
          .delete(
            mode === "player"
              ? competitionPlayer
              : mode === "course"
                ? competitionCourse
                : competitionUmpire,
          )
          .where(
            and(
              eq(
                mode === "player"
                  ? competitionPlayer.competitionId
                  : mode === "course"
                    ? competitionCourse.competitionId
                    : competitionUmpire.competitionId,
                competitionId,
              ),
              eq(
                mode === "player"
                  ? competitionPlayer.playerId
                  : mode === "course"
                    ? competitionCourse.courseId
                    : competitionUmpire.umpireId,
                pid,
              ),
            ),
          )
      }
    }
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while unassigning.",
        error: error,
      },
      { status: 500 },
    )
  }
}
