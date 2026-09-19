import { describe, expect, test } from "bun:test"
import { filterPlayers } from "@/components/spectator/player-search-dialog"
import type { SpectatorPlayerDetail } from "@/lib/spectator/types"

function detail(
  id: number,
  name: string,
  totalPoint: number,
  totalAttempts: number,
  extra: { furigana?: string; bibNumber?: string } = {},
): SpectatorPlayerDetail {
  return {
    player: {
      id,
      name,
      furigana: extra.furigana ?? null,
      bibNumber: extra.bibNumber ?? null,
    },
    totalPoint,
    totalAttempts,
    rank: null,
    perCourse: {},
  }
}

const players = [
  detail(1, "さくら", 10, 2, { furigana: "さくら", bibNumber: "A-12" }),
  detail(2, "たろう", 30, 1, { furigana: "たろう", bibNumber: "B-3" }),
  detail(3, "はなこ", 0, 0, { furigana: "はなこ" }),
  detail(4, "あきら", 30, 3, { furigana: "あきら" }),
]

describe("filterPlayers", () => {
  test("orders attempted players first, by point desc, then by name", () => {
    expect(filterPlayers(players, "").map((d) => d.player.id)).toEqual([
      4, 2, 1, 3,
    ])
  })

  test("does not mutate the input", () => {
    const copy = [...players]
    filterPlayers(players, "")
    expect(players).toEqual(copy)
  })

  test("matches on name, furigana and bib number, case-insensitively", () => {
    expect(filterPlayers(players, "さく").map((d) => d.player.id)).toEqual([1])
    expect(filterPlayers(players, "b-3").map((d) => d.player.id)).toEqual([2])
    expect(filterPlayers(players, "  A-1 ").map((d) => d.player.id)).toEqual([
      1,
    ])
  })

  test("returns empty when nothing matches", () => {
    expect(filterPlayers(players, "zzz")).toEqual([])
  })
})
