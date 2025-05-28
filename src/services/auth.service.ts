import { UserService } from "./user.service"
import { RefreshTokenRepository } from "../repositories/refreshToken.repository"
import { PasswordResetTokenRepository } from "../repositories/passwordResetToken.repository"
import { JwtUtil } from "../utils/jwt"
import { AuthTokens } from "../types"
import {
    AuthenticationError,
    NotFoundError,
    ValidationError
} from "../utils/errors"
import { logger } from "../config/logger"

export class AuthService {
    private userService: UserService
    private refreshTokenRepository: RefreshTokenRepository
    private passwordResetTokenRepository: PasswordResetTokenRepository

    constructor() {
        this.userService = new UserService()
        this.refreshTokenRepository = new RefreshTokenRepository()
        this.passwordResetTokenRepository = new PasswordResetTokenRepository()
    }

    async signup(
        userData: {
            name: string
            email: string
            password: string
        },
        clientInfo: { ipAddress?: string; userAgent?: string } = {}
    ) {
        try {
            // Create user
            const user = await this.userService.createUser(userData)

            // Generate tokens
            const tokens = JwtUtil.generateTokens({
                userId: user.id,
                email: user.email
            })

            // Store refresh token
            await this.storeRefreshToken(
                tokens.refreshToken,
                user.id,
                clientInfo.ipAddress,
                clientInfo.userAgent
            )

            // Update last login
            await this.userService.updateLastLogin(user.id)

            logger.info(`User registered successfully: ${user.email}`)

            return {
                user,
                tokens
            }
        } catch (error) {
            logger.error(`Registration failed for ${userData.email}:`, error)
            throw error
        }
    }

    async login(
        email: string,
        password: string,
        clientInfo: { ipAddress?: string; userAgent?: string } = {}
    ) {
        try {
            // Validate credentials
            const user = await this.userService.validateCredentials(
                email,
                password
            )

            // Generate tokens
            const tokens = JwtUtil.generateTokens({
                userId: user.id,
                email: user.email
            })

            // Store refresh token
            await this.storeRefreshToken(
                tokens.refreshToken,
                user.id,
                clientInfo.ipAddress,
                clientInfo.userAgent
            )

            // Update last login
            await this.userService.updateLastLogin(user.id)

            logger.info(`User logged in successfully: ${user.email}`)

            return {
                user,
                tokens
            }
        } catch (error) {
            logger.error(`Login failed for ${email}:`, error)
            throw error
        }
    }

    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        try {
            // Verify refresh token
            const payload = JwtUtil.verifyRefreshToken(refreshToken)

            // Find token in database
            const storedToken = await this.refreshTokenRepository.findByToken(
                refreshToken
            )
            if (!storedToken || storedToken.isRevoked) {
                throw new AuthenticationError("Invalid refresh token")
            }

            // Check if token is expired
            if (storedToken.expiresAt < new Date()) {
                await this.refreshTokenRepository.revokeToken(refreshToken)
                throw new AuthenticationError("Refresh token expired")
            }

            // Verify user still exists and is active
            const user = await this.userService.findById(payload.userId)
            if (!user || !user.isActive) {
                throw new AuthenticationError("User not found or inactive")
            }

            // Generate new tokens
            const newTokens = JwtUtil.generateTokens({
                userId: user.id,
                email: user.email
            })

            // Revoke old refresh token
            await this.refreshTokenRepository.revokeToken(refreshToken)

            // Store new refresh token
            await this.storeRefreshToken(
                newTokens.refreshToken,
                user.id,
                storedToken.ipAddress,
                storedToken.userAgent
            )

            logger.info(`Tokens refreshed for user: ${user.email}`)

            return newTokens
        } catch (error) {
            logger.error("Token refresh failed:", error)
            throw error
        }
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            // Revoke the refresh token
            await this.refreshTokenRepository.revokeToken(refreshToken)

            logger.info("User logged out successfully")
        } catch (error) {
            logger.error("Logout failed:", error)
            throw error
        }
    }

    async logoutAll(userId: string): Promise<void> {
        try {
            // Revoke all refresh tokens for the user
            await this.refreshTokenRepository.revokeAllUserTokens(userId)

            logger.info(`All sessions revoked for user: ${userId}`)
        } catch (error) {
            logger.error("Logout all failed:", error)
            throw error
        }
    }

    async forgotPassword(
        email: string
    ): Promise<{ token: string; message: string }> {
        try {
            // Find user
            const user = await this.userService.findByEmail(email)
            if (!user) {
                // Don't reveal if user exists or not
                return {
                    token: "",
                    message:
                        "If an account with that email exists, a password reset link has been sent."
                }
            }

            if (!user.isActive) {
                throw new ValidationError("User account is deactivated")
            }

            // Generate reset token
            const resetToken = JwtUtil.generateSecureToken()
            const jwtToken = JwtUtil.generatePasswordResetToken({
                userId: user.id,
                email: user.email
            })

            // Store reset token
            const expiresAt = new Date()
            expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

            await this.passwordResetTokenRepository.create({
                token: resetToken,
                userId: user.id,
                expiresAt
            })

            logger.info(`Password reset requested for user: ${user.email}`)

            // In a real application, you would send an email here
            // For this mock implementation, we return the token
            return {
                token: resetToken,
                message: "Password reset token generated successfully"
            }
        } catch (error) {
            logger.error(`Password reset failed for ${email}:`, error)
            throw error
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            // Find token in database
            const resetToken =
                await this.passwordResetTokenRepository.findByToken(token)
            if (!resetToken || resetToken.isUsed) {
                throw new AuthenticationError("Invalid or expired reset token")
            }

            // Check if token is expired
            if (resetToken.expiresAt < new Date()) {
                throw new AuthenticationError("Reset token expired")
            }

            // Update user password
            await this.userService.updatePassword(
                resetToken.userId,
                newPassword
            )

            // Mark token as used
            await this.passwordResetTokenRepository.markAsUsed(token)

            // Revoke all refresh tokens for security
            await this.refreshTokenRepository.revokeAllUserTokens(
                resetToken.userId
            )

            logger.info(
                `Password reset successfully for user: ${resetToken.user.email}`
            )
        } catch (error) {
            logger.error("Password reset failed:", error)
            throw error
        }
    }

    private async storeRefreshToken(
        token: string,
        userId: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<void> {
        const payload = JwtUtil.verifyRefreshToken(token)
        const expiresAt = new Date(payload.exp! * 1000)

        await this.refreshTokenRepository.create({
            token,
            userId,
            expiresAt,
            ipAddress,
            userAgent
        })
    }

    async getUserActiveSessions(userId: string) {
        return this.refreshTokenRepository.findActiveTokensByUser(userId)
    }

    async cleanupExpiredTokens(): Promise<void> {
        await this.refreshTokenRepository.cleanExpiredTokens()
        await this.passwordResetTokenRepository.deleteExpiredTokens()
    }
}
