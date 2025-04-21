import { NextRequest, NextResponse } from "next/server"
import { createCourse } from "@/app/lib/db/queries/insert"
import { getCourseById } from "@/app/lib/db/queries/queries"
import { deleteById } from "@/app/api/delete"

export const revalidate = 0

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const rawId = searchParams.get("id")
  const id = rawId ? parseInt(rawId) : 0

  if (id !== 0) {
    const course = await getCourseById(id)
    return NextResponse.json({ getCourse: course })
  } else {
    return NextResponse.json({ getCourse: null })
  }
}

export async function POST(req: NextRequest) {
  const reqbody = await req.json()
  const { name, field, fieldvalid, mission, missionvalid, point } = reqbody
  const courseData = {
    name: name,
    field: field,
    fieldValid: fieldvalid,
    mission: mission,
    missionValid: missionvalid,
    point: point,
  }
  try {
    const result = await createCourse(courseData)
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
  const result = await deleteById(req, "course")
  return result
}
