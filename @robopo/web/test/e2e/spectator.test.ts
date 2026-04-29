import { expect, test } from "@playwright/test"

test.describe("Spectator page - basic rendering", () => {
  test("renders the page without console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))

    await page.goto("/spectator")
    // The fixed-overlay container should mount.
    await expect(page.locator("body")).toBeVisible()

    // Wait for client hydration + initial snapshot.
    await page.waitForTimeout(1500)
    expect(errors).toEqual([])
  })

  test("displays the spectator floating control with ROBOPO logo", async ({
    page,
  }) => {
    await page.goto("/spectator")
    await expect(
      page.getByRole("link", { name: "ROBOPO", exact: true }),
    ).toBeVisible()
  })

  test("ROBOPO link navigates back to the home page", async ({ page }) => {
    await page.goto("/spectator")
    await page.getByRole("link", { name: "ROBOPO", exact: true }).click()
    await page.waitForURL("/")
    expect(page.url()).not.toContain("/spectator")
  })
})

test.describe("Spectator page - theme selector", () => {
  test("URL ?theme= initializes the requested theme", async ({ page }) => {
    await page.goto("/spectator?theme=cyberpunk")
    // Theme selector reflects the chosen value
    await expect(
      page.locator("select").filter({ hasText: "サイバーパンク" }),
    ).toBeVisible({ timeout: 5000 })
  })

  test("changing the theme persists in the URL", async ({ page }) => {
    await page.goto("/spectator?theme=esports")
    const themeSelects = page.locator("select")
    // The last select on the page is the theme selector
    const themeSelect = themeSelects.last()
    await themeSelect.selectOption("hero")
    await expect(page).toHaveURL(/theme=hero/)
  })
})

test.describe("Spectator page - player focus", () => {
  test("clicking a leaderboard row opens the player-focus panel", async ({
    page,
  }) => {
    await page.goto("/spectator?theme=esports")
    // Wait for snapshot to populate the leaderboard.
    await page.waitForTimeout(1500)

    const firstRow = page.locator('div[role="button"]').first()
    const rowExists = await firstRow.count()
    if (rowExists === 0) {
      test.skip(true, "No players in seed data — cannot test focus panel.")
      return
    }

    await firstRow.click()
    // Player-focus panel shows "選手フォーカス" header.
    await expect(page.getByText("選手フォーカス")).toBeVisible({
      timeout: 3000,
    })
    // Close button restores the highlight panel.
    await page.getByRole("button", { name: /閉じる/ }).click()
    await expect(page.getByText("選手フォーカス")).not.toBeVisible()
  })

  test("clicking 他の選手を探す opens the search dialog", async ({ page }) => {
    await page.goto("/spectator?theme=esports")
    await page.waitForTimeout(1500)

    const firstRow = page.locator('div[role="button"]').first()
    if ((await firstRow.count()) === 0) {
      test.skip(true, "No players in seed data — cannot reach the dialog.")
      return
    }

    await firstRow.click()
    await page.getByRole("button", { name: /他の選手を探す/ }).click()
    await expect(page.getByRole("dialog", { name: "選手検索" })).toBeVisible()
    // Close via ESC
    await page.keyboard.press("Escape")
    await expect(
      page.getByRole("dialog", { name: "選手検索" }),
    ).not.toBeVisible()
  })
})

test.describe("Spectator page - mobile layout", () => {
  test("renders on mobile viewport without errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))

    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/spectator?theme=esports")
    await page.waitForTimeout(1500)

    expect(errors).toEqual([])
    await expect(
      page.getByRole("link", { name: "ROBOPO", exact: true }),
    ).toBeVisible()
  })
})
