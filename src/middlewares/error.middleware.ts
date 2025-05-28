import { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"
import { AppError } from "../utils/errors"
import { logger } from "../config/logger"
import { config } from "../config/config"

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR
    let message = "Internal server error"
    let isOperational = false

    if (error instanceof AppError) {
        statusCode = error.statusCode
        message = error.message
        isOperational = error.isOperational
    } else if (error.name === "ValidationError") {
        statusCode = httpStatus.BAD_REQUEST
        message = error.message
        isOperational = true
    } else if (error.name === "CastError") {
        statusCode = httpStatus.BAD_REQUEST
        message = "Invalid resource ID"
        isOperational = true
    } else if (error.name === "JsonWebTokenError") {
        statusCode = httpStatus.UNAUTHORIZED
        message = "Invalid token"
        isOperational = true
    } else if (error.name === "TokenExpiredError") {
        statusCode = httpStatus.UNAUTHORIZED
        message = "Token expired"
        isOperational = true
    }

    // Log error
    if (!isOperational || statusCode >= 500) {
        logger.error({
            message: error.message,
            stack: error.stack,
            url: req.url,
            method: req.method,
            ip: req.ip,
            statusCode
        })
    }

    // Send error response
    const response: any = {
        success: false,
        message,
        statusCode
    }

    // Include stack trace in development
    if (config.nodeEnv === "development") {
        response.stack = error.stack
    }

    res.status(statusCode).json(response)
}

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const error = new AppError(
        `Route ${req.originalUrl} not found`,
        httpStatus.NOT_FOUND
    )
    next(error)
}
