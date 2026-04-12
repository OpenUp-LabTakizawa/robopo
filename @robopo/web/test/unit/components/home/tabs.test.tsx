import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { ChallengeTab, ManageTab } from "@/app/components/home/tabs"

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
  { id: 1, name: "Judge A", createdAt: null },
  { id: 2, name: "Judge B", createdAt: null },
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
    render(
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
    render(
      <ChallengeTab
        competitionList={competitionList}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(screen.getByText("Judge A")).toBeTruthy()
    expect(screen.getByText("Judge B")).toBeTruthy()
  })

  test("shows warning when course card clicked without judge selected", () => {
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
    const { container } = render(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(container.querySelector(".alert-warning")).toBeNull()
    const courseButton = screen.getByText("Course A").closest("button")
    expect(courseButton).toBeTruthy()
    if (courseButton) {
      fireEvent.click(courseButton)
    }
    expect(container.querySelector(".alert-warning")).toBeTruthy()
    expect(screen.getByText("先に採点者を選択してください")).toBeTruthy()
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
    render(
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
    render(
      <ChallengeTab
        competitionList={multiActive}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )
    expect(
      screen.getByText("大会を選択するとコースが表示されます"),
    ).toBeTruthy()
  })

  test("renders course links with judgeId in href when judge is selected", () => {
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
    render(
      <ChallengeTab
        competitionList={singleCompe}
        courseList={courseList}
        competitionCourseList={competitionCourseList}
        judgeList={judgeList}
        competitionJudgeList={competitionJudgeList}
      />,
    )

    // Select judge
    const judgeSelect = screen.getByRole("combobox", {
      name: "採点者を選択",
    })
    fireEvent.change(judgeSelect, { target: { value: "1" } })

    // Course card should now render as a link with judgeId
    const courseLink = screen.getByText("Course A").closest("a")
    expect(courseLink).toBeTruthy()
    const href = courseLink?.getAttribute("href")
    expect(href).toContain("judgeId=1")
  })
})

describe("ManageTab", () => {
  test("renders all management links", () => {
    render(<ManageTab />)
    expect(screen.getByText("大会一覧")).toBeTruthy()
    expect(screen.getByText("コース一覧")).toBeTruthy()
    expect(screen.getByText("選手一覧")).toBeTruthy()
    expect(screen.getByText("採点者一覧")).toBeTruthy()
    expect(screen.getByText("集計結果")).toBeTruthy()
  })
})
