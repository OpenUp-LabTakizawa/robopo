import { getCompetitionList } from "@/app/components/server/db"
import { db } from "@/app/lib/db/db"
import { createCompetition } from "@/app/lib/db/queries/insert"
import { deleteCompetitionById } from "@/app/lib/db/queries/queries"
import { type SelectCompetition, competition } from "@/app/lib/db/schema"

export const revalidate = 0

export async function GET() {
  const competitions: SelectCompetition[] = await db.select().from(competition)
  return Response.json({ competitions })
}

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
        message: "An error occurred while creating the course.",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  try {
    const result = await deleteCompetitionById(id)
    const newList = await getCompetitionList()
    return Response.json(
      { success: true, data: result, newList: newList },
      { status: 200 },
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while deleting the course.",
        error: error,
      },
      { status: 500 },
    )
  }
}
