import { element } from '../builder.js'
import { resolveNodeResource } from './resources.js'
import { resolveMargin, resolvePadding } from './spacing.js'
import type { Attributes } from '../builder.js'
import type {
    LayoutStyle,
    Spacing,
    StyleResources,
    SvgChild,
    SvgNode,
} from './types.js'

type CompileContext = {
    resources: StyleResources
    offsetX: number
    offsetY: number
}

type PositionedNode = {
    attrs: Attributes
    style: LayoutStyle
    margin: Spacing
    padding: Spacing
    x: number
    y: number
    layoutY: number
}

function numberAttr(attrs: Attributes, key: string): number | undefined {
    const value = attrs[key]
    return typeof value === 'number' ? value : undefined
}

function positionedNode(
    node: SvgNode,
    context: CompileContext,
    flowY: number
): PositionedNode {
    const resource = resolveNodeResource(node, context.resources)
    const attrs = {
        ...resource.attrs,
        ...(node.attrs ?? {}),
    }
    const style = {
        ...resource.layout,
        ...(node.style ?? {}),
    }
    const margin = resolveMargin(style)
    const padding = resolvePadding(style)
    const x =
        context.offsetX + margin.left + (style.x ?? numberAttr(attrs, 'x') ?? 0)
    const layoutY = style.y ?? numberAttr(attrs, 'y') ?? flowY
    const y = context.offsetY + margin.top + layoutY

    return {
        attrs,
        style,
        margin,
        padding,
        x,
        y,
        layoutY,
    }
}

function mergePositionAttrs(
    node: SvgNode,
    position: PositionedNode
): Attributes {
    const attrs = { ...position.attrs }
    const supportsSizeAttributes = new Set([
        'rect',
        'svg',
        'image',
        'foreignObject',
    ]).has(node.tag)

    if (supportsSizeAttributes && position.style.width !== undefined) {
        attrs.width = position.style.width
    }

    if (supportsSizeAttributes && position.style.height !== undefined) {
        attrs.height = position.style.height
    }

    if (node.tag === 'g') {
        const transform = `translate(${position.x}, ${position.y})`
        attrs.transform =
            typeof attrs.transform === 'string'
                ? `${transform} ${attrs.transform}`
                : transform
        return attrs
    }

    if (
        position.style.x !== undefined ||
        numberAttr(attrs, 'x') !== undefined ||
        position.x !== 0
    ) {
        attrs.x = position.x
    }

    if (
        position.style.y !== undefined ||
        numberAttr(attrs, 'y') !== undefined ||
        position.y !== 0
    ) {
        attrs.y = position.y
    }

    return attrs
}

function nodeHeight(position: PositionedNode): number {
    return position.style.height ?? numberAttr(position.attrs, 'height') ?? 0
}

function compileChildren(
    children: readonly SvgChild[] | undefined,
    context: CompileContext
): string {
    if (!children || children.length === 0) {
        return ''
    }

    let flowY = 0
    return children
        .map((child) => {
            if (typeof child === 'string') {
                return child
            }

            const position = positionedNode(child, context, flowY)
            const rendered = compileNode(child, context, flowY, position)
            const nextBottom =
                position.layoutY +
                position.margin.top +
                nodeHeight(position) +
                position.margin.bottom
            flowY = Math.max(flowY, nextBottom)

            return rendered
        })
        .join('')
}

function compileNode(
    node: SvgNode,
    context: CompileContext,
    flowY: number,
    knownPosition?: PositionedNode
): string {
    const position = knownPosition ?? positionedNode(node, context, flowY)
    const attrs = mergePositionAttrs(node, position)
    const childContext =
        node.tag === 'g'
            ? {
                  ...context,
                  offsetX: position.padding.left,
                  offsetY: position.padding.top,
              }
            : {
                  ...context,
                  offsetX: position.x + position.padding.left,
                  offsetY: position.y + position.padding.top,
              }
    const content = compileChildren(node.children, childContext)

    return element(node.tag, attrs, content)
}

export function compileSvg(
    children: readonly SvgChild[],
    resources: StyleResources = {}
): string {
    return compileChildren(children, {
        resources,
        offsetX: 0,
        offsetY: 0,
    })
}
