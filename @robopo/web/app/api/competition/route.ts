import { deleteById } from "@/app/api/delete"
import { normalizeMaskMinutesBefore } from "@/lib/competition"
import { db } from "@/lib/db/db"
import { createCompetition } from "@/lib/db/queries/insert"
import { competitionCourse } from "@/lib/db/schema"
import { getCompetitionWithCourseList } from "@/server/db"

export async function POST(req: Request) {
  const {
    name,
    description,
    startDate,
    endDate,
    courseIds,
    maskEnabled,
    maskMinutesBefore,
  } = await req.json()

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return Response.json(
      {
        success: false,
        message: "開催日時は終了日時より前でなければなりません。",
      },
      { status: 400 },
    )
  }

  const competitionData = {
    name: name,
    description: description || null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    maskEnabled: !!maskEnabled,
    maskMinutesBefore: normalizeMaskMinutesBefore(maskMinutesBefore),
  }
  try {
    const result = await createCompetition(competitionData)
    const newCompetitionId = result[0].id

    // Insert course links if provided
    if (Array.isArray(courseIds) && courseIds.length > 0) {
      await db.insert(competitionCourse).values(
        courseIds.map((courseId: number) => ({
          competitionId: newCompetitionId,
          courseId,
        })),
      )
    }

    const newList = await getCompetitionWithCourseList()
    return Response.json(
      { success: true, data: result, newList },
      { status: 200 },
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the competition.",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  return await deleteById(req, "competition", async () => ({
    newList: await getCompetitionWithCourseList(),
  }))
}
