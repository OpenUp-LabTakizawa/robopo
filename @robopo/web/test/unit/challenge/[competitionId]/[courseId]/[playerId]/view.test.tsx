import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render } from "@testing-library/react"

mock.module("@/app/challenge/challenge", () => ({
  Challenge: () => <div data-testid="challenge" />,
}))

const { AudioProvider } = await import(
  "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
)
const { View } = await import(
  "@/app/challenge/[competitionId]/[courseId]/[playerId]/view"
)
const { NavigationGuardProvider } = await import("@/hooks/useNavigationGuard")

const courseData = {
  id: 1,
  name: "test",
  description: null,
  field: null,
  fieldValid: false,
  mission: null,
  missionValid: false,
  point: null,
  courseOutRule: "keep",
  isConfigured: true,
  createdAt: null,
}

const playerData = {
  id: 1,
  name: "player",
  furigana: null,
  bibNumber: null,
  qr: null,
  note: null,
  createdAt: null,
}

function renderView(courseId = 1) {
  return render(
    <NavigationGuardProvider>
      <AudioProvider>
        <View
          courseData={courseData}
          playerData={playerData}
          competitionId={1}
          courseId={courseId}
          judgeId={1}
        />
      </AudioProvider>
    </NavigationGuardProvider>,
  )
}

afterEach(cleanup)

describe("View", () => {
  test("registers beforeunload immediately on render", () => {
    const spy = mock()
    const original = window.addEventListener
    window.addEventListener = mock((event: string, handler: unknown) => {
      if (event === "beforeunload") {
        spy()
      }
      return original.call(window, event, handler as EventListener)
    })

    renderView()

    expect(spy).toHaveBeenCalled()
    window.addEventListener = original
  })

  test("renders Challenge for any course", () => {
    const { getByTestId } = renderView()
    expect(getByTestId("challenge")).toBeDefined()
  })

  test("passes judgeId to Challenge component", () => {
    const { getByTestId } = render(
      <NavigationGuardProvider>
        <AudioProvider>
          <View
            courseData={courseData}
            playerData={playerData}
            competitionId={1}
            courseId={1}
            judgeId={5}
          />
        </AudioProvider>
      </NavigationGuardProvider>,
    )
    expect(getByTestId("challenge")).toBeDefined()
  })
})
