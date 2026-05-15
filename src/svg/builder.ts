import { createRequire } from 'node:module'

type AttributeValue = string | number | boolean | null | undefined
type Attributes = Record<string, AttributeValue>

type SvgBuilderInstance = {
    elements: string[]
    width(value: number | string): SvgBuilderInstance
    height(value: number | string): SvgBuilderInstance
    viewBox(value: string): SvgBuilderInstance
    render(): string
    [key: string]: unknown
}

type SvgBuilder = {
    newInstance(): SvgBuilderInstance
}

const require = createRequire(import.meta.url)
const svgBuilder = require('svg-builder').default as SvgBuilder

export function escapeXml(value: string | number): string {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')
}

function renderAttributes(attrs: Attributes): string {
    return Object.entries(attrs)
        .filter((entry): entry is [string, string | number | boolean] => {
            const value = entry[1]
            return value !== undefined && value !== null
        })
        .map(([key, value]) => ` ${key}="${escapeXml(String(value))}"`)
        .join('')
}

function rawElement(name: string, attrs: Attributes, content = ''): string {
    return `<${name}${renderAttributes(attrs)}>${content}</${name}>`
}

export function element(
    name: string,
    attrs: Attributes = {},
    content?: string
): string {
    if (content !== undefined) {
        return rawElement(name, attrs, content)
    }

    const builder = svgBuilder.newInstance()
    const method = builder[name]
    if (typeof method !== 'function') {
        throw new Error(`Unsupported SVG element: ${name}`)
    }

    method.call(builder, attrs, content)
    return builder.elements.join('')
}

export function rootSvg(args: {
    width: number
    height: number
    title: string
    desc: string
    content: string
}): string {
    const titleId = 'titleId'
    const descId = 'descId'
    const content = [
        element('title', { id: titleId }, escapeXml(args.title)),
        element('desc', { id: descId }, escapeXml(args.desc)),
        args.content,
    ].join('')

    return `<svg role="img" aria-labelledby="${titleId} ${descId}" width="${args.width}" height="${args.height}" viewBox="0 0 ${args.width} ${args.height}" fill="none" xmlns="http://www.w3.org/2000/svg">${content}</svg>`
}
