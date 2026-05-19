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
    className: string
    weight: number
    size: number
    fill: string
}): Record<string, string | number> {
    return {
        class: args.className,
        'font-family': "'Segoe UI', Ubuntu, sans-serif",
        'font-weight': args.weight,
        'font-size': args.size,
        fill: args.fill,
    }
}

export function createCardStyles(theme: CardTheme): StyleResources {
    return {
        cardRoot: {
            attrs: { class: 'card-root' },
        },
        cardSurface: {
            attrs: {
                class: 'card-surface',
                rx: 8,
                fill: theme.bgColor,
                stroke: theme.borderColor,
            },
        },
        cardTitle: {
            attrs: textAttrs({
                className: 'card-title header',
                weight: 600,
                size: 18,
                fill: theme.titleColor,
            }),
        },
        cardContent: {
            attrs: { class: 'card-content' },
        },
        statRow: {
            attrs: { class: 'stat-row' },
            layout: { height: 0 },
        },
        statLabel: {
            attrs: textAttrs({
                className: 'stat-label',
                weight: 500,
                size: 14,
                fill: theme.textColor,
            }),
        },
        statValue: {
            attrs: textAttrs({
                className: 'stat-value',
                weight: 700,
                size: 14,
                fill: theme.textColor,
            }),
        },
        statIcon: {
            attrs: {
                class: 'icon',
                fill: theme.iconColor,
            },
        },
        rankText: {
            attrs: {
                class: 'rank-text',
                'font-family': "'Segoe UI', Ubuntu, sans-serif",
                'font-weight': 800,
                fill: theme.textColor,
            },
        },
        languageRow: {
            attrs: { class: 'language-row' },
            layout: { height: 0 },
        },
        languageLabel: {
            attrs: textAttrs({
                className: 'small language-label',
                weight: 500,
                size: 12,
                fill: theme.textColor,
            }),
        },
        languagePercent: {
            basedOn: 'languageLabel',
            attrs: {
                class: 'muted language-percent',
                fill: theme.mutedTextColor,
            },
        },
        errorTitle: {
            attrs: textAttrs({
                className: 'error-title',
                weight: 700,
                size: 16,
                fill: theme.errorColor,
            }),
        },
        errorText: {
            attrs: textAttrs({
                className: 'error-text',
                weight: 500,
                size: 12,
                fill: theme.textColor,
            }),
        },
    }
}
