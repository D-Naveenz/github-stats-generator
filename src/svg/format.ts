export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en', {
        notation: value >= 1000 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
    }).format(value)
}

export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`
}
