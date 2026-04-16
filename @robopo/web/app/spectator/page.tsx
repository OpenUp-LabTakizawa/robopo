import type { Metadata } from "next"
import { Leaderboard } from "@/components/spectator/leaderboard"
import { getCompetitionStatus } from "@/lib/competition"
import type { SelectCompetition } from "@/lib/db/schema"
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

  // Only show active competitions
  const activeCompetitions = competitions.filter(
    (c) => getCompetitionStatus(c) === "active",
  )

  const defaultId = getDefaultCompetitionId(activeCompetitions)

  return (
    <Leaderboard
      competitions={activeCompetitions}
      defaultCompetitionId={defaultId}
    />
  )
}
