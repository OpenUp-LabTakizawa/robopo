import { expect, test } from "@playwright/test"

const title: RegExp = /ROBOPO/

test("has title", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(title)
})
