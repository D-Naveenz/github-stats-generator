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

    app.get('/', (_req, res) => {
        const baseUrl = 'https://github-stats-generator-green.vercel.app'

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
      <p>English-only SVG cards for GitHub READMEs.</p>
      <section>
        <h2>Profile stats</h2>
        <code>![GitHub stats](${baseUrl}/api/stats.svg?username=D-Naveenz)</code>
      </section>
      <section>
        <h2>Top languages</h2>
        <code>![Top languages](${baseUrl}/api/languages.svg?username=D-Naveenz)</code>
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
