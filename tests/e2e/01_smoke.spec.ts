import { test, expect } from "playwright/test"

test("landing → get started → login", async ({ page }) => {
  await page.goto("/")
  await page.click("[data-testid='landing-cta-get-started']")
  await expect(page).toHaveURL(/auth\/login|dashboard/)
})
