import type { Attributes } from '../builder.js'
import type {
    LayoutStyle,
    StyleResource,
    StyleResources,
    SvgNode,
} from './types.js'

export type ResolvedStyleResource = {
    attrs: Attributes
    layout: LayoutStyle
}

function mergeResources(
    base: ResolvedStyleResource,
    next: StyleResource
): ResolvedStyleResource {
    return {
        attrs: {
            ...base.attrs,
            ...(next.attrs ?? {}),
        },
        layout: {
            ...base.layout,
            ...(next.layout ?? {}),
        },
    }
}

function resolveResource(
    key: string,
    resources: StyleResources,
    resolving: string[] = []
): ResolvedStyleResource {
    const resource = resources[key]
    if (!resource) {
        throw new Error(`Unknown SVG style resource: ${key}`)
    }

    if (resolving.includes(key)) {
        throw new Error(
            `Circular SVG style resource inheritance: ${[...resolving, key].join(' -> ')}`
        )
    }

    const base = resource.basedOn
        ? resolveResource(resource.basedOn, resources, [...resolving, key])
        : { attrs: {}, layout: {} }

    return mergeResources(base, resource)
}

export function resolveNodeResource(
    node: SvgNode,
    resources: StyleResources
): ResolvedStyleResource {
    if (!node.styleKey) {
        return { attrs: {}, layout: {} }
    }

    return resolveResource(node.styleKey, resources)
}
