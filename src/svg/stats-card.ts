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

const rankCircleRadius = 52
const rankCircleStrokeWidth = 8
const rankCircleDiameter = rankCircleRadius * 2
const rankCircleCircumference = Math.round(Math.PI * rankCircleDiameter)
const rankCircleMinBodyHeight = rankCircleDiameter + rankCircleStrokeWidth * 2

function statRow(args: {
    y: number
    label: string
    value: string
    icon: string
    showIcon: boolean
    valueX: number
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
    const labelX = args.showIcon ? 28 : 0

    return element(
        'g',
        { transform: `translate(0, ${args.y})` },
        [
            icon,
            element(
                'text',
                { x: labelX, y: 0, class: 'stat-label' },
                `${escapeXml(args.label)}:`
            ),
            element(
                'text',
                {
                    x: args.valueX,
                    y: 0,
                    class: 'stat-value',
                    'font-weight': 700,
                },
                escapeXml(args.value)
            ),
        ].join('')
    )
}

function circleProgress(percentile: number): number {
    const progress = Math.max(0, Math.min(100, 100 - percentile))
    return ((100 - progress) / 100) * rankCircleCircumference
}

function rankTableVisualOffset(): number {
    return Math.ceil(rankCircleDiameter / 6)
}

function rankCircle(args: {
    stats: ProfileStats
    options: CommonCardOptions
    x: number
    y: number
}): string {
    const { stats, options } = args
    const theme = resolveTheme(options.theme, options)
    const rank = calculateRank(stats)

    return element(
        'g',
        {
            transform: `translate(${args.x}, ${args.y})`,
            'data-testid': 'rank-circle',
        },
        [
            element('circle', {
                cx: 0,
                cy: 0,
                r: rankCircleRadius,
                fill: 'none',
                stroke: theme.ringColor,
                'stroke-width': rankCircleStrokeWidth,
                'stroke-opacity': 0.2,
            }),
            element('circle', {
                cx: 0,
                cy: 0,
                r: rankCircleRadius,
                fill: 'none',
                stroke: theme.ringColor,
                'stroke-width': rankCircleStrokeWidth,
                'stroke-linecap': 'round',
                'stroke-dasharray': rankCircleCircumference,
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
    const visibleRowCount = statItems.filter(
        (item) => !hidden.has(item.key)
    ).length
    const tableTop = 8
    const tableHeight =
        visibleRowCount > 0
            ? (visibleRowCount - 1) * options.lineHeight + 24
            : 24
    const bodyHeight = Math.max(
        tableTop + tableHeight,
        options.hideRank ? 0 : tableTop + rankCircleMinBodyHeight
    )
    const rankX = options.showIcons ? 350 : 315
    const rankY =
        tableTop + Math.round(tableHeight / 2) - rankTableVisualOffset()
    const valueX = options.showIcons ? 150 : 122
    const rows = statItems
        .filter((item) => !hidden.has(item.key))
        .map((item, index) =>
            statRow({
                y: index * options.lineHeight,
                label: item.label,
                value: formatNumber(item.value),
                icon: item.icon,
                showIcon: options.showIcons,
                valueX,
            })
        )
        .join('')
    const body = [
        element('g', { transform: `translate(0, ${tableTop})` }, rows),
        options.hideRank
            ? ''
            : rankCircle({ stats, options, x: rankX, y: rankY }),
    ].join('')

    return renderCard({
        width: options.hideRank ? 360 : 460,
        height: (options.hideTitle ? 48 : 74) + bodyHeight,
        title,
        description: `${stats.username} has ${stats.totalStars} stars, ${stats.totalCommits} commits, ${stats.pullRequests} pull requests, ${stats.issues} issues, and contributed to ${stats.contributedTo} repositories.`,
        options,
        body,
    })
}
