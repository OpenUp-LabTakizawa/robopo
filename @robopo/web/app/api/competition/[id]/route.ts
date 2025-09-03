import type { QueryResult } from "pg"
import { getCompetitionList } from "@/app/components/server/db"
import {
  closeCompetitionById,
  openCompetitionById,
  returnCompetitionById,
} from "@/app/lib/db/queries/queries"

export const revalidate = 0

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params
  const { type } = await req.json()
  let result: QueryResult

  switch (type) {
    case "open":
      result = await openCompetitionById(Number(id))
      break
    case "return":
      result = await returnCompetitionById(Number(id))
      break
    case "close":
      result = await closeCompetitionById(Number(id))
      break
    default:
      return Response.json(
        {
          success: false,
          message: "An error occurred while updating the course.",
          error: "Invalid type",
        },
        { status: 400 },
      )
  }
  const newList = await getCompetitionList()
  return Response.json(
    { success: true, data: result, newList: newList },
    { status: 200 },
  )
}
