# GitHub Stats Generator

English-only SVG GitHub stats cards for profile READMEs.

This project is a smaller, modern alternative inspired by GitHub Readme Stats. It focuses on reliable self-hosted README cards, simple URLs, typed TypeScript internals, and a deliberately small feature surface.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [GitHub Stats Card](#github-stats-card)
- [Top Languages Card](#top-languages-card)
- [Themes and Styling](#themes-and-styling)
- [Private Stats](#private-stats)
- [Caching](#caching)
- [Self-Hosting](#self-hosting)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [What V1 Does Not Support](#what-v1-does-not-support)

## Features

- Profile stats card as SVG.
- Top languages card as SVG.
- English-only labels.
- Built-in themes: `default`, `dark`, `github`, and `tokyonight`.
- Hex color overrides for title, text, background, and border.
- Optional hidden title and border.
- Public stats by default.
- Private-visible stats only when explicitly requested and allowlisted by the deployment owner.
- GitHub GraphQL API access through a server-side `GH_PAT`.
- Vercel-friendly cache headers.
- SVG error cards instead of JSON errors for README embeds.

## Quick Start

Use the hosted deployment URL, replacing `D-Naveenz` with the GitHub username you want to display:

```md
![GitHub stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz)
![Top languages](https://github-stats-generator-green.vercel.app/api/languages.svg?username=D-Naveenz)
```

Use standard Markdown image syntax, or wrap the image in a link:

```md
[![GitHub stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz)](https://github.com/D-Naveenz)
```

## GitHub Stats Card

Endpoint:

```txt
/api/stats.svg?username=<github-login>
```

Example:

```md
![GitHub stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&theme=tokyonight)
```

The stats card displays:

- Display name or login.
- Repository count.
- Followers.
- Total stars across owned non-fork repositories.
- Pull request count.
- Issue count.
- Contribution calendar total.

### Stats Card Options

| Parameter         | Required | Values                                    | Default     | Description                                                    |
| ----------------- | -------- | ----------------------------------------- | ----------- | -------------------------------------------------------------- |
| `username`        | Yes      | GitHub login                              | none        | User to render stats for.                                      |
| `theme`           | No       | `default`, `dark`, `github`, `tokyonight` | `default`   | Built-in card theme.                                           |
| `title_color`     | No       | 6-digit hex                               | theme value | Header text color.                                             |
| `text_color`      | No       | 6-digit hex                               | theme value | Main text color.                                               |
| `bg_color`        | No       | 6-digit hex                               | theme value | Card background color.                                         |
| `border_color`    | No       | 6-digit hex                               | theme value | Card border color.                                             |
| `hide_border`     | No       | `true`, `false`                           | `false`     | Hides the border when true.                                    |
| `hide_title`      | No       | `true`, `false`                           | `false`     | Hides the card title when true.                                |
| `include_private` | No       | `true`, `false`                           | `false`     | Requests private-visible data, only for allowlisted usernames. |

## Top Languages Card

Endpoint:

```txt
/api/languages.svg?username=<github-login>
```

Example:

```md
![Top languages](https://github-stats-generator-green.vercel.app/api/languages.svg?username=D-Naveenz&layout=compact&limit=8)
```

The languages card aggregates language byte sizes from owned, non-fork repositories and sorts languages by total size.

### Language Layouts

Bar layout, the default:

```md
![Top languages](https://github-stats-generator-green.vercel.app/api/languages.svg?username=D-Naveenz&layout=bar)
```

Compact layout:

```md
![Top languages](https://github-stats-generator-green.vercel.app/api/languages.svg?username=D-Naveenz&layout=compact)
```

### Language Card Options

| Parameter         | Required | Values                                    | Default     | Description                                                    |
| ----------------- | -------- | ----------------------------------------- | ----------- | -------------------------------------------------------------- |
| `username`        | Yes      | GitHub login                              | none        | User to render languages for.                                  |
| `layout`          | No       | `bar`, `compact`                          | `bar`       | Language card layout.                                          |
| `limit`           | No       | integer from `1` to `12`                  | `6`         | Maximum number of languages to show.                           |
| `theme`           | No       | `default`, `dark`, `github`, `tokyonight` | `default`   | Built-in card theme.                                           |
| `title_color`     | No       | 6-digit hex                               | theme value | Header text color.                                             |
| `text_color`      | No       | 6-digit hex                               | theme value | Main text color.                                               |
| `bg_color`        | No       | 6-digit hex                               | theme value | Card background color.                                         |
| `border_color`    | No       | 6-digit hex                               | theme value | Card border color.                                             |
| `hide_border`     | No       | `true`, `false`                           | `false`     | Hides the border when true.                                    |
| `hide_title`      | No       | `true`, `false`                           | `false`     | Hides the card title when true.                                |
| `include_private` | No       | `true`, `false`                           | `false`     | Requests private-visible data, only for allowlisted usernames. |

## Themes and Styling

Use the `theme` query parameter:

```md
![GitHub stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&theme=dark)
![GitHub stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&theme=github)
![GitHub stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&theme=tokyonight)
```

Supported themes:

| Theme        | Description                                 |
| ------------ | ------------------------------------------- |
| `default`    | Light GitHub-inspired card.                 |
| `dark`       | Dark card using GitHub dark-style colors.   |
| `github`     | Soft GitHub panel style with green accent.  |
| `tokyonight` | Dark blue/purple Tokyo Night-style palette. |

You can override theme colors with 6-digit hex colors, with or without `#`:

```md
![Custom stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&title_color=ffffff&text_color=c9d1d9&bg_color=0d1117&border_color=30363d)
```

GitHub README images can use theme fragments for light and dark mode:

```md
![Stats dark](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&theme=dark#gh-dark-mode-only)
![Stats light](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&theme=default#gh-light-mode-only)
```

## Private Stats

Public stats are the default and are safe for any requested username.

Private-visible stats require all of the following:

- The deployment has a `GH_PAT`.
- The requested URL includes `include_private=true`.
- The requested username is listed in `PRIVATE_STATS_USERS`.
- The configured token can actually see the requested private data.

Example:

```md
![Private-aware stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz&include_private=true)
```

Important behavior:

- Your PAT cannot read another user's private repositories or private contributions unless GitHub grants that token access.
- If `include_private=true` is requested for a username not in `PRIVATE_STATS_USERS`, the endpoint returns an SVG error card.
- This project does not accept PATs in query parameters.

## Caching

SVG cards are designed for README embeds and CDN caching.

Success responses use:

```txt
Cache-Control: public, max-age=0, s-maxage=86400, stale-while-revalidate=86400
```

Error responses use shorter CDN caching:

```txt
Cache-Control: public, max-age=0, s-maxage=600, stale-while-revalidate=86400
```

In `NODE_ENV=development`, caching is disabled.

GitHub may also proxy and cache README images through its own image infrastructure, so updates may not appear instantly in profile READMEs.

## Self-Hosting

The project is designed for Vercel, but it is a standard Express app and can run anywhere Node.js is supported.

### Vercel

1. Fork or clone this repository.
2. Import it into Vercel.
3. Add `GH_PAT` in the Vercel project environment variables.
4. Optionally add `PRIVATE_STATS_USERS`.
5. Deploy from the main branch.

The exported Express app lives in `src/index.ts`, which Vercel can use as the server entry.

### GitHub PAT

Use a fine-grained or classic GitHub Personal Access Token as the server-side `GH_PAT`.

Recommended minimum:

- Read-only access.
- Public repository data for public-only cards.
- Private repository read access only if you want private-visible stats for allowlisted usernames.

Do not expose the token in README URLs, frontend code, screenshots, or committed files.

## Local Development

Install dependencies:

```powershell
pnpm install
```

Create a local `.env` from `.env.example`:

```env
GH_PAT=github_pat_your_token_here
PRIVATE_STATS_USERS=D-Naveenz
PORT=3000
```

Run locally:

```powershell
pnpm dev
```

Open:

```txt
http://localhost:3000
http://localhost:3000/healthz
http://localhost:3000/api/stats.svg?username=D-Naveenz
http://localhost:3000/api/languages.svg?username=D-Naveenz
```

Validate:

```powershell
pnpm build
pnpm typecheck
pnpm test
pnpm format:check
```

VS Code tasks are included for development, testing, formatting, and full validation.

## Environment Variables

| Variable              | Required                 | Example             | Description                                                          |
| --------------------- | ------------------------ | ------------------- | -------------------------------------------------------------------- |
| `GH_PAT`              | Yes for live GitHub data | `github_pat_...`    | Server-side GitHub token used for GraphQL API calls.                 |
| `PRIVATE_STATS_USERS` | No                       | `D-Naveenz,octocat` | Comma-separated usernames allowed to request `include_private=true`. |
| `PORT`                | No                       | `3000`              | Local dev server port.                                               |
| `NODE_ENV`            | No                       | `development`       | Disables cache headers when set to `development`.                    |

## What V1 Does Not Support

V1 intentionally does not support:

- Multilingual labels.
- Repo pin cards.
- Gist cards.
- WakaTime cards.
- Rank calculation.
- Icon toggles.
- Legacy `github-readme-stats` route or parameter compatibility.
- Passing GitHub tokens through query parameters.
- Per-request private stats for arbitrary users.

These limits keep the implementation smaller, safer, and easier to operate.
