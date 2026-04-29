import { buildSpectatorSnapshot } from "@/lib/spectator/live-data"
import { subscribeChallengeChange } from "@/lib/spectator/pubsub"
import type { SpectatorEvent } from "@/lib/spectator/types"

const HEARTBEAT_MS = 25_000

function encode(event: SpectatorEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId: rawId } = await params
  const competitionId = Number(rawId)

  if (Number.isNaN(competitionId) || competitionId <= 0) {
    return new Response("Invalid competition ID.", { status: 400 })
  }

  const encoder = new TextEncoder()
  let unsubscribe: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let closed = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const safeEnqueue = (chunk: string) => {
        if (closed) {
          return
        }
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          // Stream already closed by client.
          closed = true
        }
      }

      const close = () => {
        if (closed) {
          return
        }
        closed = true
        if (heartbeat) {
          clearInterval(heartbeat)
          heartbeat = null
        }
        if (unsubscribe) {
          unsubscribe()
          unsubscribe = null
        }
        try {
          controller.close()
        } catch {
          // ignore
        }
      }

      // Send retry hint + initial snapshot.
      safeEnqueue("retry: 5000\n\n")
      try {
        const snapshot = await buildSpectatorSnapshot(competitionId)
        if (snapshot) {
          safeEnqueue(encode({ kind: "snapshot", snapshot }))
        }
      } catch (err) {
        console.error("[spectator/stream] initial snapshot failed:", err)
      }

      let queued = false
      const pushSnapshot = async () => {
        if (closed) {
          return
        }
        if (queued) {
          return
        }
        queued = true
        // Coalesce bursts of changes that arrive in the same tick.
        await new Promise((r) => setTimeout(r, 80))
        queued = false
        try {
          const snapshot = await buildSpectatorSnapshot(competitionId)
          if (snapshot) {
            safeEnqueue(encode({ kind: "snapshot", snapshot }))
          }
        } catch (err) {
          console.error("[spectator/stream] snapshot rebuild failed:", err)
        }
      }

      unsubscribe = subscribeChallengeChange(competitionId, () => {
        safeEnqueue(encode({ kind: "challenge", competitionId }))
        void pushSnapshot()
      })

      heartbeat = setInterval(() => {
        safeEnqueue(encode({ kind: "ping", at: new Date().toISOString() }))
      }, HEARTBEAT_MS)

      // Detect client disconnect.
      const signal = req.signal
      if (signal.aborted) {
        close()
        return
      }
      signal.addEventListener("abort", close)
    },
    cancel() {
      closed = true
      if (heartbeat) {
        clearInterval(heartbeat)
        heartbeat = null
      }
      if (unsubscribe) {
        unsubscribe()
        unsubscribe = null
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
