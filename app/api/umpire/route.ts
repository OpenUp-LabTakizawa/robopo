import { deleteById } from "@/app/api/delete"
import { db } from "@/app/lib/db/db"
import { createUmpire } from "@/app/lib/db/queries/insert"
import { type SelectUmpire, umpire } from "@/app/lib/db/schema"

export const revalidate = 0

export async function GET() {
  const umpires: SelectUmpire[] = await db.select().from(umpire)
  return Response.json({ umpires })
}

export async function POST(req: Request) {
  const { name } = await req.json()
  const umpireData = {
    name: name,
  }
  try {
    const result = await createUmpire(umpireData)
    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the umpire.",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  return await deleteById(req, "umpire")
}
