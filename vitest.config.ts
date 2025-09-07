import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setupTests.ts"],
    globals: true,
    css: true,
    coverage: { 
      reporter: ["text", "html"], 
      lines: 85, 
      functions: 85, 
      statements: 85, 
      branches: 80 
    }
  }
})
