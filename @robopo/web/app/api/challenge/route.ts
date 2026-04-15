import { createChallenge } from "@/lib/db/queries/insert"

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
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the challenge.",
        error: error,
      },
      { status: 500 },
    )
  }
}
