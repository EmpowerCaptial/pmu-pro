import { test, expect } from "playwright/test"

test("beta email form validates", async ({ page }) => {
  await page.goto("/")
  await page.fill("[data-testid='beta-email-input']", "not-an-email")
  await page.click("[data-testid='beta-email-submit']")
  // assert validation message in your app (placeholder)
  await expect(page.locator("text=invalid email")).toBeVisible()
})
