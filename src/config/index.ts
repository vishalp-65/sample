import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// This configuration module centralizes all application settings
// It provides type-safe access to environment variables with sensible defaults
// This approach ensures consistent configuration across the entire application
export const config = {
    // Server configuration
    server: {
        port: parseInt(process.env.PORT || "3000"),
        env: process.env.NODE_ENV || "development",
        isDevelopment: process.env.NODE_ENV === "development",
        isProduction: process.env.NODE_ENV === "production",
        isTest: process.env.NODE_ENV === "test"
    },

    // Database configuration
    database: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306"),
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_DATABASE || "auth_comment_db"
    },

    // JWT configuration for secure token management
    jwt: {
        accessSecret:
            process.env.JWT_ACCESS_SECRET || "your-super-secret-access-key",
        refreshSecret:
            process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key",
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

        // Helper methods to get expiration times in milliseconds
        getAccessExpirationMs(): number {
            return this.parseTimeToMs(this.accessExpiresIn)
        },

        getRefreshExpirationMs(): number {
            return this.parseTimeToMs(this.refreshExpiresIn)
        },

        // Parse time strings like '15m', '7d', '1h' to milliseconds
        parseTimeToMs(timeString: string): number {
            const unit = timeString.slice(-1)
            const value = parseInt(timeString.slice(0, -1))

            switch (unit) {
                case "s":
                    return value * 1000
                case "m":
                    return value * 60 * 1000
                case "h":
                    return value * 60 * 60 * 1000
                case "d":
                    return value * 24 * 60 * 60 * 1000
                default:
                    return parseInt(timeString) // Assume milliseconds if no unit
            }
        }
    },

    // Password reset configuration
    passwordReset: {
        expiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || "1h",
        getExpirationMs(): number {
            return config.jwt.parseTimeToMs(this.expiresIn)
        }
    },

    // Security configuration
    security: {
        // Password requirements
        password: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false // Made optional for better UX
        },

        // Account lockout settings
        accountLockout: {
            maxFailedAttempts: 5,
            lockoutDurationMs: 30 * 60 * 1000 // 30 minutes
        },

        // Rate limiting configuration
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),

            // Specific limits for sensitive endpoints
            auth: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                maxRequests: 10 // More restrictive for auth endpoints
            },

            passwordReset: {
                windowMs: 60 * 60 * 1000, // 1 hour
                maxRequests: 3 // Very restrictive for password reset
            }
        },

        // CORS configuration
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "X-Requested-With"
            ]
        }
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || "info",
        file: process.env.LOG_FILE || "logs/app.log",

        // Log rotation settings
        maxSize: "10m",
        maxFiles: "5",

        // What to log in different environments
        logQueries: process.env.NODE_ENV === "development",
        logErrors: true,
        logRequests: true
    },

    // Application-specific settings
    app: {
        name: "Auth Comment Service",
        version: "1.0.0",
        description: "Authentication and Comment Permission Service",

        // API versioning
        apiVersion: "v1",
        apiPrefix: "/api/v1",

        // Pagination defaults
        pagination: {
            defaultLimit: 20,
            maxLimit: 100
        },

        // Comment settings
        comments: {
            maxLength: 2000,
            minLength: 1,
            allowHtml: false // For security, we don't allow HTML in comments
        }
    }
}

// Validation function to ensure all required environment variables are set
export const validateConfig = (): void => {
    const requiredEnvVars = [
        "JWT_ACCESS_SECRET",
        "JWT_REFRESH_SECRET",
        "DB_HOST",
        "DB_USERNAME",
        "DB_PASSWORD",
        "DB_DATABASE"
    ]

    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
    )

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(", ")}`
        )
    }

    // Validate JWT secrets are sufficiently complex in production
    if (config.server.isProduction) {
        if (config.jwt.accessSecret.length < 32) {
            throw new Error(
                "JWT_ACCESS_SECRET must be at least 32 characters in production"
            )
        }
        if (config.jwt.refreshSecret.length < 32) {
            throw new Error(
                "JWT_REFRESH_SECRET must be at least 32 characters in production"
            )
        }
    }
}

// Export individual config sections for convenience
export const { server, database, jwt, security, logging, app } = config
