import type { CommonCardOptions } from '../../query.js'
import { escapeXml } from '../builder.js'
import { resolveTheme, type ThemeOverrides } from '../themes.js'
import { createCardStyles } from '../styles.js'
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

function cardBackground(args: CompilerCardArgs): SvgNode {
    return {
        tag: 'rect',
        styleKey: 'cardSurface',
        attrs: {
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
        styleKey: 'cardTitle',
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
        styleKey: 'cardContent',
        style: {
            x: args.contentX ?? 24,
            y: args.contentY ?? titleHeight + 20,
        },
        children: body,
    }
}

export function renderCompilerCardContent(args: CompilerCardArgs): string {
    const theme = resolveTheme(args.options.theme, args.options)
    const styles = createCardStyles(theme)
    const nodes = [
        cardBackground(args),
        titleNode(args),
        contentNode(args),
    ].filter((node): node is SvgNode => node !== undefined)

    return compileSvg(nodes, [], styles)
}
