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
const rankTextFontSize = 38
const cardPadding = 24
const cardPaddingBottom = 16
const titleFontSize = 18
const titleBaselineOffset = titleFontSize
const titleToContentGap = 26
const defaultTableTop = 8
const rankColumnGap = 28
const valueColumnXWithIcons = 150
const valueColumnXWithoutIcons = 122
const minTableWidth = 260

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

function rankTextBaselineOffset(): number {
    return Math.round(rankTextFontSize * 0.35)
}

function estimateTextWidth(text: string, fontSize: number): number {
    return Math.ceil(text.length * fontSize * 0.56)
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
                    y: rankTextBaselineOffset(),
                    class: 'rank-text',
                    'font-size': rankTextFontSize,
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
    const visibleItems = statItems.filter((item) => !hidden.has(item.key))
    const visibleRowCount = statItems.filter(
        (item) => !hidden.has(item.key)
    ).length
    const tableTop = defaultTableTop
    const tableHeight =
        visibleRowCount > 0
            ? (visibleRowCount - 1) * options.lineHeight + 24
            : 24
    const bodyHeight = Math.max(
        tableTop + tableHeight,
        options.hideRank ? 0 : tableTop + rankCircleMinBodyHeight
    )
    const valueX = options.showIcons
        ? valueColumnXWithIcons
        : valueColumnXWithoutIcons
    const longestValue = visibleItems.reduce(
        (longest, item) => Math.max(longest, formatNumber(item.value).length),
        1
    )
    const tableWidth = Math.max(
        minTableWidth,
        valueX + estimateTextWidth('8'.repeat(longestValue), 14)
    )
    const rankX =
        tableWidth +
        rankColumnGap +
        rankCircleRadius +
        rankCircleStrokeWidth / 2
    const rankY =
        tableTop + Math.round(tableHeight / 2) - rankTableVisualOffset()
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
    const rankWidth = options.hideRank
        ? 0
        : rankX + rankCircleRadius + rankCircleStrokeWidth / 2
    const contentWidth = Math.max(tableWidth, rankWidth)
    const titleWidth = options.hideTitle
        ? 0
        : estimateTextWidth(title, titleFontSize)
    const innerWidth = Math.max(contentWidth, titleWidth)
    const titleBlockHeight = options.hideTitle
        ? 0
        : titleBaselineOffset + titleToContentGap
    const cardWidth = Math.ceil(innerWidth + cardPadding * 2)
    const cardHeight = Math.ceil(
        cardPadding + titleBlockHeight + bodyHeight + cardPaddingBottom
    )

    return renderCard({
        width: cardWidth,
        height: cardHeight,
        title,
        description: `${stats.username} has ${stats.totalStars} stars, ${stats.totalCommits} commits, ${stats.pullRequests} pull requests, ${stats.issues} issues, and contributed to ${stats.contributedTo} repositories.`,
        options,
        body,
        contentX: cardPadding,
        contentY: cardPadding + titleBlockHeight,
        titleX: cardPadding,
        titleY: cardPadding + titleBaselineOffset,
    })
}
