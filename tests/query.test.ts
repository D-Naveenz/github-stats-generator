import { describe, expect, it } from 'vitest'
import { loadConfig } from '../src/config.js'
import { parseLanguageCardQuery, parseStatsCardQuery } from '../src/query.js'

const baseConfig = loadConfig({
    NODE_ENV: 'test',
    GITHUB_TOKEN: 'token',
    PRIVATE_STATS_USERS: 'octocat',
})

describe('query parsing', () => {
    it('loads token and private stats allowlist from environment values', () => {
        const config = loadConfig({
            NODE_ENV: 'development',
            GITHUB_TOKEN: 'test-token',
            PRIVATE_STATS_USERS: ' Octocat, D-Naveenz ',
        })

        expect(config.githubToken).toBe('test-token')
        expect(config.privateStatsUsers.has('octocat')).toBe(true)
        expect(config.privateStatsUsers.has('d-naveenz')).toBe(true)
    })

    it('requires a valid username', () => {
        expect(() => parseStatsCardQuery({}, baseConfig)).toThrow(
            'Missing or invalid username'
        )
        expect(() =>
            parseStatsCardQuery({ username: '-bad' }, baseConfig)
        ).toThrow('Missing or invalid username')
    })

    it('parses booleans and colors', () => {
        const query = parseStatsCardQuery(
            {
                username: 'octocat',
                hide_border: 'true',
                hide_title: '0',
                title_color: 'ff0000',
                icon_color: '00ff00',
                ring_color: '#0000ff',
            },
            baseConfig
        )

        expect(query.card.hideBorder).toBe(true)
        expect(query.card.hideTitle).toBe(false)
        expect(query.card.titleColor).toBe('#ff0000')
        expect(query.card.iconColor).toBe('#00ff00')
        expect(query.card.ringColor).toBe('#0000ff')
        expect(query.card.showIcons).toBe(true)
        expect(query.card.hideRank).toBe(false)
        expect(query.card.lineHeight).toBe(25)
    })

    it('parses stats-card visual options', () => {
        const query = parseStatsCardQuery(
            {
                username: 'octocat',
                show_icons: 'false',
                hide_rank: 'true',
                line_height: '30',
                hide: 'prs,issues',
            },
            baseConfig
        )

        expect(query.card.showIcons).toBe(false)
        expect(query.card.hideRank).toBe(true)
        expect(query.card.lineHeight).toBe(30)
        expect(query.card.hide).toEqual(['prs', 'issues'])
    })

    it('rejects invalid colors', () => {
        expect(() =>
            parseStatsCardQuery(
                { username: 'octocat', text_color: 'purple' },
                baseConfig
            )
        ).toThrow('text_color must be a 6-digit hex color')
    })

    it('rejects invalid stat keys', () => {
        expect(() =>
            parseStatsCardQuery(
                { username: 'octocat', hide: 'stars,nope' },
                baseConfig
            )
        ).toThrow('hide must contain only')
    })

    it('allows private stats only for allowlisted users', () => {
        expect(
            parseStatsCardQuery(
                { username: 'octocat', include_private: 'true' },
                baseConfig
            ).includePrivate
        ).toBe(true)

        expect(() =>
            parseStatsCardQuery(
                { username: 'someone-else', include_private: 'true' },
                baseConfig
            )
        ).toThrow('Private stats are not enabled for this username')
    })

    it('parses language layout and limit', () => {
        const query = parseLanguageCardQuery(
            { username: 'octocat', layout: 'compact', limit: '4' },
            baseConfig
        )

        expect(query.card.layout).toBe('compact')
        expect(query.card.limit).toBe(4)
    })
})
