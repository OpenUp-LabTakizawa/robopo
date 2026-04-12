import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import { Dashboard } from "@/app/components/home/dashboard"

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
  test("renders two dashboard cards", () => {
    const { container } = render(<Dashboard {...defaultProps} />)
    const cards = container.querySelectorAll(".rounded-box")
    expect(cards.length).toBe(2)
  })

  test("renders scoring card with primary variant", () => {
    const { container } = render(<Dashboard {...defaultProps} />)
    const primaryCard = container.querySelector(".ring-primary\\/10")
    expect(primaryCard).toBeTruthy()
  })

  test("renders card titles", () => {
    render(<Dashboard {...defaultProps} />)
    expect(screen.getByText("採点")).toBeTruthy()
    expect(screen.getByText("大会管理")).toBeTruthy()
  })
})
