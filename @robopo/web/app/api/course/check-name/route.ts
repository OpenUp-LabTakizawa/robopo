import type { NextRequest } from "next/server"
import { getCourseByName } from "@/app/lib/db/queries/queries"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const name = searchParams.get("name")
  const excludeId = searchParams.get("excludeId")

  if (!name || name.trim() === "") {
    return Response.json({ exists: false })
  }

  const existing = await getCourseByName(
    name.trim(),
    excludeId ? Number.parseInt(excludeId, 10) : undefined,
  )

  return Response.json({ exists: existing !== null })
}
