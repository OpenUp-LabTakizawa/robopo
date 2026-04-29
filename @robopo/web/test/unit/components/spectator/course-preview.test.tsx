import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, render } from "@testing-library/react"
import { CoursePreview } from "@/components/spectator/course-preview"

afterEach(cleanup)

// Course A: 5 panels in a vertical line, mission has 4 forward-moves (4 steps).
const FIELD_A = "start;route;route;route;goal"
const MISSION_A_4_STEPS = "u;u;mf;1;mf;1;mf;1;mf;1" // pairs.length = 4

// Course B: small, only 2 missions.
const FIELD_B = "start;route;goal"
const MISSION_B_2_STEPS = "u;u;mf;1;mf;1" // pairs.length = 2

describe("CoursePreview", () => {
  test("renders fallback when no field is provided", () => {
    const { getByText } = render(
      <CoursePreview fieldRaw={null} missionRaw={null} reachedIndex={0} />,
    )
    expect(getByText("コース未設定")).toBeTruthy()
  })

  test("renders without throwing for a normal course + reachedIndex within bounds", () => {
    expect(() => {
      render(
        <CoursePreview
          fieldRaw={FIELD_A}
          missionRaw={MISSION_A_4_STEPS}
          reachedIndex={2}
        />,
      )
    }).not.toThrow()
  })

  test("renders without throwing when reachedIndex == totalSteps (full clear)", () => {
    expect(() => {
      render(
        <CoursePreview
          fieldRaw={FIELD_A}
          missionRaw={MISSION_A_4_STEPS}
          reachedIndex={4}
        />,
      )
    }).not.toThrow()
  })

  test("does NOT throw when reachedIndex exceeds the course's mission length", () => {
    // This was the regression that crashed PlayerDetailPanel: a stale
    // `reachedIndex` from a longer course was passed in, and getRobotPosition
    // would access missionPair[i] out of bounds.
    expect(() => {
      render(
        <CoursePreview
          fieldRaw={FIELD_B}
          missionRaw={MISSION_B_2_STEPS}
          reachedIndex={9}
        />,
      )
    }).not.toThrow()
  })

  test("does NOT throw when re-rendering with a shorter course (simulates player switch)", () => {
    // Render with a 4-step course, then re-render with a 2-step course but
    // the same reachedIndex. CoursePreview's animation state could be left
    // mid-stride from the longer course; we must not crash.
    const { rerender } = render(
      <CoursePreview
        fieldRaw={FIELD_A}
        missionRaw={MISSION_A_4_STEPS}
        reachedIndex={4}
      />,
    )
    expect(() => {
      rerender(
        <CoursePreview
          fieldRaw={FIELD_B}
          missionRaw={MISSION_B_2_STEPS}
          reachedIndex={4}
        />,
      )
    }).not.toThrow()
  })

  test("handles a course with no missions (only start/goal directions)", () => {
    expect(() => {
      render(
        <CoursePreview
          fieldRaw={FIELD_B}
          missionRaw="u;u" // pairs.length = 0
          reachedIndex={0}
        />,
      )
    }).not.toThrow()
  })
})
