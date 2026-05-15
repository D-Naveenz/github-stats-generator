import { XMLParser } from 'fast-xml-parser'
import { describe, expect, it } from 'vitest'
import { renderErrorCard } from '../src/svg/error-card.js'
import { renderLanguagesCard } from '../src/svg/languages-card.js'
import { renderStatsCard } from '../src/svg/stats-card.js'

const parser = new XMLParser({ ignoreAttributes: false })

function expectValidSvg(svg: string): void {
    expect(() => parser.parse(svg)).not.toThrow()
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
}

const cardOptions = {
    theme: 'default' as const,
    hideBorder: false,
    hideTitle: false,
}

describe('SVG renderers', () => {
    it('renders a valid stats card', () => {
        const svg = renderStatsCard(
            {
                username: 'octocat',
                name: 'Octocat',
                repositories: 8,
                followers: 1200,
                totalStars: 42,
                pullRequests: 100,
                issues: 12,
                contributions: 365,
                includePrivate: false,
            },
            cardOptions
        )

        expectValidSvg(svg)
        expect(svg).toContain('Octocat&apos;s GitHub Stats')
        expect(svg).toContain('Public Repos')
    })

    it('renders a valid languages card', () => {
        const svg = renderLanguagesCard(
            [
                { name: 'TypeScript', color: '#3178c6', size: 70 },
                { name: 'JavaScript', color: '#f1e05a', size: 30 },
            ],
            { ...cardOptions, layout: 'bar', limit: 6 }
        )

        expectValidSvg(svg)
        expect(svg).toContain('TypeScript')
        expect(svg).toContain('70.0%')
    })

    it('renders a valid error card', () => {
        const svg = renderErrorCard(
            {
                message: 'Missing username',
                secondaryMessage: 'Try username=octocat',
            },
            { title: 'Stats Error' }
        )

        expectValidSvg(svg)
        expect(svg).toContain('Missing username')
    })

    it('escapes dangerous text', () => {
        const svg = renderStatsCard(
            {
                username: 'octocat',
                name: '<script>alert(1)</script>',
                repositories: 1,
                followers: 1,
                totalStars: 1,
                pullRequests: 1,
                issues: 1,
                contributions: 1,
                includePrivate: false,
            },
            cardOptions
        )

        expect(svg).toContain('&lt;script&gt;')
        expect(svg).not.toContain('<script>')
    })
})
