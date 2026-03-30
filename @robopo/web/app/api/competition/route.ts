import { deleteById } from "@/app/api/delete"
import { getCompetitionList } from "@/app/components/server/db"
import { createCompetition } from "@/app/lib/db/queries/insert"

export async function POST(req: Request) {
  const { name } = await req.json()
  const competitionData = {
    name: name,
    step: 0,
  }
  try {
    const result = await createCompetition(competitionData)
    return Response.json({ success: true, data: result }, { status: 200 })
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
