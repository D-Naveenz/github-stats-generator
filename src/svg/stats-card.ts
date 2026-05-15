import type { ProfileStats } from '../github/service.js'
import type { CommonCardOptions } from '../query.js'
import { element, escapeXml } from './builder.js'
import { renderCard } from './card.js'
import { formatNumber } from './format.js'

function possessive(name: string): string {
    return /s$/i.test(name) ? `${name}'` : `${name}'s`
}

function statBlock(args: {
    x: number
    y: number
    label: string
    value: string
}): string {
    return element(
        'g',
        { transform: `translate(${args.x}, ${args.y})` },
        [
            element(
                'text',
                { x: 0, y: 0, class: 'label' },
                escapeXml(args.label)
            ),
            element(
                'text',
                { x: 0, y: 24, class: 'value' },
                escapeXml(args.value)
            ),
        ].join('')
    )
}

export function renderStatsCard(
    stats: ProfileStats,
    options: CommonCardOptions
): string {
    const title = `${possessive(stats.name)} GitHub Stats`
    const repoLabel = stats.includePrivate ? 'Repositories' : 'Public Repos'
    const blocks = [
        statBlock({
            x: 0,
            y: 0,
            label: repoLabel,
            value: formatNumber(stats.repositories),
        }),
        statBlock({
            x: 190,
            y: 0,
            label: 'Followers',
            value: formatNumber(stats.followers),
        }),
        statBlock({
            x: 0,
            y: 58,
            label: 'Total Stars',
            value: formatNumber(stats.totalStars),
        }),
        statBlock({
            x: 190,
            y: 58,
            label: 'Pull Requests',
            value: formatNumber(stats.pullRequests),
        }),
        statBlock({
            x: 0,
            y: 116,
            label: 'Issues',
            value: formatNumber(stats.issues),
        }),
        statBlock({
            x: 190,
            y: 116,
            label: 'Contributions',
            value: formatNumber(stats.contributions),
        }),
    ].join('')

    return renderCard({
        width: 420,
        height: options.hideTitle ? 180 : 220,
        title,
        description: `${stats.username} has ${stats.repositories} repositories, ${stats.followers} followers, and ${stats.totalStars} stars.`,
        options,
        body: blocks,
    })
}
