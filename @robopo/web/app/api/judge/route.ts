import { deleteById } from "@/app/api/delete"
import { createJudge } from "@/app/lib/db/queries/insert"

export async function POST(req: Request) {
  const { name } = await req.json()
  const judgeData = {
    name: name,
  }
  try {
    const result = await createJudge(judgeData)
    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the judge.",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  return await deleteById(req, "judge")
}
