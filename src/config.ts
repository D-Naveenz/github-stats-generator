export type AppConfig = {
    githubToken?: string
    nodeEnv: string
    privateStatsUsers: Set<string>
}

function parsePrivateStatsUsers(value: string | undefined): Set<string> {
    return new Set(
        (value ?? '')
            .split(',')
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean)
    )
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
    return {
        githubToken: env.GITHUB_TOKEN,
        nodeEnv: env.NODE_ENV ?? 'production',
        privateStatsUsers: parsePrivateStatsUsers(env.PRIVATE_STATS_USERS),
    }
}
