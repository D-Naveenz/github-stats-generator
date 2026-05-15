import type { ProfileStats } from '../github/service.js'
import { calculateRank } from '../rank.js'
import type { CommonCardOptions } from '../query.js'
import { element, escapeXml } from './builder.js'
import { renderCard } from './card.js'
import { formatNumber } from './format.js'
import { statIcons } from './icons.js'
import { resolveTheme } from './themes.js'

function possessive(name: string): string {
    return /s$/i.test(name) ? `${name}'` : `${name}'s`
}

type StatItem = {
    key: 'stars' | 'commits' | 'prs' | 'issues' | 'contribs'
    icon: string
    label: string
    value: number
}

function statRow(args: {
    y: number
    label: string
    value: string
    icon: string
    showIcon: boolean
}): string {
    const icon = args.showIcon
        ? element(
              'svg',
              {
                  x: 0,
                  y: -13,
                  viewBox: '0 0 16 16',
                  width: 16,
                  height: 16,
                  class: 'icon',
                  'data-testid': 'icon',
              },
              args.icon
          )
        : ''
    const textX = args.showIcon ? 28 : 0

    return element(
        'g',
        { transform: `translate(0, ${args.y})` },
        [
            icon,
            element(
                'text',
                { x: textX, y: 0 },
                [
                    element(
                        'tspan',
                        { class: 'stat-label' },
                        `${escapeXml(args.label)}: `
                    ),
                    element(
                        'tspan',
                        { class: 'stat-value', 'font-weight': 700 },
                        escapeXml(args.value)
                    ),
                ].join('')
            ),
        ].join('')
    )
}

function circleProgress(percentile: number): number {
    const radius = 40
    const circumference = Math.PI * (radius * 2)
    const progress = Math.max(0, Math.min(100, 100 - percentile))
    return ((100 - progress) / 100) * circumference
}

function rankCircle(stats: ProfileStats, options: CommonCardOptions): string {
    const theme = resolveTheme(options.theme, options)
    const rank = calculateRank(stats)

    return element(
        'g',
        { transform: 'translate(395, 52)', 'data-testid': 'rank-circle' },
        [
            element('circle', {
                cx: 0,
                cy: 0,
                r: 40,
                fill: 'none',
                stroke: theme.ringColor,
                'stroke-width': 6,
                'stroke-opacity': 0.2,
            }),
            element('circle', {
                cx: 0,
                cy: 0,
                r: 40,
                fill: 'none',
                stroke: theme.ringColor,
                'stroke-width': 6,
                'stroke-linecap': 'round',
                'stroke-dasharray': 250,
                'stroke-dashoffset': circleProgress(rank.percentile),
                transform: 'rotate(-90)',
            }),
            element(
                'text',
                {
                    x: 0,
                    y: 8,
                    class: 'rank-text',
                    'text-anchor': 'middle',
                    'data-testid': 'level-rank-icon',
                },
                escapeXml(rank.level)
            ),
        ].join('')
    )
}

export function renderStatsCard(
    stats: ProfileStats,
    options: CommonCardOptions
): string {
    const title = `${possessive(stats.name)} GitHub Stats`
    const statItems: StatItem[] = [
        {
            key: 'stars',
            icon: statIcons.stars,
            label: 'Total Stars',
            value: stats.totalStars,
        },
        {
            key: 'commits',
            icon: statIcons.commits,
            label: 'Total Commits',
            value: stats.totalCommits,
        },
        {
            key: 'prs',
            icon: statIcons.prs,
            label: 'Total PRs',
            value: stats.pullRequests,
        },
        {
            key: 'issues',
            icon: statIcons.issues,
            label: 'Total Issues',
            value: stats.issues,
        },
        {
            key: 'contribs',
            icon: statIcons.contribs,
            label: 'Contributed to',
            value: stats.contributedTo,
        },
    ]
    const hidden = new Set(options.hide)
    const rows = statItems
        .filter((item) => !hidden.has(item.key))
        .map((item, index) =>
            statRow({
                y: index * options.lineHeight,
                label: item.label,
                value: formatNumber(item.value),
                icon: item.icon,
                showIcon: options.showIcons,
            })
        )
        .join('')
    const body = [
        rows,
        options.hideRank ? '' : rankCircle(stats, options),
    ].join('')
    const bodyHeight = Math.max(
        options.hideRank ? 0 : 120,
        Math.max(1, statItems.length - hidden.size) * options.lineHeight
    )

    return renderCard({
        width: options.hideRank ? 360 : 520,
        height: (options.hideTitle ? 48 : 90) + bodyHeight,
        title,
        description: `${stats.username} has ${stats.totalStars} stars, ${stats.totalCommits} commits, ${stats.pullRequests} pull requests, ${stats.issues} issues, and contributed to ${stats.contributedTo} repositories.`,
        options,
        body,
    })
}
