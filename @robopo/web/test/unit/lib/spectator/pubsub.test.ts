import { afterEach, describe, expect, test } from "bun:test"
import {
  publishChallengeChange,
  subscribeChallengeChange,
} from "@/lib/spectator/pubsub"

// Each test uses a different competitionId to keep them isolated, but we also
// drain any straggler listeners between tests just in case.
afterEach(() => {
  // No public reset, but each subscriber returns its own unsubscribe — tests
  // are responsible for unsubscribing.
})

describe("spectator/pubsub", () => {
  test("delivers a publish to a subscriber on the same competitionId", () => {
    const received: Array<{
      competitionId: number
      cause: string
    }> = []
    const unsub = subscribeChallengeChange(101, (p) => received.push(p))

    publishChallengeChange({
      competitionId: 101,
      cause: "challenge:create",
    })

    expect(received).toHaveLength(1)
    expect(received[0]).toEqual({
      competitionId: 101,
      cause: "challenge:create",
    })

    unsub()
  })

  test("does NOT deliver across competitionIds", () => {
    const received: number[] = []
    const unsub = subscribeChallengeChange(201, () => received.push(1))

    publishChallengeChange({
      competitionId: 999, // different
      cause: "challenge:create",
    })

    expect(received).toHaveLength(0)
    unsub()
  })

  test("supports multiple subscribers on the same competitionId", () => {
    const a: number[] = []
    const b: number[] = []
    const unsubA = subscribeChallengeChange(301, () => a.push(1))
    const unsubB = subscribeChallengeChange(301, () => b.push(1))

    publishChallengeChange({
      competitionId: 301,
      cause: "challenge:update",
    })

    expect(a).toHaveLength(1)
    expect(b).toHaveLength(1)

    unsubA()
    unsubB()
  })

  test("unsubscribe stops further deliveries", () => {
    const received: number[] = []
    const unsub = subscribeChallengeChange(401, () => received.push(1))
    publishChallengeChange({
      competitionId: 401,
      cause: "challenge:create",
    })
    unsub()
    publishChallengeChange({
      competitionId: 401,
      cause: "challenge:delete",
    })
    expect(received).toHaveLength(1)
  })

  test("survives multiple causes (create / update / delete)", () => {
    const received: string[] = []
    const unsub = subscribeChallengeChange(501, (p) => received.push(p.cause))
    publishChallengeChange({
      competitionId: 501,
      cause: "challenge:create",
    })
    publishChallengeChange({
      competitionId: 501,
      cause: "challenge:update",
    })
    publishChallengeChange({
      competitionId: 501,
      cause: "challenge:delete",
    })
    expect(received).toEqual([
      "challenge:create",
      "challenge:update",
      "challenge:delete",
    ])
    unsub()
  })
})
