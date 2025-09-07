# QA Report — thepmuguide.com

## Summary
- Build: ✅/❌
- Unit/Integration: coverage (lines/functions/branches/statements): __ / __ / __ / __
- E2E: ✅/❌ (traces/videos attached)
- Lighthouse (Desktop/Mobile): Perf __ / A11y __ / Best __ / SEO __

## Issues Fixed
- <before/after, file paths, commits>

## Security / Perf / A11y Remediations
- …

## Remaining Risks / TODOs
- …

## How to Reproduce & Run

### Local Development
```bash
pnpm install
pnpm dev
```

### Testing
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# All tests
pnpm test:all

# Lighthouse CI
pnpm lighthouse:ci
```

### Build & Deploy
```bash
pnpm build
pnpm start
```

## Test Coverage Report
- Coverage reports available in `./coverage/`
- E2E reports in `./playwright-report/`
- Lighthouse reports in `./reports/lighthouse/`
- Crawler results in `./reports/crawler.txt`
