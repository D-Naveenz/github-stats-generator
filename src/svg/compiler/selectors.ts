import type { Attributes } from '../builder.js'
import type { LayoutStyle, StyleRule, SvgNode } from './types.js'

type SelectorParts = {
    tag?: string
    id?: string
    className?: string
}

function classNames(attrs: Attributes, selectors: string[]): Set<string> {
    const classes = new Set<string>()
    const classAttr = attrs.class
    if (typeof classAttr === 'string') {
        for (const className of classAttr.split(/\s+/).filter(Boolean)) {
            classes.add(className)
        }
    }

    for (const selector of selectors) {
        if (selector.startsWith('.') && selector.length > 1) {
            classes.add(selector.slice(1))
        } else if (!selector.startsWith('#') && selector.length > 0) {
            classes.add(selector)
        }
    }

    return classes
}

function parseSelector(selector: string): SelectorParts | undefined {
    const trimmed = selector.trim()
    if (!trimmed || trimmed.includes(' ')) {
        return undefined
    }

    const match =
        /^(?:(?<tag>[a-z][\w-]*)?)(?:(?<id>#[\w-]+)|(?<class>\.[\w-]+))?$/i.exec(
            trimmed
        )
    if (!match?.groups) {
        return undefined
    }

    return {
        tag: match.groups.tag,
        id: match.groups.id?.slice(1),
        className: match.groups.class?.slice(1),
    }
}

export function injectSelectorAttributes(node: SvgNode): Attributes {
    const attrs = { ...(node.attrs ?? {}) }
    const selectors = node.selectors ?? []
    const classes = classNames(attrs, selectors)
    const idSelector = selectors.find(
        (selector) => selector.startsWith('#') && selector.length > 1
    )

    if (idSelector && attrs.id === undefined) {
        attrs.id = idSelector.slice(1)
    }

    if (classes.size > 0) {
        attrs.class = [...classes].join(' ')
    }

    return attrs
}

export function matchesSelector(node: SvgNode, selector: string): boolean {
    const attrs = injectSelectorAttributes(node)
    const selectors = selector.split(',').map((part) => part.trim())

    return selectors.some((part) => {
        const parsed = parseSelector(part)
        if (!parsed) {
            return false
        }

        if (parsed.tag !== undefined && parsed.tag !== node.tag) {
            return false
        }

        if (parsed.id !== undefined && attrs.id !== parsed.id) {
            return false
        }

        if (
            parsed.className !== undefined &&
            !classNames(attrs, []).has(parsed.className)
        ) {
            return false
        }

        return true
    })
}

export function resolveStyle(
    node: SvgNode,
    rules: readonly StyleRule[]
): LayoutStyle {
    const ruleStyle = rules.reduce<LayoutStyle>((style, rule) => {
        if (!matchesSelector(node, rule.selector)) {
            return style
        }

        return { ...style, ...rule.style }
    }, {})

    return {
        ...ruleStyle,
        ...(node.style ?? {}),
    }
}
