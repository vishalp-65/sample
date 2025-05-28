import jwt from "jsonwebtoken"
import crypto from "crypto"
import { config } from "../config/config"
import { JwtPayload, AuthTokens } from "../types"
import { AuthenticationError } from "./errors"

export class JwtUtil {
    static generateTokens(payload: {
        userId: string
        email: string
    }): AuthTokens {
        const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
            expiresIn: config.jwt.accessExpiresIn
        })

        const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn
        })

        return { accessToken, refreshToken }
    }

    static verifyAccessToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.jwt.accessSecret) as JwtPayload
        } catch (error) {
            throw new AuthenticationError("Invalid or expired access token")
        }
    }

    static verifyRefreshToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload
        } catch (error) {
            throw new AuthenticationError("Invalid or expired refresh token")
        }
    }

    static generatePasswordResetToken(payload: {
        userId: string
        email: string
    }): string {
        return jwt.sign(payload, config.passwordReset.secret, {
            expiresIn: config.passwordReset.expiresIn
        })
    }

    static verifyPasswordResetToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.passwordReset.secret) as JwtPayload
        } catch (error) {
            throw new AuthenticationError(
                "Invalid or expired password reset token"
            )
        }
    }

    static generateSecureToken(): string {
        return crypto.randomBytes(32).toString("hex")
    }
}
