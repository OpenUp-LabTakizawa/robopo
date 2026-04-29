import type { SpectatorSnapshot } from "@/lib/spectator/types"
import type { LiveFxEvent } from "@/lib/spectator/use-live-feed"

export type ThemeProps = {
  snapshot: SpectatorSnapshot
  fxEvent: LiveFxEvent | null
  remainingMs: number | null
  recentEvents: { id: string; text: string }[]
  compact: boolean
  selectedPlayerId: number | null
  onSelectPlayer: (playerId: number | null) => void
  onOpenSearch: () => void
}
