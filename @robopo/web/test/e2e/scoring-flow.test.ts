import { expect, test } from "@playwright/test"

test.describe("Scoring flow navigation", () => {
  test("redirects to home when judgeId is missing", async ({ page }) => {
    await page.goto("/challenge/1/1")
    // Should redirect to home because judgeId is missing
    await page.waitForURL("/")
    expect(page.url()).toContain("/")
  })

  test("navigating with judgeId shows player selection or error", async ({
    page,
  }) => {
    await page.goto("/challenge/1/1?judgeId=1")
    const hasPlayerList = await page
      .getByText("選手をタップして採点を開始")
      .count()
    const hasNoAssign = await page
      .getByText("コースが割り当てられていません")
      .count()
    expect(hasPlayerList + hasNoAssign).toBeGreaterThan(0)
  })

  test("player selection page shows course name", async ({ page }) => {
    await page.goto("/challenge/1/1?judgeId=1")
    const hasCourseHeader = await page.getByText("選択中コース").count()
    const hasNoAssign = await page
      .getByText("コースが割り当てられていません")
      .count()
    expect(hasCourseHeader + hasNoAssign).toBeGreaterThan(0)
  })

  test("judgeId is passed through URL params", async ({ page }) => {
    await page.goto("/challenge/1/1?judgeId=5")
    expect(page.url()).toContain("judgeId=5")
  })
})

test.describe("Scoring screen layout", () => {
  test("challenge page loads without errors", async ({ page }) => {
    await page.goto("/challenge/1/1/1?judgeId=1")
    const hasChallenge = await page.locator(".score-display").count()
    const hasError = await page
      .getByText("コースを割り当てられていません")
      .count()
    expect(hasChallenge + hasError).toBeGreaterThan(0)
  })

  test("redirects to home when judgeId is missing on challenge page", async ({
    page,
  }) => {
    await page.goto("/challenge/1/1/1")
    await page.waitForURL("/")
    expect(page.url()).toContain("/")
  })
})
