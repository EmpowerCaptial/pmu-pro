import { test } from "playwright/test"
import fs from "fs"
import path from "path"
import { crawlAndClick } from "./utils/crawler"

const routes = [
  "/",
  "/pricing", 
  "/auth/login",
  "/dashboard",
  "/clients",
  "/clients/new",
  "/analyze/upload",
  "/settings/connections",
  "/subscriptions",
  "/booking",
  "/admin"
]

test("crawl and click key routes", async ({ page }) => {
  for (const r of routes) await crawlAndClick(page, r, true)
  fs.mkdirSync(path.join(process.cwd(), "reports"), { recursive: true })
  fs.writeFileSync(path.join(process.cwd(), "reports", "crawler.txt"), `Crawled ${routes.length} routes OK`)
})
