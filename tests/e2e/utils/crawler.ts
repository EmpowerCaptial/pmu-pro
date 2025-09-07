import { Page, expect } from "playwright/test"

export async function crawlAndClick(page: Page, route: string, ignoreDestructive = true) {
  const errors: string[] = []
  page.on("pageerror", e => errors.push(`pageerror: ${e.message}`))
  page.on("console", msg => { 
    if (["error","warn"].includes(msg.type())) {
      errors.push(`console.${msg.type()}: ${msg.text()}`)
    }
  })

  await page.goto(route, { waitUntil: "networkidle" })
  const selectors = [
    "[role='button']",
    "a[href]",
    "button",
    "[data-testid]",
    "[type='submit']",
    "[role='menuitem']"
  ]
  const elements = await page.locator(selectors.join(",")).elementHandles()

  for (const el of elements) {
    const dtid = await el.getAttribute("data-testid")
    const destructive = await el.getAttribute("data-destructive")
    if (ignoreDestructive && destructive === "true") continue
    try {
      await el.scrollIntoViewIfNeeded()
      await el.click({ trial: true }).catch(() => {})
      await el.click({ delay: 10 })
      // allow navigation or state settle
      await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {})
    } catch (e: any) {
      errors.push(`click failed on ${dtid ?? "<no-testid>"}: ${e.message}`)
    }
  }

  expect(errors, errors.join("\n")).toEqual([])
}
