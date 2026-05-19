export const cardLayout = {
    padding: 24,
    paddingBottom: 16,
    titleFontSize: 18,
    titleBaselineOffset: 18,
    titleToContentGap: 34,
} as const

export function titleBlockHeight(hideTitle: boolean): number {
    return hideTitle
        ? 0
        : cardLayout.titleBaselineOffset + cardLayout.titleToContentGap
}

export function estimateTextWidth(text: string, fontSize: number): number {
    return Math.ceil(text.length * fontSize * 0.56)
}
