import type { TopLanguage } from '../github/service.js'
import type { LanguageCardQuery } from '../query.js'
import { element, escapeXml } from './builder.js'
import { renderCard } from './card.js'
import { formatPercent } from './format.js'
import { resolveTheme } from './themes.js'

type LanguageCardOptions = LanguageCardQuery['card']

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
    const barWidth = 220

    return languages
        .map((language, index) => {
            const percent =
                totalSize === 0 ? 0 : (language.size / totalSize) * 100
            const y = index * 34
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
                        { x: 350, y: 0, class: 'muted', 'text-anchor': 'end' },
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
            const x = column * 190
            const y = row * 28
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
    const rowCount =
        options.layout === 'compact'
            ? Math.ceil(Math.max(visibleLanguages.length, 1) / 2)
            : Math.max(visibleLanguages.length, 1)
    const bodyHeight =
        options.layout === 'compact' ? rowCount * 28 : rowCount * 34

    return renderCard({
        width: 420,
        height: (options.hideTitle ? 54 : 96) + bodyHeight,
        title: 'Top Languages',
        description: visibleLanguages
            .map((language) => language.name)
            .join(', '),
        options,
        body,
    })
}
