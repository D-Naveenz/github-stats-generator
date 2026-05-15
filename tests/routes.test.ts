import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import type { GitHubStatsReader } from '../src/github/service.js'

const config = loadConfig({
    NODE_ENV: 'production',
    GH_PAT: 'token',
    PRIVATE_STATS_USERS: 'octocat',
})

const fakeService: GitHubStatsReader = {
    async getProfileStats(input) {
        return {
            username: input.username,
            name: 'Octocat',
            repositories: 1,
            followers: 2,
            totalStars: 3,
            totalCommits: 6,
            pullRequests: 4,
            issues: 5,
            contributedTo: 7,
            contributions: 6,
            includePrivate: input.includePrivate,
        }
    },
    async getTopLanguages() {
        return [{ name: 'TypeScript', color: '#3178c6', size: 100 }]
    },
}

function responseText(response: request.Response): string {
    return response.text ?? Buffer.from(response.body).toString('utf8')
}

describe('routes', () => {
    it('serves stats SVG with cache headers', async () => {
        const app = createApp({ config, githubService: fakeService })
        const response = await request(app).get(
            '/api/stats.svg?username=octocat'
        )

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toContain('image/svg+xml')
        expect(response.headers['cache-control']).toContain('s-maxage=86400')
        expect(responseText(response)).toContain('Octocat&apos;s GitHub Stats')
        expect(responseText(response)).toContain('Total Commits')
        expect(responseText(response)).toContain('data-testid="rank-circle"')
    })

    it('serves languages SVG', async () => {
        const app = createApp({ config, githubService: fakeService })
        const response = await request(app).get(
            '/api/languages.svg?username=octocat'
        )

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toContain('image/svg+xml')
        expect(responseText(response)).toContain('TypeScript')
    })

    it('returns an SVG error for bad card requests', async () => {
        const app = createApp({ config, githubService: fakeService })
        const response = await request(app).get('/api/stats.svg')

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toContain('image/svg+xml')
        expect(response.headers['cache-control']).toContain('s-maxage=600')
        expect(responseText(response)).toContain('Missing or invalid username')
    })

    it('serves health JSON', async () => {
        const app = createApp({ config, githubService: fakeService })
        const response = await request(app).get('/healthz')

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('ok')
    })
})
