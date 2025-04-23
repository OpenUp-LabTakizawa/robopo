import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db/db"
import { competition, SelectCompetition } from "@/app/lib/db/schema"
import { createCompetition } from "@/app/lib/db/queries/insert"
import { deleteCompetitionById } from "@/app/lib/db/queries/queries"
import { getCompetitionList } from "@/app/components/common/utils"

export const revalidate = 0

export async function GET(request: NextRequest) {
  const competitions: SelectCompetition[] = await db.select().from(competition)
  return Response.json({ competitions })
}

export async function POST(req: NextRequest) {
  const reqbody = await req.json()
  const { name } = reqbody
  const competitionData = {
    name: name,
    step: 0,
  }
  try {
    const result = await createCompetition(competitionData)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    console.log("error: ", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the course.",
        error: error,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const reqbody = await req.json()
  const { id } = reqbody
  try {
    const result = await deleteCompetitionById(id)
    const newList = await getCompetitionList()
    return NextResponse.json({ success: true, data: result, newList: newList }, { status: 200 })
  } catch (error) {
    console.log("error: ", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the course.",
        error: error,
      },
      { status: 500 }
    )
  }
}
