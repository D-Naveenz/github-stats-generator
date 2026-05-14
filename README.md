# GitHub Stats Generator

English-only SVG GitHub stats cards for profile READMEs.

## Endpoints

```md
![GitHub stats](https://github-stats-generator-green.vercel.app/api/stats.svg?username=D-Naveenz)
![Top languages](https://github-stats-generator-green.vercel.app/api/languages.svg?username=D-Naveenz)
```

## Options

Shared options:

- `username` is required.
- `theme`: `default`, `dark`, `github`, or `tokyonight`.
- `title_color`, `text_color`, `bg_color`, `border_color`: 6-digit hex colors.
- `hide_border`, `hide_title`: `true` or `false`.
- `include_private`: requires the username to be listed in `PRIVATE_STATS_USERS`.

Language card options:

- `layout`: `bar` or `compact`.
- `limit`: integer from `1` to `12`, default `6`.

## Environment

- `GITHUB_TOKEN`: server-side token used for GitHub API requests.
- `PRIVATE_STATS_USERS`: comma-separated usernames allowed to request `include_private=true`.

For local development, create a `.env` file from `.env.example`:

```env
GITHUB_TOKEN=github_pat_your_token_here
PRIVATE_STATS_USERS=D-Naveenz
PORT=3000
```

Use a fine-grained GitHub PAT with read-only access for the data you want the cards to see. Public-only cards still use the token for GraphQL access and rate limits.

## Local Commands

```powershell
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm format:check
```
