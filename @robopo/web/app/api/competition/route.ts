import { deleteById } from "@/app/api/delete"
import { getCompetitionList } from "@/app/components/server/db"
import { createCompetition } from "@/app/lib/db/queries/insert"

export async function POST(req: Request) {
  const { name, description, startDate, endDate } = await req.json()

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
    const newList = await getCompetitionList()
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
    newList: await getCompetitionList(),
  }))
}
