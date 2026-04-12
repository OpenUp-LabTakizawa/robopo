import type { NextRequest } from "next/server"
import {
  checkValidity,
  deserializeField,
  deserializeMission,
  isGoal,
  isStart,
} from "@/app/components/course/utils"
import { createCourse } from "@/app/lib/db/queries/insert"
import {
  deleteCourseById,
  getCourseById,
  getCourseByName,
  getLinkedCourseIds,
} from "@/app/lib/db/queries/queries"
import { updateCourse } from "@/app/lib/db/queries/update"

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
  const { name, description, field, mission, point, courseOutRule } =
    await req.json()
  const normalizedDescription =
    typeof description === "string" ? description.trim() || null : null
  const searchParams = req.nextUrl.searchParams
  const rawId = searchParams.get("id")
  const id = rawId ? Number.parseInt(rawId, 10) : null

  // Check for duplicate course name
  const existingCourse = await getCourseByName(name, id ?? undefined)
  if (existingCourse) {
    return Response.json(
      { success: false, message: "このコース名は既に使用されています" },
      { status: 409 },
    )
  }

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
    description: normalizedDescription,
    field: field,
    fieldValid: computedFieldValid,
    mission: mission,
    missionValid: computedMissionValid,
    point: point,
    courseOutRule: courseOutRule || "keep",
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

export async function PATCH(req: NextRequest) {
  const { name, description } = await req.json()
  const searchParams = req.nextUrl.searchParams
  const rawId = searchParams.get("id")
  const id = rawId ? Number.parseInt(rawId, 10) : null

  if (!id) {
    return Response.json(
      { success: false, message: "IDが指定されていません" },
      { status: 400 },
    )
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json(
      { success: false, message: "コース名は必須です" },
      { status: 400 },
    )
  }

  const existingCourse = await getCourseByName(name.trim(), id)
  if (existingCourse) {
    return Response.json(
      { success: false, message: "このコース名は既に使用されています" },
      { status: 409 },
    )
  }

  const normalizedDescription =
    typeof description === "string" ? description.trim() || null : null

  try {
    await updateCourse(id, {
      name: name.trim(),
      description: normalizedDescription,
    })
    return Response.json({ success: true }, { status: 200 })
  } catch {
    return Response.json(
      {
        success: false,
        message: "コースの更新中にエラーが発生しました。",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  const ids: number[] = Array.isArray(id) ? id : [id]

  // Check if any course is linked to competitions (single query)
  const linkedIds = await getLinkedCourseIds(ids)
  if (linkedIds.length > 0) {
    return Response.json(
      {
        success: false,
        message:
          "使用大会が0でないコースは削除できません。先に紐付けを解除してください。",
      },
      { status: 400 },
    )
  }

  try {
    await Promise.all(ids.map((cid) => deleteCourseById(cid)))
    return Response.json(
      { success: true, message: "コースを削除しました。" },
      { status: 200 },
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "コースの削除中にエラーが発生しました。",
        error,
      },
      { status: 500 },
    )
  }
}
