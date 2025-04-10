import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/db/db"
import { umpire, SelectUmpire } from "@/app/lib/db/schema"
import { createUmpire } from "@/app/lib/db/queries/insert"
import { deleteById } from "@/app/api/delete"

export const revalidate = 0

export async function GET(request: NextRequest) {
  const umpires: SelectUmpire[] = await db.select().from(umpire)
  return Response.json({ umpires })
}

export async function POST(req: NextRequest) {
  const reqbody = await req.json()
  const { name } = reqbody
  const umpireData = {
    name: name,
  }
  try {
    const result = await createUmpire(umpireData)
    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    console.log("error: ", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the umpire.",
        error: error,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const result = await deleteById(req, "umpire")
  return result
}
