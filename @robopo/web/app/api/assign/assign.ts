import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db/db"
import {
  competitionCourse,
  competitionJudge,
  competitionPlayer,
} from "@/lib/db/schema"

const tableMap = {
  player: {
    table: competitionPlayer,
    idCol: competitionPlayer.playerId,
    compCol: competitionPlayer.competitionId,
    idKey: "playerId" as const,
  },
  course: {
    table: competitionCourse,
    idCol: competitionCourse.courseId,
    compCol: competitionCourse.competitionId,
    idKey: "courseId" as const,
  },
  judge: {
    table: competitionJudge,
    idCol: competitionJudge.judgeId,
    compCol: competitionJudge.competitionId,
    idKey: "judgeId" as const,
  },
} as const

export type AssignMode = keyof typeof tableMap

function isValidMode(mode: string): mode is AssignMode {
  return mode in tableMap
}

// Assign items to a competition by their IDs if not already assigned
export async function assignById(req: Request, mode: AssignMode) {
  try {
    if (!isValidMode(mode)) {
      return Response.json({ error: "Invalid mode" }, { status: 400 })
    }

    const { ids, competitionId } = await req.json()
    if (!(competitionId && Array.isArray(ids))) {
      return Response.json({ error: "Invalid input" }, { status: 400 })
    }

    const { table, idCol, compCol, idKey } = tableMap[mode]

    for (const id of ids) {
      const existing = await db
        .select()
        .from(table)
        .where(and(eq(compCol, competitionId), eq(idCol, id)))

      if (existing.length === 0) {
        await db.insert(table).values({ competitionId, [idKey]: id })
      }
    }
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while assigning.",
        error,
      },
      { status: 500 },
    )
  }
}

// Unassign items from a competition by their IDs
export async function unassignById(req: Request, mode: AssignMode) {
  try {
    if (!isValidMode(mode)) {
      return Response.json({ error: "Invalid mode" }, { status: 400 })
    }

    const { ids, competitionId } = await req.json()
    if (!(competitionId && Array.isArray(ids))) {
      return Response.json({ error: "Invalid input" }, { status: 400 })
    }

    const { table, idCol, compCol } = tableMap[mode]

    for (const id of ids) {
      const existing = await db
        .select()
        .from(table)
        .where(and(eq(compCol, competitionId), eq(idCol, id)))

      if (existing.length > 0) {
        await db
          .delete(table)
          .where(and(eq(compCol, competitionId), eq(idCol, id)))
      }
    }
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while unassigning.",
        error,
      },
      { status: 500 },
    )
  }
}
