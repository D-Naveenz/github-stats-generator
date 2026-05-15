# Changelog

## 0.2.0 - 2026-05-15

- Upgraded the stats card to an original-inspired stat list inside this project's rounded frame.
- Added stat icons, bold stat values, default rank circle, and rank calculation.
- Added stats-card options for `show_icons`, `hide_rank`, `line_height`, `icon_color`, `ring_color`, and `hide`.
- Added core original-inspired themes: `radical`, `merko`, `gruvbox`, `onedark`, and `cobalt`.
- Extended GitHub stats fetching with contribution commit count and contributed repository count.
- Polished stats-card layout with fixed stat/value columns, dynamic card dimensions, centered rank text, tighter rank placement, and balanced padding.

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
