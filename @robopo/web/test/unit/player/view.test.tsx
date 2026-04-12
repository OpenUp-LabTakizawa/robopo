import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { SelectPlayerWithCompetition } from "@/app/lib/db/schema"
import { PlayerView } from "@/app/player/view"

afterEach(cleanup)

const players: SelectPlayerWithCompetition[] = [
  {
    id: 1,
    name: "田中太郎",
    furigana: "たなかたろう",
    bibNumber: "001",
    note: null,
    createdAt: null,
    competitionId: null,
    competitionIds: [1],
    competitionName: ["大会A"],
  },
  {
    id: 2,
    name: "山田花子",
    furigana: "やまだはなこ",
    bibNumber: "002",
    note: "テスト備考",
    createdAt: null,
    competitionId: null,
    competitionIds: [1, 2],
    competitionName: ["大会A", "大会B"],
  },
  {
    id: 3,
    name: "佐藤次郎",
    furigana: "さとうじろう",
    bibNumber: "003",
    note: null,
    createdAt: null,
    competitionId: null,
    competitionIds: [2],
    competitionName: ["大会B"],
  },
]

describe("PlayerView", () => {
  test("renders all players initially", () => {
    render(<PlayerView initialPlayerList={players} competitionList={[]} />)
    expect(screen.getByText("田中太郎")).toBeTruthy()
    expect(screen.getByText("山田花子")).toBeTruthy()
    expect(screen.getByText("佐藤次郎")).toBeTruthy()
  })

  test("filters players by name search", () => {
    render(<PlayerView initialPlayerList={players} competitionList={[]} />)
    const searchInput = screen.getByPlaceholderText(
      "名前・ふりがな・ゼッケン番号・備考で検索",
    )
    fireEvent.change(searchInput, { target: { value: "田中" } })
    expect(screen.getByText("田中太郎")).toBeTruthy()
    expect(screen.queryByText("山田花子")).toBeNull()
    expect(screen.queryByText("佐藤次郎")).toBeNull()
  })

  test("filters players by furigana search", () => {
    render(<PlayerView initialPlayerList={players} competitionList={[]} />)
    const searchInput = screen.getByPlaceholderText(
      "名前・ふりがな・ゼッケン番号・備考で検索",
    )
    fireEvent.change(searchInput, { target: { value: "やまだ" } })
    expect(screen.queryByText("田中太郎")).toBeNull()
    expect(screen.getByText("山田花子")).toBeTruthy()
  })

  test("filters players by bib number search", () => {
    render(<PlayerView initialPlayerList={players} competitionList={[]} />)
    const searchInput = screen.getByPlaceholderText(
      "名前・ふりがな・ゼッケン番号・備考で検索",
    )
    fireEvent.change(searchInput, { target: { value: "003" } })
    expect(screen.queryByText("田中太郎")).toBeNull()
    expect(screen.getByText("佐藤次郎")).toBeTruthy()
  })

  test("shows empty state when search has no results", () => {
    render(<PlayerView initialPlayerList={players} competitionList={[]} />)
    const searchInput = screen.getByPlaceholderText(
      "名前・ふりがな・ゼッケン番号・備考で検索",
    )
    fireEvent.change(searchInput, { target: { value: "存在しない" } })
    expect(screen.getByText("条件に一致する選手が見つかりません")).toBeTruthy()
  })

  test("renders competition names in filter dropdown", () => {
    render(<PlayerView initialPlayerList={players} competitionList={[]} />)
    expect(screen.getAllByText("大会A").length).toBeGreaterThan(0)
    expect(screen.getAllByText("大会B").length).toBeGreaterThan(0)
  })
})
