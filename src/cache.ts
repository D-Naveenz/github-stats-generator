import type { Response } from 'express'
import type { AppConfig } from './config.js'

const SUCCESS_CACHE_SECONDS = 60 * 60 * 24
const ERROR_CACHE_SECONDS = 60 * 10

function setSvgContentType(res: Response): void {
    res.status(200)
    res.type('image/svg+xml')
}

function disableCaching(res: Response): void {
    res.setHeader(
        'Cache-Control',
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
    )
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
}

export function setSuccessSvgHeaders(res: Response, config: AppConfig): void {
    setSvgContentType(res)

    if (config.nodeEnv === 'development') {
        disableCaching(res)
        return
    }

    res.setHeader(
        'Cache-Control',
        `public, max-age=0, s-maxage=${SUCCESS_CACHE_SECONDS}, stale-while-revalidate=${SUCCESS_CACHE_SECONDS}`
    )
}

export function setErrorSvgHeaders(res: Response, config: AppConfig): void {
    setSvgContentType(res)

    if (config.nodeEnv === 'development') {
        disableCaching(res)
        return
    }

    res.setHeader(
        'Cache-Control',
        `public, max-age=0, s-maxage=${ERROR_CACHE_SECONDS}, stale-while-revalidate=${SUCCESS_CACHE_SECONDS}`
    )
}
