# Changelog

## 0.3.0 - 2026-05-19

Documentation and language-card polish release.

- Added README live demos for all three visible card surfaces: stats, top languages bar layout, and top languages compact layout.
- Updated the homepage to preview both language-card layouts side by side using the current request host.
- Refined language-card layout with shared SVG layout metrics, visible padding bounds, longer bars, aligned percentages, and clearer row spacing.
- Added `tsx watch` hot reload for local development while preserving the compiled runtime path as `pnpm dev:compiled`.
- Added renderer and route regression tests for language-card dimensions, escaping, homepage demo URLs, and Vercel-compatible app exports.

## 0.2.4 - 2026-05-19

Bugfix release.

- Standardized the deployment token environment variable as `GITHUB_TOKEN`.
- Fixed Vercel Express template compatibility by default-exporting the Express app from `src/app.ts`.
- Added explicit Vercel routing with `vercel.json`.
- Added `.vercelignore` for local-only and generated artifacts.
- Kept v0.2 stats-card rendering behavior unchanged.

## 0.2.0 - 2026-05-15

- Upgraded the stats card to an original-inspired stat list inside this project's rounded frame.
- Added stat icons, bold stat values, default rank circle, and rank calculation.
- Added stats-card options for `show_icons`, `hide_rank`, `line_height`, `icon_color`, `ring_color`, and `hide`.
- Added core original-inspired themes: `radical`, `merko`, `gruvbox`, `onedark`, and `cobalt`.
- Extended GitHub stats fetching with contribution commit count and contributed repository count.
- Polished stats-card layout with fixed stat/value columns, dynamic card dimensions, centered rank text, tighter rank placement, and balanced padding.
- Fixed Vercel Express template compatibility by default-exporting the Express app from `src/app.ts`.

## 0.1.0 - 2026-05-15

Initial usable release.

- Added English-only SVG cards for profile stats and top languages.
- Added clean endpoints: `/api/stats.svg` and `/api/languages.svg`.
- Added GitHub GraphQL access through server-side `GITHUB_TOKEN`.
- Added opt-in private-visible stats with `PRIVATE_STATS_USERS` allowlist.
- Added built-in themes, hex color overrides, hidden title, and hidden border options.
- Added Vercel-friendly cache headers and SVG error cards.
- Added `.env` support, `.env.example`, VS Code tasks, local dev server entrypoint, and comprehensive README documentation.
- Added TypeScript, Vitest, Supertest, renderer tests, route tests, query validation tests, and GitHub service tests.
