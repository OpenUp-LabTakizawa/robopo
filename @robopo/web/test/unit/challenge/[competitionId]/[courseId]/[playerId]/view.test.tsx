import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render } from "@testing-library/react"

mock.module("@/app/challenge/challenge", () => ({
  Challenge: () => <div data-testid="challenge" />,
}))
mock.module("@/app/components/challenge/sensorCourse", () => ({
  SensorCourse: () => <div data-testid="sensor-course" />,
}))

const { AudioProvider } = await import(
  "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
)
const { View } = await import(
  "@/app/challenge/[competitionId]/[courseId]/[playerId]/view"
)

const courseData = {
  id: 1,
  name: "test",
  field: null,
  fieldValid: false,
  mission: null,
  missionValid: false,
  point: null,
  createdAt: null,
}

const playerData = {
  id: 1,
  name: "player",
  furigana: null,
  zekken: null,
  qr: null,
  createdAt: null,
}

function renderView(courseId = 1) {
  return render(
    <AudioProvider>
      <View
        courseData={courseData}
        playerData={playerData}
        competitionId={1}
        courseId={courseId}
        umpireId={1}
      />
    </AudioProvider>,
  )
}

afterEach(cleanup)

describe("View", () => {
  test("does not register beforeunload before challenge starts", () => {
    const spy = mock()
    const original = window.addEventListener
    window.addEventListener = mock((event: string, handler: unknown) => {
      if (event === "beforeunload") {
        spy()
      }
      return original.call(window, event, handler as EventListener)
    })

    renderView()

    expect(spy).not.toHaveBeenCalled()
    window.addEventListener = original
  })

  test("renders Challenge for non-sensor course", () => {
    const { getByTestId, queryByTestId } = renderView()
    expect(getByTestId("challenge")).toBeDefined()
    expect(queryByTestId("sensor-course")).toBeNull()
  })

  test("renders SensorCourse for sensor course (id: -2)", () => {
    const { getByTestId, queryByTestId } = renderView(-2)
    expect(getByTestId("sensor-course")).toBeDefined()
    expect(queryByTestId("challenge")).toBeNull()
  })

  test("passes umpireId to Challenge component", () => {
    const { getByTestId } = render(
      <AudioProvider>
        <View
          courseData={courseData}
          playerData={playerData}
          competitionId={1}
          courseId={1}
          umpireId={5}
        />
      </AudioProvider>,
    )
    expect(getByTestId("challenge")).toBeDefined()
  })
})
