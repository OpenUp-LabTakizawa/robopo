import { describe, expect, test } from "bun:test"
import { render } from "@testing-library/react"
import Layout from "@/app/challenge/[competitionId]/[courseId]/layout"

describe("challenge course layout", () => {
  test("renders children", () => {
    const { getByText } = render(
      <Layout>
        <p>child</p>
      </Layout>,
    )
    expect(getByText("child")).toBeDefined()
  })
})
