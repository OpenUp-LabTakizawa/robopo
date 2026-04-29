import { EventEmitter } from "node:events"

// In-process pub/sub for spectator SSE streams.
// Survives Next.js dev HMR by stashing the emitter on globalThis.

type Globals = typeof globalThis & {
  __robopoSpectatorBus?: EventEmitter
}

function getBus(): EventEmitter {
  const g = globalThis as Globals
  if (!g.__robopoSpectatorBus) {
    const bus = new EventEmitter()
    bus.setMaxListeners(0)
    g.__robopoSpectatorBus = bus
  }
  return g.__robopoSpectatorBus
}

function channel(competitionId: number): string {
  return `competition:${competitionId}`
}

export type SpectatorBusPayload = {
  competitionId: number
  cause: "challenge:create" | "challenge:update" | "challenge:delete"
}

export function publishChallengeChange(payload: SpectatorBusPayload): void {
  getBus().emit(channel(payload.competitionId), payload)
}

export function subscribeChallengeChange(
  competitionId: number,
  listener: (payload: SpectatorBusPayload) => void,
): () => void {
  const bus = getBus()
  const ch = channel(competitionId)
  bus.on(ch, listener)
  return () => {
    bus.off(ch, listener)
  }
}
