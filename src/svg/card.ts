import type { CommonCardOptions } from '../query.js'
import { element, escapeXml, rootSvg } from './builder.js'
import { resolveTheme, type ThemeOverrides } from './themes.js'

export type RenderCardOptions = CommonCardOptions & ThemeOverrides

type CardArgs = {
    width: number
    height: number
    title: string
    description: string
    options: RenderCardOptions
    body: string
}

export function renderCard(args: CardArgs): string {
    const theme = resolveTheme(args.options.theme, args.options)
    const titleHeight = args.options.hideTitle ? 0 : 42
    const title = args.options.hideTitle
        ? ''
        : element(
              'text',
              {
                  x: 24,
                  y: 32,
                  class: 'header',
              },
              escapeXml(args.title)
          )

    const content = [
        element(
            'style',
            {},
            `
        .header { font: 600 18px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.titleColor}; }
        .label { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.mutedTextColor}; }
        .value { font: 700 18px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
        .small { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
        .muted { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.mutedTextColor}; }
        .error-title { font: 700 16px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.errorColor}; }
        .error-text { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
      `
        ),
        element('rect', {
            x: 0.5,
            y: 0.5,
            width: args.width - 1,
            height: args.height - 1,
            rx: 8,
            fill: theme.bgColor,
            stroke: theme.borderColor,
            'stroke-opacity': args.options.hideBorder ? 0 : 1,
        }),
        title,
        element(
            'g',
            {
                transform: `translate(24, ${titleHeight + 20})`,
            },
            args.body
        ),
    ].join('')

    return rootSvg({
        width: args.width,
        height: args.height,
        title: args.title,
        desc: args.description,
        content,
    })
}
