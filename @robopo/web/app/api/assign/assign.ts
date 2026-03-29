import { and, eq } from "drizzle-orm"
import { db } from "@/app/lib/db/db"
import {
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
} from "@/app/lib/db/schema"

// Assign items to a competition by their IDs if not already assigned
export async function assignById(req: Request, mode: string) {
  // mode is one of "player", "course", "umpire"
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
        // If not assigned, add assignment
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

// Unassign items from a competition by their IDs
export async function unassignById(req: Request, mode: string) {
  // mode is one of "player", "course", "umpire"
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
        // If assigned, remove assignment
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
