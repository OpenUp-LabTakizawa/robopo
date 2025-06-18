import { getUserByName } from "@/app/lib/db/queries/queries"

export async function POST(req: Request) {
  const { name } = await req.json()

  try {
    const result = await getUserByName(name)
    return Response.json({ user: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while retrieving the user.",
        error: error,
      },
      { status: 500 },
    )
  }
}
