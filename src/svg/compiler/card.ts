import type { CommonCardOptions } from '../../query.js'
import { escapeXml } from '../builder.js'
import { resolveTheme, type ThemeOverrides } from '../themes.js'
import { compileSvg } from './compiler.js'
import type { SvgChild, SvgNode } from './types.js'

export type CompilerCardOptions = CommonCardOptions & ThemeOverrides

export type CompilerCardArgs = {
    width: number
    height: number
    title: string
    options: CompilerCardOptions
    body: SvgChild | SvgChild[]
    contentX?: number
    contentY?: number
    titleX?: number
    titleY?: number
}

function cardStyle(options: CompilerCardOptions): SvgNode {
    const theme = resolveTheme(options.theme, options)

    return {
        tag: 'style',
        children: [
            `
        .header { font: 600 18px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.titleColor}; }
        .label { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.mutedTextColor}; }
        .value { font: 700 18px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
        .stat-label { font: 500 14px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
        .stat-value { font: 700 14px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
        .icon { fill: ${theme.iconColor}; }
        .rank-text { font-family: 'Segoe UI', Ubuntu, sans-serif; font-weight: 800; fill: ${theme.textColor}; }
        .small { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
        .muted { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.mutedTextColor}; }
        .error-title { font: 700 16px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.errorColor}; }
        .error-text { font: 500 12px 'Segoe UI', Ubuntu, sans-serif; fill: ${theme.textColor}; }
      `,
        ],
    }
}

function cardBackground(args: CompilerCardArgs): SvgNode {
    const theme = resolveTheme(args.options.theme, args.options)

    return {
        tag: 'rect',
        attrs: {
            rx: 8,
            fill: theme.bgColor,
            stroke: theme.borderColor,
            'stroke-opacity': args.options.hideBorder ? 0 : 1,
        },
        style: {
            x: 0.5,
            y: 0.5,
            width: args.width - 1,
            height: args.height - 1,
        },
    }
}

function titleNode(args: CompilerCardArgs): SvgNode | undefined {
    if (args.options.hideTitle) {
        return undefined
    }

    return {
        tag: 'text',
        attrs: {
            class: 'header',
        },
        style: {
            x: args.titleX ?? 24,
            y: args.titleY ?? 32,
        },
        children: [escapeXml(args.title)],
    }
}

function contentNode(args: CompilerCardArgs): SvgNode {
    const titleHeight = args.options.hideTitle ? 0 : 42
    const body = Array.isArray(args.body) ? args.body : [args.body]

    return {
        tag: 'g',
        style: {
            x: args.contentX ?? 24,
            y: args.contentY ?? titleHeight + 20,
        },
        children: body,
    }
}

export function renderCompilerCardContent(args: CompilerCardArgs): string {
    const nodes = [
        cardStyle(args.options),
        cardBackground(args),
        titleNode(args),
        contentNode(args),
    ].filter((node): node is SvgNode => node !== undefined)

    return compileSvg(nodes)
}
