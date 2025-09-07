import { defineConfig, devices } from "playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: 2,
  use: { 
    baseURL: "http://localhost:3000", 
    trace: "retain-on-failure", 
    video: "retain-on-failure", 
    screenshot: "only-on-failure" 
  },
  projects: [
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 14"] } }
  ],
})
