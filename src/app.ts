import express from 'express'
import type { Express } from 'express'
import { setErrorSvgHeaders, setSuccessSvgHeaders } from './cache.js'
import { loadConfig, type AppConfig } from './config.js'
import { toDisplayError } from './errors.js'
import { GitHubStatsService, type GitHubStatsReader } from './github/service.js'
import { parseLanguageCardQuery, parseStatsCardQuery } from './query.js'
import { renderErrorCard } from './svg/error-card.js'
import { renderLanguagesCard } from './svg/languages-card.js'
import { renderStatsCard } from './svg/stats-card.js'

type CreateAppOptions = {
    config?: AppConfig
    githubService?: GitHubStatsReader
}

export function createApp(options: CreateAppOptions = {}): Express {
    const config = options.config ?? loadConfig()
    const githubService =
        options.githubService ??
        new GitHubStatsService({ token: config.githubToken })
    const app = express()

    app.get('/', (req, res) => {
        const protocol = req.get('x-forwarded-proto') ?? req.protocol
        const host = req.get('x-forwarded-host') ?? req.get('host')
        const baseUrl = `${protocol}://${host ?? 'localhost:3000'}`

        res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GitHub Stats Generator</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <main>
      <h1>GitHub Stats Generator</h1>
      <p>English-only SVG cards for GitHub READMEs, with original-inspired stats content and a cleaner self-hosted API.</p>
      <section>
        <h2>Profile stats</h2>
        <code>![GitHub stats](${baseUrl}/api/stats.svg?username=D-Naveenz)</code>
        <p>Try themes and options like <code>theme=radical</code>, <code>hide_rank=true</code>, or <code>hide=prs,issues</code>.</p>
        <p><img src="${baseUrl}/api/stats.svg?username=D-Naveenz&theme=radical" alt="GitHub stats card preview" /></p>
      </section>
      <section>
        <h2>Top languages</h2>
        <code>![Top languages](${baseUrl}/api/languages.svg?username=D-Naveenz)</code>
        <div class="preview-row">
          <figure>
            <figcaption>Bar layout</figcaption>
            <img src="${baseUrl}/api/languages.svg?username=D-Naveenz&layout=bar" alt="Top languages bar layout preview" />
          </figure>
          <figure>
            <figcaption>Compact layout</figcaption>
            <img src="${baseUrl}/api/languages.svg?username=D-Naveenz&layout=compact" alt="Top languages compact layout preview" />
          </figure>
        </div>
      </section>
    </main>
  </body>
</html>`)
    })

    app.get('/api/stats.svg', async (req, res) => {
        try {
            const query = parseStatsCardQuery(req.query, config)
            const stats = await githubService.getProfileStats({
                username: query.username,
                includePrivate: query.includePrivate,
            })

            setSuccessSvgHeaders(res, config)
            res.send(renderStatsCard(stats, query.card))
        } catch (error) {
            setErrorSvgHeaders(res, config)
            res.send(
                renderErrorCard(toDisplayError(error), { title: 'Stats Error' })
            )
        }
    })

    app.get('/api/languages.svg', async (req, res) => {
        try {
            const query = parseLanguageCardQuery(req.query, config)
            const languages = await githubService.getTopLanguages({
                username: query.username,
                includePrivate: query.includePrivate,
            })

            setSuccessSvgHeaders(res, config)
            res.send(renderLanguagesCard(languages, query.card))
        } catch (error) {
            setErrorSvgHeaders(res, config)
            res.send(
                renderErrorCard(toDisplayError(error), {
                    title: 'Languages Error',
                })
            )
        }
    })

    app.get('/healthz', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        })
    })

    return app
}

export default createApp()
