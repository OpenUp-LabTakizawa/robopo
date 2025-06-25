import { passwordMatch } from "@/app/lib/auth/passwordMatch"

export async function POST(req: Request) {
  const { name, password } = await req.json()

  try {
    const user = await passwordMatch(name, password)
    return Response.json({ user }, { status: 200 })
  } catch (error) {
    console.error("[API]Error retrieving user", error)
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
