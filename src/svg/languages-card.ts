import type { TopLanguage } from '../github/service.js'
import type { LanguageCardQuery } from '../query.js'
import { element, escapeXml } from './builder.js'
import { renderCard } from './card.js'
import { formatPercent } from './format.js'
import { cardLayout, estimateTextWidth, titleBlockHeight } from './layout.js'
import { resolveTheme } from './themes.js'

type LanguageCardOptions = LanguageCardQuery['card']

const barLayoutWidth = 360
const barWidth = 250
const barPercentX = barLayoutWidth
const barRowGap = 36
const barRowHeight = 22
const compactColumnGap = 28
const compactColumnWidth = 170
const compactRowGap = 28
const compactRowHeight = 14
const emptyStateHeight = 14

function normalizeColor(color: string): string {
    return /^#[0-9a-f]{6}$/i.test(color) ? color : '#858585'
}

function topLanguages(languages: TopLanguage[], limit: number): TopLanguage[] {
    return languages.slice(0, limit)
}

function renderEmptyState(): string {
    return element(
        'text',
        { x: 0, y: 0, class: 'small' },
        'No language data found'
    )
}

function renderBarLayout(
    languages: TopLanguage[],
    totalSize: number,
    options: LanguageCardOptions
): string {
    const theme = resolveTheme(options.theme, options)

    return languages
        .map((language, index) => {
            const percent =
                totalSize === 0 ? 0 : (language.size / totalSize) * 100
            const y = index * barRowGap
            const width = Math.max(2, (percent / 100) * barWidth)
            return element(
                'g',
                { transform: `translate(0, ${y})` },
                [
                    element(
                        'text',
                        { x: 0, y: 0, class: 'small' },
                        escapeXml(language.name)
                    ),
                    element(
                        'text',
                        {
                            x: barPercentX,
                            y: 0,
                            class: 'muted',
                            'text-anchor': 'end',
                        },
                        escapeXml(formatPercent(percent))
                    ),
                    element('rect', {
                        x: 0,
                        y: 10,
                        width: barWidth,
                        height: 8,
                        rx: 4,
                        fill: theme.barBgColor,
                    }),
                    element('rect', {
                        x: 0,
                        y: 10,
                        width,
                        height: 8,
                        rx: 4,
                        fill: normalizeColor(language.color),
                    }),
                ].join('')
            )
        })
        .join('')
}

function renderCompactLayout(
    languages: TopLanguage[],
    totalSize: number
): string {
    return languages
        .map((language, index) => {
            const percent =
                totalSize === 0 ? 0 : (language.size / totalSize) * 100
            const column = index % 2
            const row = Math.floor(index / 2)
            const x = column * (compactColumnWidth + compactColumnGap)
            const y = row * compactRowGap
            return element(
                'g',
                { transform: `translate(${x}, ${y})` },
                [
                    element('circle', {
                        cx: 5,
                        cy: -4,
                        r: 5,
                        fill: normalizeColor(language.color),
                    }),
                    element(
                        'text',
                        { x: 18, y: 0, class: 'small' },
                        escapeXml(`${language.name} ${formatPercent(percent)}`)
                    ),
                ].join('')
            )
        })
        .join('')
}

function bodyMetrics(
    visibleLanguages: TopLanguage[],
    options: LanguageCardOptions
): { width: number; height: number } {
    if (visibleLanguages.length === 0) {
        return {
            width: estimateTextWidth('No language data found', 12),
            height: emptyStateHeight,
        }
    }

    if (options.layout === 'compact') {
        const columnCount = Math.min(visibleLanguages.length, 2)
        const rowCount = Math.ceil(visibleLanguages.length / 2)
        return {
            width:
                columnCount * compactColumnWidth +
                (columnCount - 1) * compactColumnGap,
            height: (rowCount - 1) * compactRowGap + compactRowHeight,
        }
    }

    return {
        width: barLayoutWidth,
        height: (visibleLanguages.length - 1) * barRowGap + barRowHeight,
    }
}

export function renderLanguagesCard(
    languages: TopLanguage[],
    options: LanguageCardOptions
): string {
    const visibleLanguages = topLanguages(languages, options.limit)
    const totalSize = visibleLanguages.reduce(
        (sum, language) => sum + language.size,
        0
    )
    const body =
        visibleLanguages.length === 0
            ? renderEmptyState()
            : options.layout === 'compact'
              ? renderCompactLayout(visibleLanguages, totalSize)
              : renderBarLayout(visibleLanguages, totalSize, options)
    const metrics = bodyMetrics(visibleLanguages, options)
    const titleWidth = options.hideTitle
        ? 0
        : estimateTextWidth('Top Languages', cardLayout.titleFontSize)
    const titleHeight = titleBlockHeight(options.hideTitle)
    const cardWidth = Math.ceil(
        Math.max(metrics.width, titleWidth) + cardLayout.padding * 2
    )
    const cardHeight = Math.ceil(
        cardLayout.padding +
            titleHeight +
            metrics.height +
            cardLayout.paddingBottom
    )

    return renderCard({
        width: cardWidth,
        height: cardHeight,
        title: 'Top Languages',
        description: visibleLanguages
            .map((language) => language.name)
            .join(', '),
        options,
        body,
        contentX: cardLayout.padding,
        contentY: cardLayout.padding + titleHeight,
        titleX: cardLayout.padding,
        titleY: cardLayout.padding + cardLayout.titleBaselineOffset,
    })
}
