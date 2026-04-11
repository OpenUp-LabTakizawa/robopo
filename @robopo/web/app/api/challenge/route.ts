import { createChallenge } from "@/app/lib/db/queries/insert"

export const revalidate = 0

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

// challengeの削除は関数はformactionでやる。queries.tsから呼ぶ。deleteChallengeByIdをAPI介さずserver actionでやる。
// export async function DELETE(req: NextRequest) {
//     const reqbody = await req.json()
//     const { id } = reqbody
//     try {
//       const result = await deletePlayerById(id)
//       return NextResponse.json({ success: true, data: result }, { status: 200 })
//     } catch (error) {
//       console.log("error: ", error)
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An error occurred while creating the course.",
//           error: error,
//         },
//         { status: 500 }
//       )
//     }
//   }
