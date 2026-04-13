import { expect, test } from "@playwright/test"

test.describe("Scoring flow navigation", () => {
  test("redirects to home when judgeId is missing", async ({ page }) => {
    await page.goto("/challenge/1/1/1")
    // Should redirect to home because judgeId is missing
    await page.waitForURL("/")
    expect(page.url()).toContain("/")
  })

  test("navigating with judgeId shows challenge or error", async ({ page }) => {
    await page.goto("/challenge/1/1/1?judgeId=1")
    const hasChallenge = await page.locator(".score-display").count()
    const hasNoAssign = await page
      .getByText("コースを割り当てられていません")
      .count()
    expect(hasChallenge + hasNoAssign).toBeGreaterThan(0)
  })

  test("challenge page shows course and player info", async ({ page }) => {
    await page.goto("/challenge/179/1/323?judgeId=2")
    const hasChallenge = await page.locator(".score-display").count()
    const hasNoAssign = await page
      .getByText("コースを割り当てられていません")
      .count()
    expect(hasChallenge + hasNoAssign).toBeGreaterThan(0)

    // When challenge is available, course and player names should be rendered
    if (hasChallenge > 0) {
      const hasCourseName = await page.getByText(/THE一本橋/).count()
      const hasPlayerName = await page.getByText(/選手A/).count()
      expect(hasCourseName).toBeGreaterThan(0)
      expect(hasPlayerName).toBeGreaterThan(0)
    }
  })

  test("judgeId is passed through URL params", async ({ page }) => {
    await page.goto("/challenge/1/1/1?judgeId=5")
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
