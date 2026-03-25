import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function HeaderServer(): Promise<{
  session: { user: { id: string; name: string } } | null
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return { session: null }
  return {
    session: {
      user: {
        id: session.user.id,
        name: session.user.name,
      },
    },
  }
}
