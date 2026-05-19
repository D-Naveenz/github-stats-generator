import { describe, expect, it } from 'vitest'
import {
    compileSvg,
    matchesSelector,
    parseSpacing,
    resolveMargin,
    resolveNodeResource,
    resolveStyle,
    type StyleResources,
    type SvgNode,
} from '../src/svg/compiler/index.js'

describe('SVG compiler spacing', () => {
    it('parses spacing shorthand values', () => {
        expect(parseSpacing(8)).toEqual({
            top: 8,
            right: 8,
            bottom: 8,
            left: 8,
        })
        expect(parseSpacing('8, 4')).toEqual({
            top: 8,
            right: 4,
            bottom: 8,
            left: 4,
        })
        expect(parseSpacing('8, 4, 3, 2')).toEqual({
            top: 8,
            right: 4,
            bottom: 3,
            left: 2,
        })
    })

    it('lets individual numeric properties override shorthand sides', () => {
        expect(resolveMargin({ margin: '8, 4', marginBottom: 12 })).toEqual({
            top: 8,
            right: 4,
            bottom: 12,
            left: 4,
        })
    })

    it('rejects unsupported spacing shorthand', () => {
        expect(() => parseSpacing('8, 4, 2')).toThrow('Invalid spacing value')
        expect(() => parseSpacing('8pt')).toThrow('Invalid spacing value')
    })
})

describe('SVG compiler selectors', () => {
    it('matches class, id, tag, and combined selectors', () => {
        const node: SvgNode = {
            tag: 'rect',
            attrs: { id: 'card', class: 'surface primary' },
        }

        expect(matchesSelector(node, '.surface')).toBe(true)
        expect(matchesSelector(node, '#card')).toBe(true)
        expect(matchesSelector(node, 'rect')).toBe(true)
        expect(matchesSelector(node, 'rect.primary')).toBe(true)
        expect(matchesSelector(node, 'text.primary')).toBe(false)
    })

    it('resolves rule order before inline style', () => {
        const node: SvgNode = {
            tag: 'rect',
            attrs: { class: 'surface' },
            style: { x: 9 },
        }
        const style = resolveStyle(node, [
            { selector: 'rect', style: { x: 1, y: 2 } },
            { selector: '.surface', style: { x: 4, width: 100 } },
        ])

        expect(style).toEqual({
            x: 9,
            y: 2,
            width: 100,
        })
    })
})

describe('SVG compiler style resources', () => {
    const resources: StyleResources = {
        textBase: {
            attrs: { fill: '#111111', font: '500 12px sans-serif' },
            layout: { x: 2, height: 10 },
        },
        cardTitle: {
            basedOn: 'textBase',
            attrs: { class: 'card-title', fill: '#0969da' },
            layout: { marginBottom: 12 },
        },
        circularA: { basedOn: 'circularB' },
        circularB: { basedOn: 'circularA' },
    }

    it('applies keyed resources to attrs and layout', () => {
        const svg = compileSvg(
            [
                {
                    tag: 'text',
                    styleKey: 'cardTitle',
                    children: ['Title'],
                },
            ],
            [],
            resources
        )

        expect(svg).toContain(
            '<text fill="#0969da" font="500 12px sans-serif" class="card-title" x="2">Title</text>'
        )
    })

    it('resolves basedOn inheritance before node overrides', () => {
        const node: SvgNode = {
            tag: 'text',
            styleKey: 'cardTitle',
            attrs: { fill: '#222222' },
            style: { x: 8 },
        }

        expect(resolveNodeResource(node, resources)).toEqual({
            attrs: {
                fill: '#0969da',
                font: '500 12px sans-serif',
                class: 'card-title',
            },
            layout: {
                x: 2,
                height: 10,
                marginBottom: 12,
            },
        })

        const svg = compileSvg([node], [], resources)
        expect(svg).toContain('fill="#222222"')
        expect(svg).toContain('x="8"')
    })

    it('rejects circular basedOn chains', () => {
        expect(() =>
            compileSvg([{ tag: 'text', styleKey: 'circularA' }], [], resources)
        ).toThrow('Circular SVG style resource inheritance')
    })
})

describe('SVG compiler layout', () => {
    it('applies parent padding to child relative coordinates', () => {
        const svg = compileSvg([
            {
                tag: 'g',
                style: { padding: '8, 4' },
                children: [
                    {
                        tag: 'text',
                        style: { x: 1, y: 2 },
                        children: ['Hi'],
                    },
                ],
            },
        ])

        expect(svg).toContain('transform="translate(0, 0)"')
        expect(svg).toContain('<text x="5" y="10">Hi</text>')
    })

    it('uses margins and height to flow children vertically', () => {
        const svg = compileSvg([
            {
                tag: 'g',
                children: [
                    {
                        tag: 'rect',
                        style: { width: 10, height: 8, marginBottom: 6 },
                    },
                    {
                        tag: 'rect',
                        style: { width: 10, height: 8 },
                    },
                ],
            },
        ])

        expect(svg).toContain('<rect width="10" height="8"></rect>')
        expect(svg).toContain('<rect width="10" height="8" y="14"></rect>')
    })

    it('keeps explicit child coordinates relative to parent groups', () => {
        const svg = compileSvg([
            {
                tag: 'g',
                style: { x: 20, y: 30 },
                children: [
                    {
                        tag: 'rect',
                        style: { x: 3, y: 4, width: 10, height: 8 },
                    },
                ],
            },
        ])

        expect(svg).toContain('transform="translate(20, 30)"')
        expect(svg).toContain('<rect width="10" height="8" x="3" y="4">')
    })

    it('applies selector styles before compiling positions', () => {
        const svg = compileSvg(
            [
                {
                    tag: 'rect',
                    selectors: ['.surface'],
                    style: { y: 4 },
                },
            ],
            [{ selector: '.surface', style: { x: 12, width: 20, height: 10 } }]
        )

        expect(svg).toContain(
            '<rect class="surface" width="20" height="10" x="12" y="4">'
        )
    })

    it('uses styleKey resources for reusable layout', () => {
        const svg = compileSvg(
            [
                {
                    tag: 'g',
                    styleKey: 'stackItem',
                    children: [{ tag: 'text', children: ['Row'] }],
                },
                {
                    tag: 'g',
                    styleKey: 'stackItem',
                    children: [{ tag: 'text', children: ['Next'] }],
                },
            ],
            [],
            {
                stackItem: {
                    attrs: { class: 'stack-item' },
                    layout: { height: 10, marginBottom: 5 },
                },
            }
        )

        expect(svg).toContain('class="stack-item" transform="translate(0, 0)"')
        expect(svg).toContain('class="stack-item" transform="translate(0, 15)"')
    })
})
