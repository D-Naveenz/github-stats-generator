import type { LayoutStyle, Spacing, SpacingInput } from './types.js'

const emptySpacing: Spacing = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
}

function spacingError(value: SpacingInput): Error {
    return new Error(`Invalid spacing value: ${String(value)}`)
}

function parseSpacingPart(part: string, original: SpacingInput): number {
    const parsed = Number(part.trim())
    if (!Number.isFinite(parsed)) {
        throw spacingError(original)
    }

    return parsed
}

export function parseSpacing(value: SpacingInput | undefined): Spacing {
    if (value === undefined) {
        return { ...emptySpacing }
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw spacingError(value)
        }

        return {
            top: value,
            right: value,
            bottom: value,
            left: value,
        }
    }

    const parts = value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)

    if (parts.length !== 1 && parts.length !== 2 && parts.length !== 4) {
        throw spacingError(value)
    }

    const numbers = parts.map((part) => parseSpacingPart(part, value))
    if (numbers.length === 1) {
        return {
            top: numbers[0],
            right: numbers[0],
            bottom: numbers[0],
            left: numbers[0],
        }
    }

    if (numbers.length === 2) {
        return {
            top: numbers[0],
            right: numbers[1],
            bottom: numbers[0],
            left: numbers[1],
        }
    }

    return {
        top: numbers[0],
        right: numbers[1],
        bottom: numbers[2],
        left: numbers[3],
    }
}

export function resolveMargin(style: LayoutStyle): Spacing {
    const spacing = parseSpacing(style.margin)

    return {
        top: style.marginTop ?? spacing.top,
        right: style.marginRight ?? spacing.right,
        bottom: style.marginBottom ?? spacing.bottom,
        left: style.marginLeft ?? spacing.left,
    }
}

export function resolvePadding(style: LayoutStyle): Spacing {
    const spacing = parseSpacing(style.padding)

    return {
        top: style.paddingTop ?? spacing.top,
        right: style.paddingRight ?? spacing.right,
        bottom: style.paddingBottom ?? spacing.bottom,
        left: style.paddingLeft ?? spacing.left,
    }
}
