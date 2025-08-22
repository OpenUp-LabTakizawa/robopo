import type { Session } from "next-auth"
import { auth } from "@/auth"

export default async function HeaderServer(): Promise<{
  session: Session | null
}> {
  const session = await auth()
  return { session }
}
