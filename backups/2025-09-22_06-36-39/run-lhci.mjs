import { execSync } from "node:child_process"

try {
  execSync("npx @lhci/cli autorun --upload.target=filesystem --collect.numberOfRuns=1", { stdio: "inherit" })
} catch (e) { 
  process.exit(1) 
}
