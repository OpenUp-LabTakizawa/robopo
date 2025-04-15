import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db/db"
import { competitionPlayer, competitionCourse, competitionUmpire } from "@/app/lib/db/schema"
import { eq, and } from "drizzle-orm"

// 各種idとcompetitionIdを与えてそのcompetitionIdに割り当ての無いものを割り当てていく関数
export async function assignById(req: NextRequest, mode: string) {
  // modeは"player", "course", "umpire"のどれか
  try {
    const reqbody = await req.json()
    const ids = reqbody.ids
    const competitionId = reqbody.competitionId
    if (!competitionId || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    for (const pid of ids) {
      const existing = await db
        .select()
        .from(mode === "player" ? competitionPlayer : mode === "course" ? competitionCourse : competitionUmpire)
        .where(
          and(
            eq(
              mode === "player"
                ? competitionPlayer.competitionId
                : mode === "course"
                ? competitionCourse.competitionId
                : competitionUmpire.competitionId,
              competitionId
            ),
            eq(
              mode === "player"
                ? competitionPlayer.playerId
                : mode === "course"
                ? competitionCourse.courseId
                : competitionUmpire.umpireId,
              pid
            )
          )
        )

      if (existing.length === 0) {
        // 割り当てが無い場合、割り当てを追加
        await db
          .insert(mode === "player" ? competitionPlayer : mode === "course" ? competitionCourse : competitionUmpire)
          .values({
            competitionId: competitionId,
            [mode === "player" ? "playerId" : mode === "course" ? "courseId" : "umpireId"]: pid,
          })
      }
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.log("error: ", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while assigning.",
        error: error,
      },
      { status: 500 }
    )
  }
}

// 各種idとcompetitionIdを与えてそのcompetitionIdに割り当てのあるものの割り当てを解除する関数
export async function unassignById(req: NextRequest, mode: string) {
  // modeは"player", "course", "umpire"のどれか
  try {
    const reqbody = await req.json()
    console.log("reqbody:", reqbody)
    const ids = reqbody.ids
    const competitionId = reqbody.competitionId
    if (!competitionId || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }
    for (const pid of ids) {
      const existing = await db
        .select()
        .from(mode === "player" ? competitionPlayer : mode === "course" ? competitionCourse : competitionUmpire)
        .where(
          and(
            eq(
              mode === "player"
                ? competitionPlayer.competitionId
                : mode === "course"
                ? competitionCourse.competitionId
                : competitionUmpire.competitionId,
              competitionId
            ),
            eq(
              mode === "player"
                ? competitionPlayer.playerId
                : mode === "course"
                ? competitionCourse.courseId
                : competitionUmpire.umpireId,
              pid
            )
          )
        )

      if (existing.length > 0) {
        // 割り当てがある場合、割り当てを解除
        await db
          .delete(mode === "player" ? competitionPlayer : mode === "course" ? competitionCourse : competitionUmpire)
          .where(
            and(
              eq(
                mode === "player"
                  ? competitionPlayer.competitionId
                  : mode === "course"
                  ? competitionCourse.competitionId
                  : competitionUmpire.competitionId,
                competitionId
              ),
              eq(
                mode === "player"
                  ? competitionPlayer.playerId
                  : mode === "course"
                  ? competitionCourse.courseId
                  : competitionUmpire.umpireId,
                pid
              )
            )
          )
      }
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.log("error: ", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while unassigning.",
        error: error,
      },
      { status: 500 }
    )
  }
}
