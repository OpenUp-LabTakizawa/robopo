import bcrypt from "bcryptjs"
import type { User } from "next-auth"
import { z } from "zod"

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

export async function passwordMatch(
  name: string,
  password: string,
): Promise<User | null> {
  const { getUserByName } = await import("@/app/lib/db/queries/queries")
  const result = await getUserByName(name)
  const passwordMatch = await bcrypt.compare(password, result.password)
  if (passwordMatch) {
    return {
      id: result.id.toString(),
      name: result.name,
      email: null,
      image: null,
    } as User
  }
  return null
}

export async function fetchUser(
  credentials: Partial<Record<"username" | "password", unknown>>,
): Promise<User | null> {
  const { username, password } = parsedCredentials(credentials)
  try {
    const user = await passwordMatch(username, password)
    if (user) {
      return user
    }
  } catch (error) {
    console.error("[fetchUser] ", error)
  }
  return null
}
