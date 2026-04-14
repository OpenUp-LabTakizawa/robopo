import { deleteById } from "@/app/api/delete"
import { db } from "@/app/lib/db/db"
import { createCompetition } from "@/app/lib/db/queries/insert"
import { competitionCourse } from "@/app/lib/db/schema"
import { getCompetitionWithCourseList } from "@/app/server/db"

export async function POST(req: Request) {
  const { name, description, startDate, endDate, courseIds } = await req.json()

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return Response.json(
      { success: false, message: "開催日は終了日より前でなければなりません。" },
      { status: 400 },
    )
  }

  const competitionData = {
    name: name,
    description: description || null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
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
