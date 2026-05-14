import { z } from 'zod'
import type { AppConfig } from './config.js'
import { QueryError } from './errors.js'
import type { CardThemeName } from './svg/themes.js'
import { themeNames } from './svg/themes.js'

type QueryValue = unknown
type QuerySource = Record<string, QueryValue>

const usernameSchema = z
    .string()
    .min(1)
    .max(39)
    .regex(
        /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
        'username must be a valid GitHub login'
    )

const colorSchema = z
    .string()
    .regex(/^#?[0-9a-f]{6}$/i, 'colors must be 6-digit hex values')

const booleanValues = new Map<string, boolean>([
    ['true', true],
    ['1', true],
    ['yes', true],
    ['false', false],
    ['0', false],
    ['no', false],
])

export type CommonCardOptions = {
    theme: CardThemeName
    titleColor?: string
    textColor?: string
    bgColor?: string
    borderColor?: string
    hideBorder: boolean
    hideTitle: boolean
}

export type StatsCardQuery = {
    username: string
    includePrivate: boolean
    card: CommonCardOptions
}

export type LanguageCardQuery = StatsCardQuery & {
    card: CommonCardOptions & {
        layout: 'bar' | 'compact'
        limit: number
    }
}

function readString(query: QuerySource, key: string): string | undefined {
    const value = query[key]
    const firstValue = Array.isArray(value) ? value[0] : value
    return typeof firstValue === 'string' ? firstValue : undefined
}

function parseUsername(query: QuerySource): string {
    const result = usernameSchema.safeParse(readString(query, 'username'))
    if (!result.success) {
        throw new QueryError('Missing or invalid username')
    }

    return result.data
}

function parseBoolean(
    query: QuerySource,
    key: string,
    defaultValue = false
): boolean {
    const value = readString(query, key)
    if (value === undefined) {
        return defaultValue
    }

    const parsed = booleanValues.get(value.toLowerCase())
    if (parsed === undefined) {
        throw new QueryError(`${key} must be true or false`)
    }

    return parsed
}

function parseTheme(query: QuerySource): CardThemeName {
    const value = readString(query, 'theme') ?? 'default'
    if (!themeNames.includes(value as CardThemeName)) {
        throw new QueryError(`theme must be one of: ${themeNames.join(', ')}`)
    }

    return value as CardThemeName
}

function parseColor(query: QuerySource, key: string): string | undefined {
    const value = readString(query, key)
    if (value === undefined) {
        return undefined
    }

    const result = colorSchema.safeParse(value)
    if (!result.success) {
        throw new QueryError(`${key} must be a 6-digit hex color`)
    }

    return result.data.startsWith('#') ? result.data : `#${result.data}`
}

function parseCommonCardOptions(query: QuerySource): CommonCardOptions {
    return {
        theme: parseTheme(query),
        titleColor: parseColor(query, 'title_color'),
        textColor: parseColor(query, 'text_color'),
        bgColor: parseColor(query, 'bg_color'),
        borderColor: parseColor(query, 'border_color'),
        hideBorder: parseBoolean(query, 'hide_border'),
        hideTitle: parseBoolean(query, 'hide_title'),
    }
}

function parseIncludePrivate(
    query: QuerySource,
    username: string,
    config: AppConfig
): boolean {
    const includePrivate = parseBoolean(query, 'include_private')
    if (!includePrivate) {
        return false
    }

    if (!config.privateStatsUsers.has(username.toLowerCase())) {
        throw new QueryError('Private stats are not enabled for this username')
    }

    return true
}

export function parseStatsCardQuery(
    query: QuerySource,
    config: AppConfig
): StatsCardQuery {
    const username = parseUsername(query)

    return {
        username,
        includePrivate: parseIncludePrivate(query, username, config),
        card: parseCommonCardOptions(query),
    }
}

export function parseLanguageCardQuery(
    query: QuerySource,
    config: AppConfig
): LanguageCardQuery {
    const base = parseStatsCardQuery(query, config)
    const layout = readString(query, 'layout') ?? 'bar'
    if (layout !== 'bar' && layout !== 'compact') {
        throw new QueryError('layout must be bar or compact')
    }

    const limitValue = readString(query, 'limit')
    const limit = limitValue === undefined ? 6 : Number.parseInt(limitValue, 10)
    if (!Number.isInteger(limit) || limit < 1 || limit > 12) {
        throw new QueryError('limit must be an integer from 1 to 12')
    }

    return {
        ...base,
        card: {
            ...base.card,
            layout,
            limit,
        },
    }
}
