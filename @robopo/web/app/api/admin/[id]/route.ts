import { hashPassword } from "better-auth/crypto"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db/db"
import { account, user } from "@/lib/db/schema"
import { getAdminList } from "@/server/db"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json()

  if (!id) {
    return Response.json(
      { success: false, message: "Admin ID is required." },
      { status: 400 },
    )
  }

  try {
    // Update username if provided
    if (body.username) {
      const trimmed = body.username.trim().toLowerCase()
      if (!/^[a-z0-9_]+$/.test(trimmed)) {
        return Response.json(
          {
            success: false,
            message:
              "Username can only contain lowercase letters, numbers, and underscores.",
          },
          { status: 400 },
        )
      }
      await db
        .update(user)
        .set({
          username: trimmed,
          displayUsername: trimmed,
          name: trimmed,
        })
        .where(eq(user.id, id))
    }

    // Update password if provided
    if (body.password) {
      if (body.password.length < 8) {
        return Response.json(
          {
            success: false,
            message: "Password must be at least 8 characters.",
          },
          { status: 400 },
        )
      }
      const hashedPassword = await hashPassword(body.password)
      await db
        .update(account)
        .set({ password: hashedPassword })
        .where(
          and(eq(account.userId, id), eq(account.providerId, "credential")),
        )
    }

    const newList = await getAdminList()
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    console.error("Error updating admin:", error)
    const message =
      error instanceof Error && error.message.includes("unique")
        ? "This username is already in use."
        : "An error occurred while updating."
    return Response.json({ success: false, message }, { status: 500 })
  }
}
