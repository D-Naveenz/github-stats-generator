import type { StyleResources } from './compiler/index.js'
import type { CardTheme } from './themes.js'

export const cardStyleKeys = [
    'cardRoot',
    'cardSurface',
    'cardTitle',
    'cardContent',
    'statRow',
    'statLabel',
    'statValue',
    'statIcon',
    'rankText',
    'languageRow',
    'languageLabel',
    'languagePercent',
    'errorTitle',
    'errorText',
] as const

export type CardStyleKey = (typeof cardStyleKeys)[number]

function textAttrs(args: {
    weight: number
    size: number
    fill: string
}): Record<string, string | number> {
    return {
        'font-family': "'Segoe UI', Ubuntu, sans-serif",
        'font-weight': args.weight,
        'font-size': args.size,
        fill: args.fill,
    }
}

export function createCardStyles(theme: CardTheme): StyleResources {
    return {
        cardRoot: {},
        cardSurface: {
            attrs: {
                rx: 8,
                fill: theme.bgColor,
                stroke: theme.borderColor,
            },
        },
        cardTitle: {
            attrs: textAttrs({
                weight: 600,
                size: 18,
                fill: theme.titleColor,
            }),
        },
        cardContent: {},
        statRow: {
            layout: { height: 0 },
        },
        statLabel: {
            attrs: textAttrs({
                weight: 500,
                size: 14,
                fill: theme.textColor,
            }),
        },
        statValue: {
            attrs: textAttrs({
                weight: 700,
                size: 14,
                fill: theme.textColor,
            }),
        },
        statIcon: {
            attrs: {
                fill: theme.iconColor,
            },
        },
        rankText: {
            attrs: {
                'font-family': "'Segoe UI', Ubuntu, sans-serif",
                'font-weight': 800,
                fill: theme.textColor,
            },
        },
        languageRow: {
            layout: { height: 0 },
        },
        languageLabel: {
            attrs: textAttrs({
                weight: 500,
                size: 12,
                fill: theme.textColor,
            }),
        },
        languagePercent: {
            basedOn: 'languageLabel',
            attrs: {
                fill: theme.mutedTextColor,
            },
        },
        errorTitle: {
            attrs: textAttrs({
                weight: 700,
                size: 16,
                fill: theme.errorColor,
            }),
        },
        errorText: {
            attrs: textAttrs({
                weight: 500,
                size: 12,
                fill: theme.textColor,
            }),
        },
    }
}
