import { graphql as octokitGraphql } from '@octokit/graphql'
import { GitHubError } from '../errors.js'

type GraphqlRequester = (
    query: string,
    variables: Record<string, unknown>
) => Promise<unknown>

export type ProfileStats = {
    username: string
    name: string
    repositories: number
    followers: number
    totalStars: number
    totalCommits: number
    pullRequests: number
    issues: number
    contributedTo: number
    contributions: number
    includePrivate: boolean
}

export type TopLanguage = {
    name: string
    color: string
    size: number
}

export type GitHubStatsInput = {
    username: string
    includePrivate: boolean
}

export interface GitHubStatsReader {
    getProfileStats(input: GitHubStatsInput): Promise<ProfileStats>
    getTopLanguages(input: GitHubStatsInput): Promise<TopLanguage[]>
}

type GitHubStatsServiceOptions = {
    token?: string
    request?: GraphqlRequester
}

type PageInfo = {
    hasNextPage: boolean
    endCursor: string | null
}

type StatsResponse = {
    user: null | {
        login: string
        name: string | null
        followers: { totalCount: number }
        repositories: {
            totalCount: number
            nodes: Array<{ stargazerCount: number }>
            pageInfo: PageInfo
        }
        pullRequests: { totalCount: number }
        issues: { totalCount: number }
        repositoriesContributedTo: { totalCount: number }
        contributionsCollection: {
            totalCommitContributions: number
        }
    }
}

type LanguagesResponse = {
    user: null | {
        repositories: {
            nodes: Array<{
                languages: {
                    edges: Array<{
                        size: number
                        node: {
                            name: string
                            color: string | null
                        }
                    }>
                }
            }>
            pageInfo: PageInfo
        }
    }
}

const STATS_QUERY = `
query ProfileStats($login: String!, $after: String, $repoPrivacy: RepositoryPrivacy) {
  user(login: $login) {
    login
    name
    followers {
      totalCount
    }
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false, privacy: $repoPrivacy, orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      nodes {
        stargazerCount
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    pullRequests(first: 1) {
      totalCount
    }
    issues(first: 1) {
      totalCount
    }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
      totalCount
    }
    contributionsCollection {
      totalCommitContributions
    }
  }
}
`

const LANGUAGES_QUERY = `
query TopLanguages($login: String!, $after: String, $repoPrivacy: RepositoryPrivacy) {
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false, privacy: $repoPrivacy, orderBy: { field: UPDATED_AT, direction: DESC }) {
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`

export class GitHubStatsService implements GitHubStatsReader {
    private readonly request?: GraphqlRequester

    constructor(options: GitHubStatsServiceOptions = {}) {
        if (options.request) {
            this.request = options.request
            return
        }

        if (options.token) {
            const graphql = octokitGraphql.defaults({
                headers: {
                    authorization: `token ${options.token}`,
                },
            })
            this.request = (query, variables) => graphql(query, variables)
        }
    }

    async getProfileStats(input: GitHubStatsInput): Promise<ProfileStats> {
        const repoPrivacy = input.includePrivate ? null : 'PUBLIC'
        let after: string | null = null
        let totalStars = 0
        let firstPage: StatsResponse | undefined

        do {
            const response: StatsResponse = await this.graphql<StatsResponse>(
                STATS_QUERY,
                {
                    login: input.username,
                    after,
                    repoPrivacy,
                }
            )

            if (!response.user) {
                throw new GitHubError('GitHub user not found')
            }

            firstPage ??= response
            totalStars += response.user.repositories.nodes.reduce(
                (sum, repo) => sum + repo.stargazerCount,
                0
            )
            after = response.user.repositories.pageInfo.hasNextPage
                ? response.user.repositories.pageInfo.endCursor
                : null
        } while (after)

        const user = firstPage?.user
        if (!user) {
            throw new GitHubError('GitHub user not found')
        }

        return {
            username: user.login,
            name: user.name || user.login,
            repositories: user.repositories.totalCount,
            followers: user.followers.totalCount,
            totalStars,
            totalCommits: user.contributionsCollection.totalCommitContributions,
            pullRequests: user.pullRequests.totalCount,
            issues: user.issues.totalCount,
            contributedTo: user.repositoriesContributedTo.totalCount,
            contributions:
                user.contributionsCollection.totalCommitContributions,
            includePrivate: input.includePrivate,
        }
    }

    async getTopLanguages(input: GitHubStatsInput): Promise<TopLanguage[]> {
        const repoPrivacy = input.includePrivate ? null : 'PUBLIC'
        const languages = new Map<string, TopLanguage>()
        let after: string | null = null

        do {
            const response: LanguagesResponse =
                await this.graphql<LanguagesResponse>(LANGUAGES_QUERY, {
                    login: input.username,
                    after,
                    repoPrivacy,
                })

            if (!response.user) {
                throw new GitHubError('GitHub user not found')
            }

            for (const repo of response.user.repositories.nodes) {
                for (const edge of repo.languages.edges) {
                    const existing = languages.get(edge.node.name)
                    languages.set(edge.node.name, {
                        name: edge.node.name,
                        color: edge.node.color ?? '#858585',
                        size: (existing?.size ?? 0) + edge.size,
                    })
                }
            }

            after = response.user.repositories.pageInfo.hasNextPage
                ? response.user.repositories.pageInfo.endCursor
                : null
        } while (after)

        return [...languages.values()].sort((a, b) => b.size - a.size)
    }

    private async graphql<T>(
        query: string,
        variables: Record<string, unknown>
    ): Promise<T> {
        if (!this.request) {
            throw new GitHubError(
                'GitHub token is not configured',
                'Set GH_PAT in the deployment environment.'
            )
        }

        try {
            return (await this.request(query, variables)) as T
        } catch (error) {
            if (error instanceof Error) {
                throw new GitHubError(
                    'GitHub API request failed',
                    error.message
                )
            }

            throw new GitHubError('GitHub API request failed')
        }
    }
}
