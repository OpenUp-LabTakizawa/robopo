import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, screen } from "@testing-library/react"
import { Dashboard } from "@/components/home/dashboard"
import { renderWithRouter } from "../../../utils/router"

afterEach(cleanup)

const defaultProps = {
  competitionList: {
    competitions: [
      {
        id: 1,
        name: "Test Competition",
        description: null,
        startDate: null,
        endDate: null,
        createdAt: null,
      },
    ],
  },
  courseList: {
    courses: [
      {
        id: 1,
        name: "Course A",
        description: null,
        field: null,
        fieldValid: false,
        mission: null,
        missionValid: false,
        point: null,
        courseOutRule: "keep",
        isConfigured: true,
        createdAt: null,
      },
    ],
  },
  competitionCourseList: {
    competitionCourseList: [
      { id: 1, competitionId: 1, courseId: 1, createdAt: null },
    ],
  },
  judgeList: [{ id: 1, name: "Judge A", createdAt: null }],
  competitionJudgeList: {
    competitionJudgeList: [
      { id: 1, competitionId: 1, judgeId: 1, createdAt: null },
    ],
  },
}

describe("Dashboard", () => {
  test("renders three dashboard cards", () => {
    const { container } = renderWithRouter(<Dashboard {...defaultProps} />)
    const cards = container.querySelectorAll(".rounded-box")
    expect(cards.length).toBe(3)
  })

  test("renders scoring card with primary variant", () => {
    const { container } = renderWithRouter(<Dashboard {...defaultProps} />)
    const primaryCard = container.querySelector(".ring-primary\\/10")
    expect(primaryCard).toBeTruthy()
  })

  test("renders card titles", () => {
    renderWithRouter(<Dashboard {...defaultProps} />)
    expect(screen.getByText("採点")).toBeTruthy()
    expect(screen.getByText("大会管理")).toBeTruthy()
    expect(screen.getByText("設定")).toBeTruthy()
  })
})
