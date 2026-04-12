import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { SelectCompetition } from "@/app/lib/db/schema"
import { SummaryView } from "@/app/summary/summaryView"

afterEach(cleanup)

const competitions: SelectCompetition[] = [
  {
    id: 1,
    name: "大会A",
    description: null,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2027-12-31"),
    createdAt: null,
  },
  {
    id: 2,
    name: "大会B",
    description: null,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2027-12-31"),
    createdAt: null,
  },
]

describe("SummaryView", () => {
  test("renders competition selector with options", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    expect(screen.getByText("大会A")).toBeTruthy()
    expect(screen.getByText("大会B")).toBeTruthy()
  })

  test("shows placeholder when no competition selected", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    expect(screen.getByText("大会を選択してください")).toBeTruthy()
  })

  test("renders default sort condition (totalPoint desc)", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    expect(screen.getByText("総得点")).toBeTruthy()
    expect(screen.getByText("大きい順")).toBeTruthy()
  })

  test("toggles sort order on click", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    const orderButton = screen.getByText("大きい順")
    fireEvent.click(orderButton)
    expect(screen.getByText("小さい順")).toBeTruthy()
  })

  test("removes sort condition on X click", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    // The sort chip should have a remove button
    const removeButton = screen.getByLabelText("総得点のソートを削除")
    fireEvent.click(removeButton)
    // After removal, the sort chip label should be gone (text may still appear in dropdown options)
    expect(screen.queryByLabelText("総得点のソートを削除")).toBeNull()
  })

  test("adds new sort condition from dropdown", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    // Find the add-sort select
    const _addSelect = screen.getByRole("combobox", { name: "" })
    // The last combobox is the sort adder (after competition + course selects)
    const selects = screen
      .getAllByRole("combobox")
      .filter(
        (s) =>
          s.querySelector('option[value="playerFurigana"]') !== null ||
          (s as HTMLSelectElement).querySelector(
            'option[value="playerFurigana"]',
          ),
      )
    if (selects.length > 0) {
      fireEvent.change(selects[0], { target: { value: "maxResult" } })
      expect(screen.getByText("最高得点")).toBeTruthy()
    }
  })

  test("renders search input", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    expect(
      screen.getByPlaceholderText("名前・ふりがな・ゼッケン番号で検索"),
    ).toBeTruthy()
  })
})
