import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import {
  ChallengeModal,
  CourseOutModal,
  RetryModal,
} from "@/app/challenge/challengeModal"

afterEach(cleanup)

describe("ChallengeModal", () => {
  const defaultProps = {
    setModalOpen: mock(),
    handleSubmit: mock(),
    handleRetry: mock(),
    loading: false,
    isSuccess: false,
    message: "",
    result1Point: 15,
    result2Point: null as number | null,
    isGoal: false,
  }

  test("renders score summary card with result1", () => {
    render(<ChallengeModal {...defaultProps} />)
    expect(screen.getByText("15pt")).toBeTruthy()
    expect(screen.getByText("1回目")).toBeTruthy()
  })

  test("renders both results when result2 provided", () => {
    render(
      <ChallengeModal {...defaultProps} result1Point={10} result2Point={20} />,
    )
    expect(screen.getByText("10pt")).toBeTruthy()
    expect(screen.getByText("20pt")).toBeTruthy()
    expect(screen.getByText("2回目")).toBeTruthy()
  })

  test("shows submit button with correct hierarchy (accent)", () => {
    const { container } = render(<ChallengeModal {...defaultProps} />)
    const submitBtn = container.querySelector(".btn-accent")
    expect(submitBtn).toBeTruthy()
    expect(submitBtn?.textContent).toContain("結果を送信して終了")
  })

  test("shows ghost back button", () => {
    const { container } = render(<ChallengeModal {...defaultProps} />)
    const ghostBtn = container.querySelector(".btn-ghost")
    expect(ghostBtn).toBeTruthy()
  })

  test("shows retry button when result2 is null and not goal", () => {
    const { container } = render(<ChallengeModal {...defaultProps} />)
    const warningBtn = container.querySelector(".btn-warning")
    expect(warningBtn).toBeTruthy()
  })

  test("hides retry button when result2 is provided", () => {
    const { container } = render(
      <ChallengeModal {...defaultProps} result2Point={5} />,
    )
    const warningBtn = container.querySelector(".btn-warning")
    expect(warningBtn).toBeNull()
  })

  test("shows loading spinner when loading", () => {
    const { container } = render(
      <ChallengeModal {...defaultProps} loading={true} />,
    )
    const spinner = container.querySelector(".loading-spinner")
    expect(spinner).toBeTruthy()
  })

  test("shows success state with reload button", () => {
    render(
      <ChallengeModal {...defaultProps} isSuccess={true} message="送信完了!" />,
    )
    expect(screen.getByText("送信完了!")).toBeTruthy()
  })
})

describe("RetryModal", () => {
  test("renders score and retry button", () => {
    const setModalOpen = mock()
    const handleRetry = mock()
    render(
      <RetryModal
        setModalOpen={setModalOpen}
        handleRetry={handleRetry}
        result1Point={12}
      />,
    )
    expect(screen.getByText("12pt")).toBeTruthy()
    expect(screen.getByText("再チャレンジ")).toBeTruthy()
  })
})

describe("CourseOutModal", () => {
  test("renders course out title in error color", () => {
    const { container } = render(
      <CourseOutModal
        setModalOpen={mock()}
        setResult1={mock()}
        handleSubmit={mock()}
        handleRetry={mock()}
        loading={false}
        isSuccess={false}
        message=""
        result1Point={0}
        result2Point={null}
      />,
    )
    const errorTitle = container.querySelector(".text-error")
    expect(errorTitle).toBeTruthy()
    expect(errorTitle?.textContent).toContain("コースアウト")
  })
})
