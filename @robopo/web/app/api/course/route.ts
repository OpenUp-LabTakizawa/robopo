import type { NextRequest } from "next/server"
import { deleteById } from "@/app/api/delete"
import {
  checkValidity,
  deserializeField,
  deserializeMission,
  isGoal,
  isStart,
} from "@/app/components/course/utils"
import { createCourse } from "@/app/lib/db/queries/insert"
import { getCourseById } from "@/app/lib/db/queries/queries"
import { updateCourse } from "@/app/lib/db/queries/update"

export const revalidate = 0

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const rawId = searchParams.get("id")
  const id = rawId ? Number.parseInt(rawId, 10) : 0

  if (id !== 0) {
    const course = await getCourseById(id)
    return Response.json({ getCourse: course })
  }
  return Response.json({ getCourse: null })
}

export async function POST(req: NextRequest) {
  const { name, field, mission, point } = await req.json()
  const searchParams = req.nextUrl.searchParams
  const rawId = searchParams.get("id")
  const id = rawId ? Number.parseInt(rawId, 10) : null

  const parsedField = field ? deserializeField(field) : null
  const parsedMission = mission ? deserializeMission(mission) : null
  const computedFieldValid = parsedField
    ? isStart(parsedField) && isGoal(parsedField)
    : false
  const computedMissionValid =
    parsedField && parsedMission
      ? checkValidity(parsedField, parsedMission)
      : false

  const courseData = {
    name: name,
    field: field,
    fieldValid: computedFieldValid,
    mission: mission,
    missionValid: computedMissionValid,
    point: point,
  }

  const method = id ? "update" : "create"
  const query = id ? updateCourse(id, courseData) : createCourse(courseData)
  try {
    const result = await query
    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: `An error occurred while ${method.slice(0, -1)}ing the course.`,
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  return await deleteById(req, "course")
}
