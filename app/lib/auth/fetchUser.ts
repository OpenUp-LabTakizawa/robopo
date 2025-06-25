import type { User } from "next-auth"
import { z } from "zod"
import { BASE_URL } from "@/app/lib/const"

const credentialsSchema: z.ZodSchema<{ username: string; password: string }> =
  z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  })

export function parsedCredentials(input: unknown): {
  username: string
  password: string
} {
  const result = credentialsSchema.safeParse(input)
  if (!result.success) {
    throw new Error("Invalid credentials")
  }
  return result.data
}

export async function fetchUser(
  username: string,
  password: string,
): Promise<User | null> {
  try {
    console.log("vercel", process.env.VERCEL)
    if (process.env.VERCEL === "1") {
      const response = await fetch(`${BASE_URL}/api/user/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      })
      console.log("[fetchUser]DB response", response)
      if (response.ok) {
        const { user } = await response.json()
        if (user) {
          return user as User
        }
      }
    } else {
      console.log("[fetchUser]Local environment detected")
      const { passwordMatch } = await import("@/app/lib/auth/passwordMatch")
      const user = await passwordMatch(username, password)
      if (user) {
        return user
      }
    }
  } catch (error) {
    console.error("[fetchUser]Error", error)
  }
  return null
}
