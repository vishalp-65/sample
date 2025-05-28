import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const configSchema = z.object({
    nodeEnv: z
        .enum(["development", "production", "test"])
        .default("development"),
    port: z.coerce.number().default(3000),
    database: z.object({
        host: z.string().default("localhost"),
        port: z.coerce.number().default(3306),
        username: z.string().default("root"),
        password: z.string().default(""),
        database: z.string().default("auth_service")
    }),
    jwt: z.object({
        accessSecret: z.string().min(32),
        refreshSecret: z.string().min(32),
        accessExpiresIn: z.string().default("15m"),
        refreshExpiresIn: z.string().default("7d")
    }),
    passwordReset: z.object({
        secret: z.string().min(32),
        expiresIn: z.string().default("1h")
    }),
    rateLimit: z.object({
        windowMs: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
        maxRequests: z.coerce.number().default(100)
    })
})

const rawConfig = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    },
    passwordReset: {
        secret: process.env.PASSWORD_RESET_SECRET,
        expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN
    },
    rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS
    }
}

export const config = configSchema.parse(rawConfig)
