import { getCompetitionList } from "@/app/components/server/db"
import { updateCompetition } from "@/app/lib/db/queries/update"

export const revalidate = 0

function parseOptionalDate(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (!value) {
    return null
  }
  return new Date(value)
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params
  const body = await req.json()

  const parsedStart = parseOptionalDate(body.startDate)
  const parsedEnd = parseOptionalDate(body.endDate)

  if (
    parsedStart instanceof Date &&
    parsedEnd instanceof Date &&
    parsedStart > parsedEnd
  ) {
    return Response.json(
      { success: false, message: "開催日は終了日より前でなければなりません。" },
      { status: 400 },
    )
  }

  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) {
    updateData.name = body.name
  }
  if (body.description !== undefined) {
    updateData.description = body.description || null
  }
  if (parsedStart !== undefined) {
    updateData.startDate = parsedStart
  }
  if (parsedEnd !== undefined) {
    updateData.endDate = parsedEnd
  }

  try {
    await updateCompetition(Number(id), updateData)
    const newList = await getCompetitionList()
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while updating the competition.",
        error: error,
      },
      { status: 500 },
    )
  }
}
