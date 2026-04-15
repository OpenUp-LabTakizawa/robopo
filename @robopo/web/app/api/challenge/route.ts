import { createChallenge } from "@/lib/db/queries/insert"
import { deleteChallengeById } from "@/lib/db/queries/queries"
import { updateChallenge } from "@/lib/db/queries/update"

export async function POST(req: Request) {
  const {
    firstResult,
    retryResult,
    competitionId,
    courseId,
    playerId,
    judgeId,
    detail,
  } = await req.json()
  const challengeData = {
    firstResult: firstResult,
    retryResult: retryResult,
    detail: detail ?? null,
    competitionId: competitionId,
    courseId: courseId,
    playerId: playerId,
    judgeId: judgeId,
  }
  try {
    const result = await createChallenge(challengeData)
    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    console.error("Error creating challenge:", error)
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the challenge.",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id } = body
  if (!id) {
    return Response.json(
      { success: false, message: "Challenge ID is required." },
      { status: 400 },
    )
  }
  // Only include fields that are explicitly present in the request body
  const data: Partial<{
    firstResult: number
    retryResult: number | null
    detail: string | null
  }> = {}
  if (Object.hasOwn(body, "firstResult")) {
    data.firstResult = body.firstResult
  }
  if (Object.hasOwn(body, "retryResult")) {
    data.retryResult = body.retryResult
  }
  if (Object.hasOwn(body, "detail")) {
    data.detail = body.detail
  }

  try {
    await updateChallenge(id, data)
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error updating challenge:", error)
    return Response.json(
      {
        success: false,
        message: "An error occurred while updating the challenge.",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) {
    return Response.json(
      { success: false, message: "Challenge ID is required." },
      { status: 400 },
    )
  }
  try {
    await deleteChallengeById(id)
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting challenge:", error)
    return Response.json(
      {
        success: false,
        message: "An error occurred while deleting the challenge.",
      },
      { status: 500 },
    )
  }
}
