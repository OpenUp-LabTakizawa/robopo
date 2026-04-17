import { eq } from "drizzle-orm"
import { normalizeMaskMinutesBefore } from "@/lib/competition"
import { db } from "@/lib/db/db"
import { updateCompetition } from "@/lib/db/queries/update"
import { competitionCourse } from "@/lib/db/schema"
import { getCompetitionWithCourseList } from "@/server/db"

function parseOptionalDate(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (!value) {
    return null
  }
  return new Date(value)
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params
  const body = await req.json()

  const parsedStart = parseOptionalDate(body.startDate)
  const parsedEnd = parseOptionalDate(body.endDate)

  if (
    parsedStart instanceof Date &&
    parsedEnd instanceof Date &&
    parsedStart > parsedEnd
  ) {
    return Response.json(
      {
        success: false,
        message: "開催日時は終了日時より前でなければなりません。",
      },
      { status: 400 },
    )
  }

  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) {
    updateData.name = body.name
  }
  if (body.description !== undefined) {
    updateData.description = body.description || null
  }
  if (parsedStart !== undefined) {
    updateData.startDate = parsedStart
  }
  if (parsedEnd !== undefined) {
    updateData.endDate = parsedEnd
  }
  if (body.maskEnabled !== undefined) {
    updateData.maskEnabled = !!body.maskEnabled
  }
  if (body.maskMinutesBefore !== undefined) {
    updateData.maskMinutesBefore = normalizeMaskMinutesBefore(
      body.maskMinutesBefore,
    )
  }

  try {
    await updateCompetition(Number(id), updateData)

    // Update course links if provided
    if (body.courseIds !== undefined) {
      const competitionId = Number(id)
      // Remove all existing links
      await db
        .delete(competitionCourse)
        .where(eq(competitionCourse.competitionId, competitionId))
      // Insert new links
      if (Array.isArray(body.courseIds) && body.courseIds.length > 0) {
        await db.insert(competitionCourse).values(
          body.courseIds.map((courseId: number) => ({
            competitionId,
            courseId,
          })),
        )
      }
    }

    const newList = await getCompetitionWithCourseList()
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while updating the competition.",
        error: error,
      },
      { status: 500 },
    )
  }
}
