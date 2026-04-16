import { inArray } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/lib/db/db"
import { user } from "@/lib/db/schema"
import { getAdminList } from "@/server/db"

export async function POST(req: Request) {
  const { auth } = await import("@/lib/auth/auth")
  const { username, password } = await req.json()

  if (!username?.trim()) {
    return Response.json(
      { success: false, message: "Username is required." },
      { status: 400 },
    )
  }

  if (!/^[a-z0-9_]+$/.test(username.trim().toLowerCase())) {
    return Response.json(
      {
        success: false,
        message:
          "Username can only contain lowercase letters, numbers, and underscores.",
      },
      { status: 400 },
    )
  }

  if (!password || password.length < 8) {
    return Response.json(
      { success: false, message: "Password must be at least 8 characters." },
      { status: 400 },
    )
  }

  try {
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: `${username.trim().toLowerCase()}@robopo.local`,
        password,
        name: username.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
      },
    })

    if (!signUpRes?.user?.id) {
      return Response.json(
        { success: false, message: "Failed to create user account." },
        { status: 500 },
      )
    }

    const newList = await getAdminList()
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    console.error("Error creating admin:", error)
    const message =
      error instanceof Error && error.message.includes("unique")
        ? "This username is already in use."
        : "An error occurred while creating the admin."
    return Response.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { auth } = await import("@/lib/auth/auth")
  const { id } = await req.json()

  if (!id || !Array.isArray(id) || id.length === 0) {
    return Response.json(
      { success: false, message: "No items specified for deletion." },
      { status: 400 },
    )
  }

  // Prevent self-deletion
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user && id.includes(session.user.id)) {
    return Response.json(
      {
        success: false,
        message:
          "You cannot delete your own account. Please ask another admin to remove it.",
      },
      { status: 400 },
    )
  }

  try {
    await db.delete(user).where(inArray(user.id, id))
    const newList = await getAdminList()
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return Response.json(
      { success: false, message: "An error occurred while deleting." },
      { status: 500 },
    )
  }
}
