import { NextResponse } from "next/server"
import { openCompetitionById, returnCompetitionById,closeCompetitionById } from "@/app/lib/db/queries/queries"
import { getCompetitionList } from "@/app/components/server/db"

export const revalidate = 0

export async function POST(req: Request, props: { params: Promise<{ id: number }> }) {
  const { id } = await props.params
  const { type } = await req.json()

  if (type === "open") {
    const result = await openCompetitionById(id)
    const newList = await getCompetitionList()
    return NextResponse.json({ success: true, data: result, newList: newList }, { status: 200 })
  } else if (type === "return") {
    const result = await returnCompetitionById(id)
    const newList = await getCompetitionList()
    return NextResponse.json({ success: true, data: result, newList: newList }, { status: 200 })
  } else if (type === "close") {
    const result = await closeCompetitionById(id)
    const newList = await getCompetitionList()
    return NextResponse.json({ success: true, data: result, newList: newList }, { status: 200 })
  }
}
