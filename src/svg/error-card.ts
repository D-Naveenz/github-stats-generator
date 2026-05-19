import type { DisplayError } from '../errors.js'
import { escapeXml } from './builder.js'
import { renderCard } from './card.js'
import type { SvgChild } from './compiler/index.js'

export function renderErrorCard(
    error: DisplayError,
    options: { title: string }
): string {
    const body: SvgChild[] = [
        {
            tag: 'text',
            styleKey: 'errorTitle',
            style: { x: 0, y: 0 },
            children: [escapeXml(error.message)],
        },
        error.secondaryMessage
            ? {
                  tag: 'text',
                  styleKey: 'errorText',
                  style: { x: 0, y: 24 },
                  children: [escapeXml(error.secondaryMessage)],
              }
            : '',
    ]

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
