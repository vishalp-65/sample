import rateLimit from "express-rate-limit"
import { config } from "../config/config"
import { RateLimitError } from "../utils/errors"

export const createRateLimit = (windowMs?: number, max?: number) => {
    return rateLimit({
        windowMs: windowMs || config.rateLimit.windowMs,
        max: max || config.rateLimit.maxRequests,
        message: "Too many requests from this IP, please try again later",
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
            next(new RateLimitError())
        }
    })
}

// Specific rate limits for auth endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 10) // 10 attempts per 15 minutes
export const generalRateLimit = createRateLimit() // Use default config
