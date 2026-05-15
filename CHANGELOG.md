# Changelog

## 0.1.0 - 2026-05-15

Initial usable release.

- Added English-only SVG cards for profile stats and top languages.
- Added clean endpoints: `/api/stats.svg` and `/api/languages.svg`.
- Added GitHub GraphQL access through server-side `GH_PAT`.
- Added opt-in private-visible stats with `PRIVATE_STATS_USERS` allowlist.
- Added built-in themes, hex color overrides, hidden title, and hidden border options.
- Added Vercel-friendly cache headers and SVG error cards.
- Added `.env` support, `.env.example`, VS Code tasks, local dev server entrypoint, and comprehensive README documentation.
- Added TypeScript, Vitest, Supertest, renderer tests, route tests, query validation tests, and GitHub service tests.
