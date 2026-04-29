import type { Metadata } from "next"
import { LiveSpectator } from "@/components/spectator/live-spectator"
import { getCompetitionStatus } from "@/lib/competition"
import type { SelectCompetition } from "@/lib/db/schema"
import { buildSpectatorSnapshot } from "@/lib/spectator/live-data"
import { getCompetitionList } from "@/server/db"

export const metadata: Metadata = {
  title: "観戦",
  description: "リアルタイムでスコアランキングを観戦できます",
}

function getDefaultCompetitionId(
  competitions: SelectCompetition[],
): number | null {
  const active = competitions.find((c) => getCompetitionStatus(c) === "active")
  if (active) {
    return active.id
  }
  return null
}

export default async function SpectatorPage() {
  const { competitions } = await getCompetitionList()

  const activeCompetitions = competitions.filter(
    (c) => getCompetitionStatus(c) === "active",
  )

  const defaultId = getDefaultCompetitionId(activeCompetitions)

  // Build the initial snapshot on the server so the client renders the live
  // theme on first paint instead of an empty placeholder while waiting for SSE.
  const initialSnapshot =
    defaultId !== null ? await buildSpectatorSnapshot(defaultId) : null

  return (
    <LiveSpectator
      competitions={activeCompetitions}
      defaultCompetitionId={defaultId}
      initialSnapshot={initialSnapshot}
    />
  )
}
