export class AppError extends Error {
    constructor(
        message: string,
        public readonly secondaryMessage?: string
    ) {
        super(message)
        this.name = 'AppError'
    }
}

export class QueryError extends AppError {
    constructor(message: string) {
        super(message)
        this.name = 'QueryError'
    }
}

export class GitHubError extends AppError {
    constructor(message: string, secondaryMessage?: string) {
        super(message, secondaryMessage)
        this.name = 'GitHubError'
    }
}

export type DisplayError = {
    message: string
    secondaryMessage?: string
}

export function toDisplayError(error: unknown): DisplayError {
    if (error instanceof AppError) {
        return {
            message: error.message,
            secondaryMessage: error.secondaryMessage,
        }
    }

    if (error instanceof Error) {
        return { message: error.message }
    }

    return { message: 'Something went wrong' }
}
