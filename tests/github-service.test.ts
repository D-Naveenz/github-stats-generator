import { describe, expect, it } from 'vitest'
import { GitHubStatsService } from '../src/github/service.js'

describe('GitHubStatsService', () => {
    it('maps public profile stats', async () => {
        const service = new GitHubStatsService({
            request: async () => ({
                user: {
                    login: 'octocat',
                    name: 'Octocat',
                    followers: { totalCount: 10 },
                    repositories: {
                        totalCount: 2,
                        nodes: [{ stargazerCount: 3 }, { stargazerCount: 7 }],
                        pageInfo: { hasNextPage: false, endCursor: null },
                    },
                    pullRequests: { totalCount: 11 },
                    issues: { totalCount: 12 },
                    contributionsCollection: {
                        contributionCalendar: { totalContributions: 13 },
                    },
                },
            }),
        })

        await expect(
            service.getProfileStats({
                username: 'octocat',
                includePrivate: false,
            })
        ).resolves.toMatchObject({
            username: 'octocat',
            totalStars: 10,
            repositories: 2,
            includePrivate: false,
        })
    })

    it('throws a readable error when the user is missing', async () => {
        const service = new GitHubStatsService({
            request: async () => ({ user: null }),
        })

        await expect(
            service.getProfileStats({
                username: 'missing',
                includePrivate: false,
            })
        ).rejects.toThrow('GitHub user not found')
    })

    it('aggregates and sorts languages', async () => {
        const service = new GitHubStatsService({
            request: async () => ({
                user: {
                    repositories: {
                        nodes: [
                            {
                                languages: {
                                    edges: [
                                        {
                                            size: 10,
                                            node: {
                                                name: 'TypeScript',
                                                color: '#3178c6',
                                            },
                                        },
                                        {
                                            size: 20,
                                            node: {
                                                name: 'Rust',
                                                color: '#dea584',
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                languages: {
                                    edges: [
                                        {
                                            size: 15,
                                            node: {
                                                name: 'TypeScript',
                                                color: '#3178c6',
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                        pageInfo: { hasNextPage: false, endCursor: null },
                    },
                },
            }),
        })

        await expect(
            service.getTopLanguages({
                username: 'octocat',
                includePrivate: false,
            })
        ).resolves.toEqual([
            { name: 'TypeScript', color: '#3178c6', size: 25 },
            { name: 'Rust', color: '#dea584', size: 20 },
        ])
    })

    it('wraps API failures', async () => {
        const service = new GitHubStatsService({
            request: async () => {
                throw new Error('rate limit exceeded')
            },
        })

        await expect(
            service.getTopLanguages({
                username: 'octocat',
                includePrivate: false,
            })
        ).rejects.toThrow('GitHub API request failed')
    })
})
