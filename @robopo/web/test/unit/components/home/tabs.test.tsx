import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, fireEvent, screen } from "@testing-library/react"
import { ChallengeTab, ManageTab } from "@/components/home/tabs"
import { renderWithRouter } from "../../../utils/router"

afterEach(cleanup)

const competitionList = {
  competitions: [
    {
      id: 1,
      name: "Active Comp",

      description: null,
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2027-12-31T00:00:00.000Z"),
      createdAt: null,
    },
    {
      id: 2,
      name: "Closed Comp",

      description: null,
      startDate: new Date("2024-01-01T00:00:00.000Z"),
      endDate: new Date("2024-12-31T00:00:00.000Z"),
      createdAt: null,
    },
    {
      id: 3,
      name: "Prep Comp",

      description: null,
      startDate: new Date("2027-06-01T00:00:00.000Z"),
      endDate: new Date("2027-12-31T00:00:00.000Z"),
      createdAt: null,
    },
  ],
}

const courseList = {
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
    {
      id: 2,
      name: "Course B",
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
}

const competitionCourseList = {
  competitionCourseList: [
    { id: 1, competitionId: 1, courseId: 1, createdAt: null },
    { id: 2, competitionId: 1, courseId: 2, createdAt: null },
  ],
}

const judgeList = [
  { id: 1, username: "judgea", note: null, userId: "u1", createdAt: null },
  { id: 2, username: "judgeb", note: null, userId: "u2", createdAt: null },
]

const competitionJudgeList = {
  competitionJudgeList: [
    { id: 1, competitionId: 1, judgeId: 1, createdAt: null },
    { id: 2, competitionId: 1, judgeId: 2, createdAt: null },
  ],
}

describe("ChallengeTab", () => {
  test("shows competition name when single active competition", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Only Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(screen.getByText("Only Comp")).toBeTruthy()
  })

  test("renders judge selection dropdown", () => {
    renderWithRouter(
      <ChallengeTab
        competitionList={competitionList}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(screen.getByText("judgea")).toBeTruthy()
    expect(screen.getByText("judgeb")).toBeTruthy()
  })

  test("shows course cards when single competition is active", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    const courseButton = screen.getByText("Course A").closest("button")
    expect(courseButton).toBeTruthy()
  })

  test("renders course cards when competition is selected", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(screen.getByText("Course A")).toBeTruthy()
    expect(screen.getByText("Course B")).toBeTruthy()
  })

  test("shows placeholder when no competition selected", () => {
    const multiActive = {
      competitions: [
        {
          id: 1,
          name: "Comp A",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
        {
          id: 2,
          name: "Comp B",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={multiActive}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    const placeholders = screen.getAllByText("大会を選択してください")
    expect(placeholders.length).toBeGreaterThan(0)
  })

  test("renders judge cards as buttons for selection", () => {
    const singleCompe = {
      competitions: [
        {
          id: 1,
          name: "Comp",

          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    renderWithRouter(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )

    // Judge cards should render as buttons
    const judgeButton = screen.getByText("judgea").closest("button")
    expect(judgeButton).toBeTruthy()

    // Course cards should also be buttons
    const courseButton = screen.getByText("Course A").closest("button")
    expect(courseButton).toBeTruthy()
  })

  test("resets judge selection when switching to a competition where the judge is not assigned", () => {
    const multiCompe = {
      competitions: [
        {
          id: 1,
          name: "Comp A",
          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
        {
          id: 2,
          name: "Comp B",
          description: null,
          startDate: new Date("2025-01-01T00:00:00.000Z"),
          endDate: new Date("2027-12-31T00:00:00.000Z"),
          createdAt: null,
        },
      ],
    }
    // judgea (id:1) is only assigned to Comp A, judgeb (id:2) to both
    const compJudgeList = {
      competitionJudgeList: [
        { id: 1, competitionId: 1, judgeId: 1, createdAt: null },
        { id: 2, competitionId: 1, judgeId: 2, createdAt: null },
        { id: 3, competitionId: 2, judgeId: 2, createdAt: null },
      ],
    }

    renderWithRouter(
      <ChallengeTab
        competitionList={multiCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={compJudgeList}
        loggedInJudgeId={undefined}
      />,
    )

    // Select Comp A
    fireEvent.click(screen.getByText("Comp A"))
    // Select judgea
    fireEvent.click(screen.getByText("judgea"))
    // judgea card should be selected
    const judgeaCard = screen.getByText("judgea").closest("button")
    expect(judgeaCard?.className).toContain("border-primary")

    // Switch to Comp B (where judgea is not assigned)
    fireEvent.click(screen.getByText("Comp B"))
    // judgea should no longer be visible (not assigned to Comp B)
    expect(screen.queryByText("judgea")).toBeNull()
    // judgeb should still be visible
    expect(screen.getByText("judgeb")).toBeTruthy()
  })
})

describe("ManageTab", () => {
  test("renders all management links", () => {
    renderWithRouter(<ManageTab />)
    expect(screen.getByText("大会一覧")).toBeTruthy()
    expect(screen.getByText("コース一覧")).toBeTruthy()
    expect(screen.getByText("選手一覧")).toBeTruthy()
    expect(screen.getByText("採点者一覧")).toBeTruthy()
    expect(screen.getByText("集計結果")).toBeTruthy()
  })
})
