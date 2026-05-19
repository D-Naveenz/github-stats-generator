import type { Attributes } from '../builder.js'

export type SpacingInput = number | string

export type LayoutStyle = {
    x?: number
    y?: number
    width?: number
    height?: number
    margin?: SpacingInput
    marginTop?: number
    marginRight?: number
    marginBottom?: number
    marginLeft?: number
    padding?: SpacingInput
    paddingTop?: number
    paddingRight?: number
    paddingBottom?: number
    paddingLeft?: number
}

export type SvgChild = SvgNode | string

export type SvgNode = {
    tag: string
    attrs?: Attributes
    children?: SvgChild[]
    selectors?: string[]
    style?: LayoutStyle
}

export type StyleRule = {
    selector: string
    style: LayoutStyle
}

export type Spacing = {
    top: number
    right: number
    bottom: number
    left: number
}
