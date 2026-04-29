import { buildSpectatorSnapshot } from "@/lib/spectator/live-data"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId: rawId } = await params
  const competitionId = Number(rawId)

  if (Number.isNaN(competitionId) || competitionId <= 0) {
    return Response.json({ error: "Invalid competition ID." }, { status: 400 })
  }

  const snapshot = await buildSpectatorSnapshot(competitionId)
  if (!snapshot) {
    return Response.json({ error: "Competition not found." }, { status: 404 })
  }

  return Response.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  })
}
