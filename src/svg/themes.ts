export const themeNames = [
    'default',
    'dark',
    'github',
    'tokyonight',
    'radical',
    'merko',
    'gruvbox',
    'onedark',
    'cobalt',
] as const

export type CardThemeName = (typeof themeNames)[number]

export type CardTheme = {
    titleColor: string
    textColor: string
    mutedTextColor: string
    iconColor: string
    ringColor: string
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
        iconColor: '#4c71f2',
        ringColor: '#4c71f2',
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
        iconColor: '#79ff97',
        ringColor: '#79ff97',
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
        iconColor: '#24292f',
        ringColor: '#1f883d',
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
        iconColor: '#bb9af7',
        ringColor: '#7aa2f7',
        bgColor: '#1a1b26',
        borderColor: '#414868',
        accentColor: '#bb9af7',
        barBgColor: '#292e42',
        errorColor: '#f7768e',
    },
    radical: {
        titleColor: '#fe428e',
        textColor: '#a9fef7',
        mutedTextColor: '#a9fef7',
        iconColor: '#f8d847',
        ringColor: '#fe428e',
        bgColor: '#141321',
        borderColor: '#30363d',
        accentColor: '#fe428e',
        barBgColor: '#30363d',
        errorColor: '#ff7b72',
    },
    merko: {
        titleColor: '#abd200',
        textColor: '#68b587',
        mutedTextColor: '#68b587',
        iconColor: '#b7d364',
        ringColor: '#abd200',
        bgColor: '#0a0f0b',
        borderColor: '#30363d',
        accentColor: '#abd200',
        barBgColor: '#30363d',
        errorColor: '#ff7b72',
    },
    gruvbox: {
        titleColor: '#fabd2f',
        textColor: '#8ec07c',
        mutedTextColor: '#8ec07c',
        iconColor: '#fe8019',
        ringColor: '#fabd2f',
        bgColor: '#282828',
        borderColor: '#504945',
        accentColor: '#fabd2f',
        barBgColor: '#504945',
        errorColor: '#fb4934',
    },
    onedark: {
        titleColor: '#e4bf7a',
        textColor: '#df6d74',
        mutedTextColor: '#df6d74',
        iconColor: '#8eb573',
        ringColor: '#e4bf7a',
        bgColor: '#282c34',
        borderColor: '#3e4451',
        accentColor: '#e4bf7a',
        barBgColor: '#3e4451',
        errorColor: '#e06c75',
    },
    cobalt: {
        titleColor: '#e683d9',
        textColor: '#75eeb2',
        mutedTextColor: '#75eeb2',
        iconColor: '#0480ef',
        ringColor: '#e683d9',
        bgColor: '#193549',
        borderColor: '#254b66',
        accentColor: '#e683d9',
        barBgColor: '#254b66',
        errorColor: '#ff628c',
    },
}

export type ThemeOverrides = {
    titleColor?: string
    textColor?: string
    iconColor?: string
    ringColor?: string
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
        iconColor: overrides.iconColor ?? theme.iconColor,
        ringColor: overrides.ringColor ?? theme.ringColor,
        bgColor: overrides.bgColor ?? theme.bgColor,
        borderColor: overrides.borderColor ?? theme.borderColor,
    }
}
