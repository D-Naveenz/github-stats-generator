import type { DisplayError } from '../errors.js'
import { element, escapeXml } from './builder.js'
import { renderCard } from './card.js'

export function renderErrorCard(
    error: DisplayError,
    options: { title: string }
): string {
    const body = [
        element(
            'text',
            { x: 0, y: 0, class: 'error-title' },
            escapeXml(error.message)
        ),
        error.secondaryMessage
            ? element(
                  'text',
                  { x: 0, y: 24, class: 'error-text' },
                  escapeXml(error.secondaryMessage)
              )
            : '',
    ].join('')

    return renderCard({
        width: 420,
        height: 120,
        title: options.title,
        description: error.secondaryMessage
            ? `${error.message}: ${error.secondaryMessage}`
            : error.message,
        options: {
            theme: 'default',
            hideBorder: false,
            hideTitle: false,
            showIcons: false,
            hideRank: true,
            lineHeight: 25,
            hide: [],
        },
        body,
    })
}
