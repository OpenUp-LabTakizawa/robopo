import bcrypt from "bcryptjs"
import type { User } from "next-auth"
import { getUserByName } from "@/app/lib/db/queries/queries"

export async function passwordMatch(name: string, password: string) {
  console.log("[API]Start", { name, password: password ? "••••" : password })
  const result = await getUserByName(name)
  console.log("[API]DB result", result)
  const passwordMatch = await bcrypt.compare(password, result.password)
  console.log("[API]Password match result", passwordMatch)
  if (passwordMatch) {
    const user: User = {
      id: result.id.toString(),
      name: result.name,
      email: null,
      image: null,
    }
    return user
  }
  return null
}
