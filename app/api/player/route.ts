import { deleteById } from "@/app/api/delete"
import { db } from "@/app/lib/db/db"
import { createPlayer } from "@/app/lib/db/queries/insert"
import { type SelectPlayer, player } from "@/app/lib/db/schema"

export const revalidate = 0

export async function GET() {
  const players: SelectPlayer[] = await db.select().from(player)
  return Response.json({ players })
}

export async function POST(req: Request) {
  const { name, furigana, zekken, qr } = await req.json()
  const playerData = {
    name: name,
    furigana: furigana,
    zekken: zekken,
    qr: qr,
  }
  try {
    const result = await createPlayer(playerData)
    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the player.",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  const result = await deleteById(req, "player")
  return result
}
