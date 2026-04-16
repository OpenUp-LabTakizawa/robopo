import { describe, expect, mock, test } from "bun:test"
import { render } from "@testing-library/react"

mock.module("@/app/course/edit/courseEditContext", () => ({
  CourseEditProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

const { default: Layout } = await import("@/app/course/layout")

describe("course layout", () => {
  test("renders children", () => {
    const { getByText } = render(
      <Layout>
        <p>child</p>
      </Layout>,
    )
    expect(getByText("child")).toBeDefined()
  })

  test("renders multiple children", () => {
    const { getByText } = render(
      <Layout>
        <p>first</p>
        <p>second</p>
      </Layout>,
    )
    expect(getByText("first")).toBeDefined()
    expect(getByText("second")).toBeDefined()
  })
})
