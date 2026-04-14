import { expect, test } from "@playwright/test"

test.describe("Home page - Dashboard layout", () => {
  test("displays ROBOPO header with logo", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("header")).toBeVisible()
    await expect(page.getByText("ROBOPO")).toBeVisible()
  })

  test("displays competition selection or active competition", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.getByText("大会を選択", { exact: true })).toBeVisible()
  })

  test("displays judge selection section", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("採点者を選択")).toBeVisible()
  })

  test("displays scoring card for unauthenticated users", async ({ page }) => {
    await page.goto("/")
    // Unauthenticated users see the scoring card
    await expect(page.getByText("採点者を選択")).toBeVisible()
  })
})

test.describe("Home page - Responsive", () => {
  test("scoring UI is visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")
    await expect(page.getByText("採点者を選択")).toBeVisible()
  })
})
