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

  test("renders tab buttons", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    expect(screen.getByText("選手")).toBeTruthy()
    expect(screen.getByText("採点者")).toBeTruthy()
    expect(screen.getByText("コース")).toBeTruthy()
  })

  test("player tab is active by default", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    const playerButton = screen.getByText("選手").closest("button")
    expect(playerButton?.className).toContain("bg-primary")
  })

  test("switches to judge tab on click", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    const judgeButton = screen.getByText("採点者").closest("button")
    if (judgeButton) {
      fireEvent.click(judgeButton)
    }
    expect(judgeButton?.className).toContain("bg-primary")
    // Player tab should no longer be active
    const playerButton = screen.getByText("選手").closest("button")
    expect(playerButton?.className).not.toContain("bg-primary")
  })

  test("switches to course tab on click", () => {
    render(
      <SummaryView competitions={competitions} defaultCompetitionId={null} />,
    )
    const courseButton = screen.getByText("コース").closest("button")
    if (courseButton) {
      fireEvent.click(courseButton)
    }
    expect(courseButton?.className).toContain("bg-primary")
  })
})
