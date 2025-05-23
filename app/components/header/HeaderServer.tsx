import { auth } from "@/auth"
import type { Session } from "next-auth"

export default async function HeaderServer(): Promise<{ session: Session | null }> {
    const session = await auth()
    return { session }
}
