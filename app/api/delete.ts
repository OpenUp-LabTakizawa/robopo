import { NextRequest, NextResponse } from "next/server"
import { deletePlayerById, deleteUmpireById, deleteCourseById } from "@/app/lib/db/queries/queries"

export async function deleteById(req: NextRequest, mode: string) {
  // modeは"player"か"umpire"か"course"のいずれか
  const reqbody = await req.json()
  const { id } = reqbody
  try {
    if (Array.isArray(id)) {
      // idが配列の場合、全てのidを削除
      const deletePromises = id.map(async (cid) => {
        if (mode === "player") {
          const result = await deletePlayerById(cid)
          return result
        } else if (mode === "umpire") {
          const result = await deleteUmpireById(cid)
          return result
        } else if (mode === "course") {
          const result = await deleteCourseById(cid)
          return result
        }
      })
      await Promise.all(deletePromises)
      return NextResponse.json({ success: true, message: mode + " deleted successfully." }, { status: 200 })
    } else {
      if (mode === "player") {
        const result = await deletePlayerById(id)
        return NextResponse.json({ success: true, data: result }, { status: 200 })
      } else if (mode === "umpire") {
        const result = await deleteUmpireById(id)
        return NextResponse.json({ success: true, data: result }, { status: 200 })
      } else if (mode === "course") {
        const result = await deleteCourseById(id)
        return NextResponse.json({ success: true, data: result }, { status: 200 })
      }
    }
  } catch (error) {
    console.log("error: ", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the player.",
        error: error,
      },
      { status: 500 }
    )
  }
}
