export const themeNames = ['default', 'dark', 'github', 'tokyonight'] as const

export type CardThemeName = (typeof themeNames)[number]

export type CardTheme = {
    titleColor: string
    textColor: string
    mutedTextColor: string
    bgColor: string
    borderColor: string
    accentColor: string
    barBgColor: string
    errorColor: string
}

export const themes: Record<CardThemeName, CardTheme> = {
    default: {
        titleColor: '#0969da',
        textColor: '#24292f',
        mutedTextColor: '#57606a',
        bgColor: '#ffffff',
        borderColor: '#d0d7de',
        accentColor: '#0969da',
        barBgColor: '#d8dee4',
        errorColor: '#cf222e',
    },
    dark: {
        titleColor: '#58a6ff',
        textColor: '#c9d1d9',
        mutedTextColor: '#8b949e',
        bgColor: '#0d1117',
        borderColor: '#30363d',
        accentColor: '#58a6ff',
        barBgColor: '#30363d',
        errorColor: '#ff7b72',
    },
    github: {
        titleColor: '#24292f',
        textColor: '#24292f',
        mutedTextColor: '#57606a',
        bgColor: '#f6f8fa',
        borderColor: '#d0d7de',
        accentColor: '#1f883d',
        barBgColor: '#d8dee4',
        errorColor: '#cf222e',
    },
    tokyonight: {
        titleColor: '#7aa2f7',
        textColor: '#c0caf5',
        mutedTextColor: '#9aa5ce',
        bgColor: '#1a1b26',
        borderColor: '#414868',
        accentColor: '#bb9af7',
        barBgColor: '#292e42',
        errorColor: '#f7768e',
    },
}

export type ThemeOverrides = {
    titleColor?: string
    textColor?: string
    bgColor?: string
    borderColor?: string
}

export function resolveTheme(
    name: CardThemeName,
    overrides: ThemeOverrides = {}
): CardTheme {
    const theme = themes[name]
    return {
        ...theme,
        titleColor: overrides.titleColor ?? theme.titleColor,
        textColor: overrides.textColor ?? theme.textColor,
        bgColor: overrides.bgColor ?? theme.bgColor,
        borderColor: overrides.borderColor ?? theme.borderColor,
    }
}
