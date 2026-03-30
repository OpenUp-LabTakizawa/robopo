import { cleanup, render, within } from "@testing-library/react"
import { afterEach, describe, expect, test } from "bun:test"
import { ThreeTabs } from "@/app/components/parts/threeTabs"

afterEach(cleanup)

const defaultProps = {
  tab1Title: "Tab1",
  tab1: <div>Content1</div>,
  tab2Title: "Tab2",
  tab2: <div>Content2</div>,
  tab3Title: "Tab3",
  tab3: <div>Content3</div>,
}

describe("ThreeTabs", () => {
  test("renders both desktop and mobile layouts in DOM", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const desktop = container.querySelector(".md\\:flex")
    expect(desktop).toBeTruthy()
    const mobile = container.querySelector(".md\\:hidden")
    expect(mobile).toBeTruthy()
  })

  test("desktop layout contains all tab titles as level-1 headings", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const desktop = container.querySelector(".md\\:flex")!
    const headings = within(desktop).getAllByRole("heading", { level: 1 })
    expect(headings).toHaveLength(3)
    const texts = headings.map((h) => h.textContent)
    expect(texts).toEqual(expect.arrayContaining(["Tab1", "Tab2", "Tab3"]))
  })

  test("desktop layout contains all tab contents", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const desktop = container.querySelector(".md\\:flex")!
    expect(desktop.textContent).toContain("Content1")
    expect(desktop.textContent).toContain("Content2")
    expect(desktop.textContent).toContain("Content3")
  })

  test("mobile layout renders radio tabs", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const mobile = container.querySelector(".md\\:hidden")!
    const radios = within(mobile).getAllByRole("tab")
    expect(radios).toHaveLength(3)
  })

  test("first tab is checked by default in mobile layout", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const mobile = container.querySelector(".md\\:hidden")!
    const radios = mobile.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    expect(radios[0].defaultChecked).toBe(true)
    expect(radios[1].defaultChecked).toBe(false)
    expect(radios[2].defaultChecked).toBe(false)
  })

  test("renders icons when provided", () => {
    const icon = <span data-testid="icon">★</span>
    const { container } = render(
      <ThreeTabs {...defaultProps} tab1Icon={icon} />,
    )
    const icons = container.querySelectorAll('[data-testid="icon"]')
    expect(icons.length).toBeGreaterThanOrEqual(2)
  })

  test("mobile radio inputs use unique name per instance", () => {
    const { container } = render(
      <>
        <ThreeTabs {...defaultProps} />
        <ThreeTabs {...defaultProps} />
      </>,
    )
    const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    const names = new Set(Array.from(radios).map((r) => r.name))
    // Two instances should produce two distinct radio group names
    expect(names.size).toBe(2)
  })

  test("both layouts are always in DOM (CSS-only responsive)", () => {
    const { container } = render(<ThreeTabs {...defaultProps} />)
    const desktop = container.querySelector(".md\\:flex")
    const mobile = container.querySelector(".md\\:hidden")
    expect(desktop).toBeTruthy()
    expect(mobile).toBeTruthy()
  })
})
