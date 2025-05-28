import httpStatus from "http-status"

export class AppError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean

    constructor(
        message: string,
        statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
        isOperational: boolean = true
    ) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = isOperational

        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, httpStatus.BAD_REQUEST)
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = "Authentication failed") {
        super(message, httpStatus.UNAUTHORIZED)
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = "Access denied") {
        super(message, httpStatus.FORBIDDEN)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, httpStatus.NOT_FOUND)
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Resource already exists") {
        super(message, httpStatus.CONFLICT)
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = "Too many requests") {
        super(message, httpStatus.TOO_MANY_REQUESTS)
    }
}
