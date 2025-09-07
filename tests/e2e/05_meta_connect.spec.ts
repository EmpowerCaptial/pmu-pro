import { test, expect } from "playwright/test"

test("connect/disconnect Meta mocked", async ({ page }) => {
  await page.goto("/settings/connections")
  await page.click("[data-testid='meta-connect-btn']")
  await expect(page.getByText(/connected/i)).toBeVisible()
  await page.click("[data-testid='meta-disconnect-btn']")
  await expect(page.getByText(/disconnected/i)).toBeVisible()
})
