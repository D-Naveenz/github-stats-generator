import type { CommonCardOptions } from '../query.js'
import { rootSvg } from './builder.js'
import {
    renderCompilerCardContent,
    type CompilerCardOptions,
} from './compiler/card.js'
import type { SvgChild } from './compiler/index.js'
import type { ThemeOverrides } from './themes.js'

export type RenderCardOptions = CommonCardOptions & ThemeOverrides

type CardArgs = {
    width: number
    height: number
    title: string
    description: string
    options: CompilerCardOptions
    body: SvgChild | SvgChild[]
    contentX?: number
    contentY?: number
    titleX?: number
    titleY?: number
}

export function renderCard(args: CardArgs): string {
    return rootSvg({
        width: args.width,
        height: args.height,
        title: args.title,
        desc: args.description,
        content: renderCompilerCardContent(args),
    })
}
