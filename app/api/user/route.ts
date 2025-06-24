import bcrypt from "bcryptjs"
import type { User } from "next-auth"
import { getUserByName } from "@/app/lib/db/queries/queries"

export async function POST(req: Request) {
  const { name, password } = await req.json()

  try {
    const result = await getUserByName(name)
    const passwordMatch = await bcrypt.compare(password, result.password)
    if (passwordMatch) {
      const user: User = {
        id: result.id.toString(),
        name: result.name,
        email: null,
        image: null,
      }
      return Response.json({ user }, { status: 200 })
    }
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
  return Response.json({ user: null }, { status: 401 })
}
